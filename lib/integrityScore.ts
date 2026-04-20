/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EVENT INTEGRITY SCORE ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Pure function module — computes a composite health score [0-100] for
 * an event stream based on detected anomalies and drift.
 *
 * Scoring Model:
 * ┌────────────────────┬─────────┐
 * │ Condition          │ Penalty │
 * ├────────────────────┼─────────┤
 * │ HIGH anomaly       │ -25     │
 * │ MEDIUM anomaly     │ -15     │
 * │ LOW anomaly        │ -5      │
 * │ Each MISMATCH      │ -10     │
 * └────────────────────┴─────────┘
 *
 * Status Thresholds:
 *   score >= 80 → HEALTHY
 *   score >= 50 → WARNING
 *   score < 50  → CRITICAL
 *
 * DETERMINISM: Pure function. Same anomalies + drift → same score.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Anomaly, DriftResult, IntegrityScore, IntegrityStatus } from '@/types/event';

/** Penalty weights per anomaly severity */
const SEVERITY_PENALTIES: Record<string, number> = {
  HIGH: 25,
  MEDIUM: 15,
  LOW: 5,
};

/** Penalty per field mismatch */
const MISMATCH_PENALTY = 10;

/** Status thresholds */
const HEALTHY_THRESHOLD = 80;
const WARNING_THRESHOLD = 50;

/**
 * Calculates the integrity score for an event stream.
 *
 * @param anomalies    - All anomalies detected during replay
 * @param driftResults - Per-field drift comparison results
 * @returns IntegrityScore with numeric score and status classification
 *
 * The score starts at 100 (perfect) and is decremented by weighted
 * penalties. It floors at 0 — negative scores are not meaningful.
 *
 * SCALABILITY: This is a post-replay aggregation. In production,
 * scores would be computed per-policy and stored for dashboard queries.
 * A batch process could compute scores across all policies for
 * fleet-wide health monitoring.
 */
export function calculateIntegrityScore(
  anomalies: Anomaly[],
  driftResults: DriftResult[]
): IntegrityScore {
  let score = 100;

  // ── Anomaly Penalties ──────────────────────────────────────────────
  for (const anomaly of anomalies) {
    const penalty = SEVERITY_PENALTIES[anomaly.severity] || 5;
    score -= penalty;
  }

  // ── Drift Penalties ────────────────────────────────────────────────
  for (const result of driftResults) {
    if (result.status === 'MISMATCH') {
      score -= MISMATCH_PENALTY;
    }
  }

  // Floor at 0
  score = Math.max(0, score);

  // ── Status Classification ──────────────────────────────────────────
  let status: IntegrityStatus;
  if (score >= HEALTHY_THRESHOLD) {
    status = 'HEALTHY';
  } else if (score >= WARNING_THRESHOLD) {
    status = 'WARNING';
  } else {
    status = 'CRITICAL';
  }

  return { score, status };
}
