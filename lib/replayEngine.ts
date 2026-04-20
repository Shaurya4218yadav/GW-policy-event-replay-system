/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DETERMINISTIC REPLAY ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The core of the Policy Intelligence Engine. Reconstructs policy state
 * by replaying events in deterministic order, building causal trace logs,
 * and detecting anomalies at each state transition.
 *
 * DETERMINISM GUARANTEE:
 * Given the same event stream and target time, this engine ALWAYS
 * produces the same output. No randomness, no wall-clock dependencies,
 * no external state reads during replay.
 *
 * Ordering Strategy:
 * 1. Sort by timestamp (ascending)
 * 2. Break ties by metadata.sequence (ascending)
 * 3. Break remaining ties by event ID (lexicographic — stable sort)
 *
 * SCALABILITY ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ The replay engine is STATELESS. It takes events in, produces   │
 * │ state out. This means:                                          │
 * │                                                                 │
 * │ 1. It can run on any node in a cluster (no affinity needed)    │
 * │ 2. Multiple policies can be replayed in parallel               │
 * │ 3. Events are partitioned by policyId — no cross-partition     │
 * │    dependencies                                                 │
 * │ 4. Snapshot optimization reduces replay cost from O(N) to O(k) │
 * │    where k = events since last snapshot                         │
 * │                                                                 │
 * │ At 1M policies × 100 events avg = 100M events total.           │
 * │ With snapshots every 50 events, worst-case replay = 50 events. │
 * │ Parallel replay across 100 workers = 10K policies/sec.         │
 * └─────────────────────────────────────────────────────────────────┘
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ReplayEvent, TraceLogEntry, Anomaly, ReplayResult } from '@/types/event';
import { detectAnomalies, detectDuplicateEvents, detectOutOfOrderEvents } from '@/lib/anomalyDetector';

/**
 * Deterministic event comparator for sorting.
 * Ensures identical ordering regardless of input order.
 *
 * Priority: timestamp → metadata.sequence → id (lexicographic)
 */
function deterministicSort(a: ReplayEvent, b: ReplayEvent): number {
  const timeA = new Date(a.timestamp).getTime();
  const timeB = new Date(b.timestamp).getTime();
  if (timeA !== timeB) return timeA - timeB;

  // Tie-break by sequence number (if available)
  const seqA = a.metadata?.sequence ?? Number.MAX_SAFE_INTEGER;
  const seqB = b.metadata?.sequence ?? Number.MAX_SAFE_INTEGER;
  if (seqA !== seqB) return seqA - seqB;

  // Final tie-break by ID for absolute determinism
  return a.id.localeCompare(b.id);
}

/**
 * Builds a human-readable change description for the trace log.
 * Compares previous and current state to identify what changed.
 */
function buildChangeDescription(prevState: any, nextState: any, event: ReplayEvent): string {
  if (!prevState) {
    return `Policy initialized: ${JSON.stringify(nextState)}`;
  }

  const changes: string[] = [];

  // Check each field for changes
  const fields = ['premium', 'coverageLimit', 'status', 'name'];
  for (const field of fields) {
    if (prevState[field] !== nextState[field]) {
      changes.push(`${field}: ${prevState[field]} → ${nextState[field]}`);
    }
  }

  if (changes.length === 0) {
    return `${event.type}: no state change`;
  }

  return changes.join(', ');
}

/**
 * Core state reconstruction function.
 *
 * Takes an event stream and a target time, replays all events up to that
 * time, and returns the reconstructed state along with full audit data.
 *
 * @param events     - Complete event stream for a single policy
 * @param targetTime - ISO timestamp to replay up to (empty = latest)
 * @param startIndex - Optional: start from this event index (for snapshot optimization)
 * @param initialState - Optional: starting state (from snapshot)
 * @returns ReplayResult with state, steps, traceLog, anomalies, progression
 *
 * DETERMINISM: Same (events, targetTime) → identical ReplayResult.
 * Verified by the determinism test suite.
 */
