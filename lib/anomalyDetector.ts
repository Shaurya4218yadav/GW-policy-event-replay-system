/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ANOMALY DETECTION ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Pure function module — NO side effects, NO state, NO I/O.
 * Given a previous state, next state, and the event that caused the
 * transition, detects suspicious patterns that may indicate fraud,
 * system errors, or data integrity violations.
 *
 * Detection Rules:
 * ┌─────────────────────┬───────────────────────────────────────────────┬──────────┐
 * │ Rule                │ Trigger                                       │ Severity │
 * ├─────────────────────┼───────────────────────────────────────────────┼──────────┤
 * │ PREMIUM_SPIKE       │ Premium Δ > 40% without coverage change       │ HIGH     │
 * │ INVALID_TRANSITION  │ Illegal status progression                    │ HIGH     │
 * │ MISSING_DEPENDENCY  │ CLAIM_APPROVED w/o prior CLAIM_REPORTED       │ MEDIUM   │
 * │ DUPLICATE_EVENT     │ Same event ID processed twice                 │ MEDIUM   │
 * │ OUT_OF_ORDER        │ Event timestamp precedes previous event       │ LOW      │
 * └─────────────────────┴───────────────────────────────────────────────┴──────────┘
 *
 * SCALABILITY: Each rule is independent and stateless. In production,
 * rules can be evaluated in parallel across partitions. New rules are
 * added by appending to the detection pipeline — no existing logic changes.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Policy } from '@/types/policy';
import { ReplayEvent, Anomaly } from '@/types/event';

// ── Valid Status Transition Matrix ───────────────────────────────────────
// Defines the legal state machine for policy lifecycle.
// Any transition NOT in this map is flagged as INVALID_TRANSITION.
const VALID_TRANSITIONS: Record<string, string[]> = {
  'Draft':          ['Quoted', 'Active', 'Cancelled'],
  'Quoted':         ['Active', 'Cancelled', 'Draft', 'Quoted'],
  'Active':         ['Cancelled', 'Claim Open', 'Active'],    // Active→Active via endorsement
  'Cancelled':      ['Reinstated'],                             // Can only reinstate
  'Reinstated':     ['Active', 'Cancelled'],
  'Claim Open':     ['Claim Approved', 'Active', 'Cancelled'],
  'Claim Approved': ['Active', 'Cancelled', 'Claim Open'],
};

/**
 * Core anomaly detection — analyzes a single state transition.
 *
 * @param prevState  - Policy state BEFORE the event (null for first event)
 * @param nextState  - Policy state AFTER the event was applied
 * @param event      - The event that caused the transition
 * @returns Array of detected anomalies (empty if transition is clean)
 *
 * DETERMINISM: This function is pure. Same inputs → same outputs.
 * No randomness, no timestamps, no external state.
 */
export function detectAnomalies(
  prevState: Policy | null,
  nextState: Policy,
  event: ReplayEvent
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // ── Rule 1: Premium Spike Detection ──────────────────────────────────
  // Flags premium changes > 40% that don't correlate with coverage changes.
  // In Guidewire: this would catch unauthorized premium overrides or
  // miscalculated rating engine outputs.
  if (prevState && prevState.premium > 0) {
    const premiumDelta = Math.abs(nextState.premium - prevState.premium);
    const premiumChangePercent = (premiumDelta / prevState.premium) * 100;
    const coverageChanged = prevState.coverageLimit !== nextState.coverageLimit;

    if (premiumChangePercent > 40 && !coverageChanged) {
      anomalies.push({
        type: 'PREMIUM_SPIKE',
        severity: 'HIGH',
        message: `Premium changed by ${premiumChangePercent.toFixed(1)}% (${prevState.premium} → ${nextState.premium}) without corresponding coverage change. Potential rating error or unauthorized override.`,
        eventId: event.id,
      });
    }
  }

  // ── Rule 2: Invalid Status Transition ────────────────────────────────
  // Enforces the policy lifecycle state machine.
  // In Guidewire: maps to PolicyCenter's workflow validation rules.
  if (prevState && prevState.status !== nextState.status) {
    const allowedTransitions = VALID_TRANSITIONS[prevState.status] || [];
    if (!allowedTransitions.includes(nextState.status)) {
      anomalies.push({
        type: 'INVALID_TRANSITION',
        severity: 'HIGH',
        message: `Invalid status transition: "${prevState.status}" → "${nextState.status}". Allowed transitions from "${prevState.status}": [${allowedTransitions.join(', ')}].`,
        eventId: event.id,
      });
    }
  }

  // ── Rule 3: Missing Dependency ───────────────────────────────────────
  // CLAIM_APPROVED requires a prior CLAIM_REPORTED in the same stream.
  // This rule is evaluated contextually during replay (see replayEngine).
  // Here we check if the event is CLAIM_APPROVED on a non-claim state.
  if (event.type === 'CLAIM_APPROVED' && prevState && prevState.status !== 'Claim Open') {
    anomalies.push({
      type: 'MISSING_DEPENDENCY',
      severity: 'MEDIUM',
      message: `CLAIM_APPROVED event received but policy status is "${prevState.status}", not "Claim Open". Missing prerequisite CLAIM_REPORTED event.`,
      eventId: event.id,
    });
  }

  return anomalies;
}

/**
 * Detects duplicate events in a stream.
 * Should be called with the full event set during replay.
 *
 * @param events - The complete event stream to analyze
 * @returns Array of anomalies for any duplicate event IDs
 */
export function detectDuplicateEvents(events: ReplayEvent[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const seenIds = new Set<string>();

  for (const event of events) {
    if (seenIds.has(event.id)) {
      anomalies.push({
        type: 'DUPLICATE_EVENT',
        severity: 'MEDIUM',
        message: `Duplicate event detected: ID "${event.id}" (type: ${event.type}) appears multiple times in the stream. This may indicate replay corruption or duplicate ingestion.`,
        eventId: event.id,
      });
    }
    seenIds.add(event.id);
  }

  return anomalies;
}

/**
 * Detects out-of-order events in a stream.
 * Events should be monotonically increasing by timestamp (and sequence).
 *
 * @param events - The event stream (should be in intended order)
 * @returns Array of anomalies for out-of-order events
 */
export function detectOutOfOrderEvents(events: ReplayEvent[]): Anomaly[] {
  const anomalies: Anomaly[] = [];

  for (let i = 1; i < events.length; i++) {
    const prevTime = new Date(events[i - 1].timestamp).getTime();
    const currTime = new Date(events[i].timestamp).getTime();

    if (currTime < prevTime) {
      anomalies.push({
        type: 'OUT_OF_ORDER',
        severity: 'LOW',
        message: `Event "${events[i].id}" (${events[i].type}) has timestamp ${events[i].timestamp} which precedes previous event timestamp ${events[i - 1].timestamp}. Events may have been ingested out of order.`,
        eventId: events[i].id,
      });
    }
  }

  return anomalies;
}
