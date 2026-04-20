/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GUIDEWIRE POLICY INTELLIGENCE ENGINE — EVENT TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Core event sourcing types for the audit & replay engine.
 * All types are designed for deterministic reconstruction — the same
 * event stream MUST always produce the same policy state.
 *
 * SCALABILITY NOTE: In a production Guidewire deployment, events would be
 * partitioned by policyId and stored in an append-only log (e.g., Kafka
 * topic per LOB). The types here mirror that partition-key design.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Policy } from './policy';

// ── Event Type Taxonomy ──────────────────────────────────────────────────
// Maps 1:1 to Guidewire PolicyCenter / ClaimCenter transaction types.
// POLICY_REINSTATED added for full lifecycle coverage.
export type EventType =
  | 'POLICY_CREATED'
  | 'POLICY_QUOTED'
  | 'POLICY_BOUND'
  | 'POLICY_ENDORSED'
  | 'POLICY_CANCELLED'
  | 'POLICY_REINSTATED'
  | 'CLAIM_REPORTED'
  | 'CLAIM_APPROVED';

// ── Event Source Classification ──────────────────────────────────────────
// Provenance tracking: who/what generated this event.
// Critical for audit trails in regulated insurance environments.
export type EventSource = 'USER' | 'SYSTEM' | 'EXTERNAL';

// ── Event Metadata ───────────────────────────────────────────────────────
// Correlation and ordering metadata for distributed event processing.
export interface EventMetadata {
  /** Actor who triggered the event (user ID, system process, external API) */
  actor?: string;
  /** Correlation ID for grouping related events across systems */
  correlationId?: string;
  /** Monotonically increasing sequence number within a policy's event stream.
   *  Used for deterministic ordering when timestamps collide.
   *  In production: this would be a Kafka offset or database sequence. */
  sequence?: number;
}

// ── Core Event Model ─────────────────────────────────────────────────────
// The fundamental unit of state change in the system.
// Every mutation to a policy MUST go through an event.
export interface ReplayEvent {
  id: string;
  type: EventType;
  payload?: any;
  timestamp: string;
  /** Policy this event belongs to. Enables multi-policy partitioning.
   *  At scale: this is the partition key for event store sharding. */
  policyId: string;
  /** Who/what generated this event */
  source: EventSource;
  /** Human-readable explanation of why this event occurred.
   *  Critical for audit trails and regulatory compliance. */
  reasoning?: string;
  /** Ordering and correlation metadata */
  metadata?: EventMetadata;
  /** Mapped Guidewire entity (auto-populated during ingestion) */
  guidewireEntity?: string;
}

// ── Causal Trace Log Entry ───────────────────────────────────────────────
// Records exactly what changed and why during replay reconstruction.
// This creates a forensic audit trail that auditors can follow.
export interface TraceLogEntry {
  eventId: string;
  /** Human-readable description: "premium: 1000 → 12000" */
  change: string;
  /** The reasoning from the source event */
  reason?: string;
  /** Sequence position in the replay */
  sequence: number;
}

// ── State Drift Detection ────────────────────────────────────────────────
// Compares reconstructed state against current policy to detect tampering
// or out-of-band modifications that bypassed the event stream.
export interface DriftResult {
  field: string;
  current: any;
  reconstructed: any;
  status: 'MATCH' | 'MISMATCH';
}

// ── Anomaly Classification ───────────────────────────────────────────────
// Categorizes suspicious patterns detected during event replay.
// Severity levels map to Guidewire's risk classification framework.
export type AnomalyType =
  | 'PREMIUM_SPIKE'
  | 'INVALID_TRANSITION'
  | 'MISSING_DEPENDENCY'
  | 'DUPLICATE_EVENT'
  | 'OUT_OF_ORDER';

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Anomaly {
  type: AnomalyType;
  severity: AnomalySeverity;
  message: string;
  eventId: string;
}

// ── Business Impact Analysis ─────────────────────────────────────────────
// Quantifies the financial and risk exposure from drift or anomalies.
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ImpactAnalysis {
  /** Net financial impact in currency units (positive = overpayment/loss) */
  financialImpact: number;
  /** Aggregated risk level from all detected issues */
  riskLevel: RiskLevel;
  /** Human-readable explanation of the impact */
  explanation: string;
}

// ── Event Integrity Score ────────────────────────────────────────────────
// Composite health score for an event stream's integrity.
export type IntegrityStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';

export interface IntegrityScore {
  /** Score from 0-100. 100 = perfectly clean event stream. */
  score: number;
  /** Overall health status */
  status: IntegrityStatus;
}

// ── Snapshot ─────────────────────────────────────────────────────────────
// Point-in-time policy state checkpoint for replay optimization.
// At scale: snapshots eliminate the need to replay millions of events.
// Strategy: snapshot every N events or at business-critical boundaries
// (e.g., policy binding, renewal). Replay from nearest snapshot forward.
export interface Snapshot {
  policyId: string;
  timestamp: string;
  state: Policy;
  /** Index of the last event included in this snapshot */
  eventIndex: number;
}

// ── Replay Result ────────────────────────────────────────────────────────
// Complete output of a deterministic replay operation.
export interface ReplayResult {
  state: any | null;
  steps: Array<{ event: ReplayEvent; resultingState: any }>;
  progression: string[];
  traceLog: TraceLogEntry[];
}

// ── Full Audit Report ────────────────────────────────────────────────────
// Aggregated output from replay + drift + impact + integrity analysis.
export interface AuditReport {
  replay: ReplayResult;
  anomalies: Anomaly[];
  driftResults: DriftResult[];
  driftDetected: boolean;
  impactAnalysis: ImpactAnalysis;
  integrityScore: IntegrityScore;
}
