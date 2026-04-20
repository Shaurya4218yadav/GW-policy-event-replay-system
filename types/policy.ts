/**
 * ═══════════════════════════════════════════════════════════════════════════
 * POLICY TYPE DEFINITION
 * ═══════════════════════════════════════════════════════════════════════════
 * Normalized status values — single canonical casing for deterministic
 * state reconstruction. Maps to Guidewire PolicyCenter status codes.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type PolicyStatus =
  | 'Draft'
  | 'Quoted'
  | 'Active'
  | 'Cancelled'
  | 'Reinstated'
  | 'Claim Open'
  | 'Claim Approved';

export interface Policy {
  id: string;
  name: string;
  premium: number;
  coverageLimit: number;
  status: PolicyStatus;
}
