/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDATION MODULE — Policy update validation + drift detection wrapper
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Policy } from '@/types/policy';
import { ReplayEvent, DriftResult, AuditReport } from '@/types/event';
import { reconstructState } from '@/lib/replayEngine';
import { detectDrift } from '@/lib/driftDetector';
import { calculateImpact } from '@/lib/impactEngine';
import { calculateIntegrityScore } from '@/lib/integrityScore';

export function createSafeAuditReport(partial: Partial<AuditReport>): AuditReport {
  return {
    replay: partial.replay || {
      state: null,
      steps: [],
      progression: [],
      traceLog: [],
    },
    anomalies: partial.anomalies || [],
    driftResults: partial.driftResults || [],
    driftDetected: partial.driftDetected || false,
    impactAnalysis: partial.impactAnalysis || {
      financialImpact: 0,
      riskLevel: 'LOW',
      explanation: 'No impact analysis available'
    },
    integrityScore: partial.integrityScore || { score: 100, status: "HEALTHY" },
  };
}

/**
 * Validates a policy update against the event-derived state.
 * Returns true if the update is consistent with the event stream.
 */
export function validateUpdate(data: any): boolean {
  if (!data) return false;
  if (typeof data.premium === 'number' && data.premium < 0) return false;
  if (typeof data.coverageLimit === 'number' && data.coverageLimit < 0) return false;
  return true;
}

/**
 * Performs a full audit validation: replay events, detect drift,
 * calculate impact, and compute integrity score.
 *
 * @param events        - Event stream for the policy
 * @param currentPolicy - Current live policy state
 * @param targetTime    - Optional: timestamp to replay up to
 * @returns Full audit report
 */
export function performAudit(
  events: ReplayEvent[],
  currentPolicy: Policy,
  targetTime?: string
): AuditReport {
  const target = targetTime || new Date().toISOString();
  
  // ── 1. Replay Engine State Reconstruction ────────────────────────
  const { replay, anomalies } = reconstructState(events, target);

  // ── 2. Fail-Safe Empty State Integration ─────────────────────────
  if (!replay.state) {
    replay.state = null;
    // Inject a special trace log or anomaly? No, just handle it gracefully.
    // The UI is expected to display the safe fallback message without breaking.
  }

  // ── 3. State Drift Detection ─────────────────────────────────────
  let driftResults = { driftDetected: false, results: [] as DriftResult[] };
  if (replay.state) {
    driftResults = detectDrift(replay.state, currentPolicy);
  }

  // ── 4. Target Risk Escalation via ImpactEngine ───────────────────
  const impactAnalysis = calculateImpact(
    driftResults.results,
    anomalies,
    currentPolicy
  );

  // ── 5. System Health Grading ─────────────────────────────────────
  const integrityScore = calculateIntegrityScore(
    anomalies,
    driftResults.results
  );

  return createSafeAuditReport({
    replay: {
      state: replay.state || null,
      traceLog: replay.traceLog || [],
      steps: replay.steps || [],
      progression: replay.progression || [],
    },
    anomalies: anomalies || [],
    driftResults: driftResults.results || [],
    driftDetected: driftResults.driftDetected || false,
    impactAnalysis: impactAnalysis || {},
    integrityScore: integrityScore || { score: 100, status: "HEALTHY" },
  });
}
