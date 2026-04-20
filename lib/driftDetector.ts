/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STATE DRIFT DETECTION ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Pure function module — compares event-reconstructed state against the
 * current live policy to detect "drift" — mutations that occurred outside
 * the event stream (direct DB edits, out-of-band API calls, etc.).
 *
 * In a Guidewire production system, drift indicates:
 * - Manual database overrides by DBAs
 * - Batch update jobs that bypass the event pipeline
 * - Integration errors from external systems (BillingCenter, etc.)
 * - Potential data tampering or fraud
 *
 * DETERMINISM: Pure comparison. Same inputs → same outputs.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Policy } from '@/types/policy';
import { DriftResult } from '@/types/event';

/** Fields to compare during drift detection */
const DRIFT_FIELDS: (keyof Policy)[] = ['id', 'name', 'premium', 'coverageLimit', 'status'];

/**
 * Compares reconstructed policy state against current policy state.
 * Returns field-level MATCH/MISMATCH results.
 *
 * @param reconstructedState - State rebuilt from event replay
 * @param currentPolicy      - Current live policy from the store
 * @returns Object with boolean flag and per-field results
 *
 * SCALABILITY: This runs per-policy. In a production system with millions
 * of policies, drift detection would be scheduled as a batch job that
 * partitions by policyId and runs checks in parallel.
 */
export function detectDrift(
  reconstructedState: Policy | Record<string, any>,
  currentPolicy: Policy
): { driftDetected: boolean; results: DriftResult[] } {
  const results: DriftResult[] = [];
  let driftDetected = false;

  for (const field of DRIFT_FIELDS) {
    const reconstructedValue = reconstructedState[field];
    const currentValue = currentPolicy[field];

    // Normalize numeric comparisons to avoid type coercion issues
    let isMatch: boolean;
    if (field === 'premium' || field === 'coverageLimit') {
      isMatch = Number(reconstructedValue) === Number(currentValue);
    } else {
      isMatch = String(reconstructedValue ?? '') === String(currentValue ?? '');
    }

    const status = isMatch ? 'MATCH' : 'MISMATCH';
    if (!isMatch) driftDetected = true;

    results.push({
      field,
      current: currentValue,
      reconstructed: reconstructedValue,
      status,
    });
  }

  return { driftDetected, results };
}