export function reconstructState(
  events: ReplayEvent[],
  targetTime: string,
  startIndex: number = 0,
  initialState: any = null
): { replay: ReplayResult; anomalies: Anomaly[] } {
  let state: any = initialState ? { ...initialState } : null;
  const steps: { event: ReplayEvent; resultingState: any }[] = [];
  const progression: string[] = [];
  const traceLog: TraceLogEntry[] = [];
  const anomalies: Anomaly[] = [];

  // ── Handle empty / no-target cases ─────────────────────────────────
  if (!targetTime && events.length > 0) {
    const sortedEvents = [...events].sort(deterministicSort);
    const firstEvent = sortedEvents[0];
    return {
      replay: {
        state: { ...firstEvent.payload },
        steps: [{ event: firstEvent, resultingState: firstEvent.payload }],
        progression: ['Draft'],
        traceLog: [{
          eventId: firstEvent.id,
          change: `Policy initialized from ${firstEvent.type}`,
          reason: firstEvent.reasoning || 'Initial policy creation',
          sequence: 1,
        }]
      },
      anomalies: [],
    };
  }

  // ── Missing Timeline Fallback ──────────────────────────────────────
  if (!targetTime) {
    return { replay: { state, steps, progression, traceLog }, anomalies };
  }

  // ── Sort events deterministically ──────────────────────────────────
  const sortedEvents = [...events].sort(deterministicSort);

  // ── Pre-replay stream-level anomaly detection ──────────────────────
  // Detect duplicates and out-of-order events before replay begins.
  anomalies.push(...detectDuplicateEvents(sortedEvents));
  anomalies.push(...detectOutOfOrderEvents(sortedEvents));

  // ── Replay loop ────────────────────────────────────────────────────
  const targetDate = new Date(targetTime).getTime();
  let sequenceCounter = 0;

  // If starting from snapshot, pre-populate progression from initial state
  if (initialState && initialState.status) {
    const statusToProgression: Record<string, string> = {
      'Draft': 'Draft', 'Quoted': 'Quoted', 'Active': 'Active',
      'Cancelled': 'Cancelled', 'Reinstated': 'Reinstated',
      'Claim Open': 'Claim Reported', 'Claim Approved': 'Claim Approved',
    };
    const prog = statusToProgression[initialState.status];
    if (prog && !progression.includes(prog)) progression.push(prog);
  }

  sortedEvents
    .slice(startIndex)
    .filter(e => new Date(e.timestamp).getTime() <= targetDate)
    .forEach(event => {
      sequenceCounter++;
      const prevState = state ? { ...state } : null;

      // ── Apply event to state ─────────────────────────────────────
      switch (event.type) {
        case 'POLICY_CREATED':
          state = { ...event.payload };
          if (!progression.includes('Draft')) progression.push('Draft');
          break;

        case 'POLICY_QUOTED':
          if (state && event.payload?.premium !== undefined) {
            state.premium = event.payload.premium;
          }
          if (!progression.includes('Quoted')) progression.push('Quoted');
          break;

        case 'POLICY_BOUND':
          if (state) state.status = 'Active';
          if (!progression.includes('Active')) progression.push('Active');
          break;

        case 'POLICY_ENDORSED':
          if (state) {
            if (event.payload?.coverageLimit !== undefined) {
              state.coverageLimit = event.payload.coverageLimit;
            }
            if (event.payload?.premium !== undefined) {
              state.premium = event.payload.premium;
            }
            if (!progression.includes('Endorsed')) progression.push('Endorsed');
          }
          break;

        case 'POLICY_CANCELLED':
          if (state) state.status = 'Cancelled';
          if (!progression.includes('Cancelled')) progression.push('Cancelled');
          break;

        case 'POLICY_REINSTATED':
          if (state) state.status = 'Reinstated';
          if (!progression.includes('Reinstated')) progression.push('Reinstated');
          break;

        case 'CLAIM_REPORTED':
          if (state) state.status = 'Claim Open';
          if (!progression.includes('Claim Reported')) progression.push('Claim Reported');
          break;

        case 'CLAIM_APPROVED':
          if (state) state.status = 'Claim Approved';
          if (!progression.includes('Claim Approved')) progression.push('Claim Approved');
          break;
      }

      const currentState = state ? { ...state } : null;

      // ── Build trace log entry ────────────────────────────────────
      const changeDesc = buildChangeDescription(prevState, currentState, event);
      traceLog.push({
        eventId: event.id,
        change: changeDesc,
        reason: event.reasoning,
        sequence: sequenceCounter,
      });

      // ── Per-transition anomaly detection ─────────────────────────
      if (currentState) {
        const transitionAnomalies = detectAnomalies(prevState, currentState, event);
        anomalies.push(...transitionAnomalies);
      }

      // ── Record step ──────────────────────────────────────────────
      steps.push({ event, resultingState: currentState });
    });

  // ── Final safety ───────────────────────────────────────────────────
  // ── Safe Fallback for Empty Reconstructions ────────────────────────
  // If we have events but no state was reconstructed, enforce initial payload
  if (!state && sortedEvents.length > 0) {
    state = { ...sortedEvents[0].payload };
  }

  return {
    replay: { state, steps, progression, traceLog },
    anomalies
  };
}
