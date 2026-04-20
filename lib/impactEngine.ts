/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BUSINESS IMPACT ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Pure function module — quantifies the financial and risk impact of
 * detected drift and anomalies. Translates technical findings into
 * business-meaningful metrics that underwriters and auditors understand.
 *
 * Impact Categories:
 * ┌────────────────────┬────────────────────────────────────────────────┐
 * │ Category           │ Calculation                                    │
 * ├────────────────────┼────────────────────────────────────────────────┤
 * │ Premium Mismatch   │ Direct financial delta (over/under-charging)   │
 * │ Coverage Mismatch  │ Risk exposure gap (uninsured liability)        │
 * │ Status Mismatch    │ Policy validity/enforceability risk            │
 * │ Anomaly Impact     │ Aggregated severity → risk escalation          │
 * └────────────────────┴────────────────────────────────────────────────┘
 *
 * DETERMINISM: Pure function. Same drift + anomalies → same impact.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Policy } from '@/types/policy';
import { DriftResult, Anomaly, ImpactAnalysis, RiskLevel } from '@/types/event';

/**
 * Calculates the business impact from drift results and anomalies.
 *
 * @param driftResults - Per-field drift comparison results
 * @param anomalies    - Detected anomalies from replay
 * @param policy       - Current policy (for context on financial scale)
 * @returns ImpactAnalysis with financialImpact, riskLevel, explanation
 */
export function calculateImpact(
  driftResults: DriftResult[],
  anomalies: Anomaly[],
  policy: Policy
): ImpactAnalysis {
  let financialImpact = 0;
  let riskLevel: RiskLevel = 'LOW';
  const explanations: string[] = [];

  // ── Premium Drift Impact ───────────────────────────────────────────
  // Direct financial loss/gain from premium mismatches.
  // Positive = overcharging customer, Negative = undercharging (revenue loss).
  const premiumDrift = driftResults.find(d => d.field === 'premium' && d.status === 'MISMATCH');
  if (premiumDrift) {
    const delta = Number(premiumDrift.current) - Number(premiumDrift.reconstructed);
    financialImpact += delta;

    if (delta > 0) {
      explanations.push(
        `Premium overcharge detected: current (${premiumDrift.current}) exceeds reconstructed (${premiumDrift.reconstructed}) by ${Math.abs(delta)}. Customer may be overcharged.`
      );
    } else if (delta < 0) {
      explanations.push(
        `Premium undercharge detected: current (${premiumDrift.current}) is less than reconstructed (${premiumDrift.reconstructed}) by ${Math.abs(delta)}. Revenue leakage risk.`
      );
    }
    riskLevel = escalateRisk(riskLevel, 'MEDIUM');
  }

  // ── Coverage Drift Impact ──────────────────────────────────────────
  // Coverage mismatches create risk exposure — the insurer may be
  // covering more/less than intended per the event history.
  const coverageDrift = driftResults.find(d => d.field === 'coverageLimit' && d.status === 'MISMATCH');
  if (coverageDrift) {
    const coverageDelta = Number(coverageDrift.current) - Number(coverageDrift.reconstructed);
    // Financial exposure = coverage gap. If current > reconstructed,
    // insurer is covering more than the event history supports.
    if (coverageDelta > 0) {
      financialImpact += coverageDelta * 0.01; // 1% of gap as exposure estimate
      explanations.push(
        `Coverage gap detected: current limit (${coverageDrift.current}) exceeds event-derived limit (${coverageDrift.reconstructed}). Exposure: ${Math.abs(coverageDelta)} in unsupported coverage.`
      );
    } else {
      explanations.push(
        `Coverage reduction detected: current limit (${coverageDrift.current}) is below event-derived limit (${coverageDrift.reconstructed}). Customer may be under-insured.`
      );
    }
    riskLevel = escalateRisk(riskLevel, 'MEDIUM');
  }

  // ── Status Drift Impact ────────────────────────────────────────────
  // Status mismatches are always HIGH risk — they affect policy validity.
  const statusDrift = driftResults.find(d => d.field === 'status' && d.status === 'MISMATCH');
  if (statusDrift) {
    explanations.push(
      `Status mismatch: policy shows "${statusDrift.current}" but event history reconstructs to "${statusDrift.reconstructed}". Policy enforceability may be compromised.`
    );
    riskLevel = escalateRisk(riskLevel, 'HIGH');
  }

  // ── Anomaly-Based Impact ───────────────────────────────────────────
  // Aggregate anomaly severity to escalate risk level.
  const highAnomalies = anomalies.filter(a => a.severity === 'HIGH');
  const mediumAnomalies = anomalies.filter(a => a.severity === 'MEDIUM');

  if (highAnomalies.length > 0) {
    riskLevel = escalateRisk(riskLevel, 'HIGH');
    explanations.push(
      `${highAnomalies.length} HIGH severity anomal${highAnomalies.length === 1 ? 'y' : 'ies'} detected: ${highAnomalies.map(a => a.type).join(', ')}.`
    );
  }

  if (mediumAnomalies.length > 0) {
    riskLevel = escalateRisk(riskLevel, 'MEDIUM');
    explanations.push(
      `${mediumAnomalies.length} MEDIUM severity anomal${mediumAnomalies.length === 1 ? 'y' : 'ies'} detected: ${mediumAnomalies.map(a => a.type).join(', ')}.`
    );
  }

  // ── No Issues ──────────────────────────────────────────────────────
  if (explanations.length === 0) {
    explanations.push('No drift or anomalies detected. Event stream integrity verified.');
  }

  return {
    financialImpact: Math.round(financialImpact * 100) / 100, // Round to cents
    riskLevel,
    explanation: explanations.join(' '),
  };
}

/**
 * Risk level escalation — only escalates, never downgrades.
 * LOW < MEDIUM < HIGH
 */
function escalateRisk(current: RiskLevel, incoming: RiskLevel): RiskLevel {
  const levels: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };
  return levels[incoming] > levels[current] ? incoming : current;
}
