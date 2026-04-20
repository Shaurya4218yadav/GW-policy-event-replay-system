/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MULTI-POLICY EVENT STORE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Persistent JSON-file store with multi-policy support, sequence counters,
 * and snapshot storage. Backward compatible with legacy single-policy shape.
 *
 * SCALABILITY ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ Data is partitioned by policyId:                                │
 * │   policies[policyId]  → Policy state                           │
 * │   events[policyId]    → Append-only event log                  │
 * │   snapshots[policyId] → Point-in-time checkpoints              │
 * │   sequences[policyId] → Monotonic sequence counter             │
 * │                                                                 │
 * │ In production, each partition maps to:                          │
 * │   - A Kafka topic partition (events)                            │
 * │   - A database shard key (policies, snapshots)                  │
 * │   - An independent replay context (no cross-policy deps)       │
 * │                                                                 │
 * │ This file-based store is for development/demo. The partition    │
 * │ structure mirrors what a production deployment would use.       │
 * └─────────────────────────────────────────────────────────────────┘
 * ═══════════════════════════════════════════════════════════════════════════
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Policy } from "@/types/policy";
import { ReplayEvent, Snapshot } from "@/types/event";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../data");
const storeFilePath = path.join(dataDir, "store.json");

// ── Default Policy & Event ───────────────────────────────────────────────

const DEFAULT_POLICY_ID = "POL-001";

const initialPolicy: Policy = {
  id: DEFAULT_POLICY_ID,
  name: "Standard Auto",
  premium: 0,
  coverageLimit: 50000,
  status: "Draft",
};

const initialEvent: ReplayEvent = {
  id: "init-event-001",
  type: "POLICY_CREATED",
  policyId: DEFAULT_POLICY_ID,
  source: "SYSTEM",
  reasoning: "Initial policy creation via system bootstrap",
  payload: {
    id: DEFAULT_POLICY_ID,
    name: "Standard Auto",
    premium: 0,
    coverageLimit: 50000,
    status: "Draft",
  },
  timestamp: "2026-04-06T04:42:03.837Z",
  metadata: {
    actor: "SYSTEM",
    sequence: 1,
  },
  guidewireEntity: "PolicyCenter.PolicyPeriod",
};

// ── Store Shape ──────────────────────────────────────────────────────────

export interface StoreShape {
  /** Multi-policy state map. Key = policyId */
  policies: Record<string, Policy>;
  /** Per-policy event streams. Key = policyId */
  events: Record<string, ReplayEvent[]>;
  /** Per-policy snapshots. Key = policyId */
  snapshots: Record<string, Snapshot[]>;
  /** Per-policy monotonic sequence counters. Key = policyId */
  sequences: Record<string, number>;
}

// ── File I/O ─────────────────────────────────────────────────────────────

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Auto-migration: converts legacy single-policy store format to
 * the new multi-policy partition format.
 */
function migrateLegacyStore(raw: any): StoreShape {
  // Legacy format check: has `policy` (singular) and flat `events` array
  if (raw.policy && Array.isArray(raw.events) && !raw.policies) {
    const policyId = raw.policy.id || DEFAULT_POLICY_ID;

    // Enrich legacy events with new required fields
    const migratedEvents: ReplayEvent[] = raw.events.map((evt: any, index: number) => ({
      ...evt,
      policyId: evt.policyId || policyId,
      source: evt.source || "SYSTEM",
      reasoning: evt.reasoning || `Legacy event: ${evt.type}`,
      metadata: evt.metadata || { sequence: index + 1 },
    }));

    return {
      policies: { [policyId]: raw.policy },
      events: { [policyId]: migratedEvents },
      snapshots: { [policyId]: [] },
      sequences: { [policyId]: migratedEvents.length },
    };
  }

  // Already new format
  return raw as StoreShape;
}

function loadStore(): StoreShape {
  ensureDataDir();

  if (!fs.existsSync(storeFilePath)) {
    const defaultStore = buildDefaultStore();
    fs.writeFileSync(storeFilePath, JSON.stringify(defaultStore, null, 2), "utf-8");
    return defaultStore;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(storeFilePath, "utf-8"));
    return migrateLegacyStore(raw);
  } catch {
    const defaultStore = buildDefaultStore();
    fs.writeFileSync(storeFilePath, JSON.stringify(defaultStore, null, 2), "utf-8");
    return defaultStore;
  }
}

function buildDefaultStore(): StoreShape {
  return {
    policies: { [DEFAULT_POLICY_ID]: { ...initialPolicy } },
    events: { [DEFAULT_POLICY_ID]: [{ ...initialEvent }] },
    snapshots: { [DEFAULT_POLICY_ID]: [] },
    sequences: { [DEFAULT_POLICY_ID]: 1 },
  };
}

// ── Singleton Store Instance ─────────────────────────────────────────────

export const store: StoreShape = loadStore();

// ── Persistence ──────────────────────────────────────────────────────────

export function saveStore() {
  ensureDataDir();
  fs.writeFileSync(storeFilePath, JSON.stringify(store, null, 2), "utf-8");
}

// ── Policy CRUD ──────────────────────────────────────────────────────────

/**
 * Gets a policy by ID. Falls back to default if not found.
 * Backward compatible: no policyId = POL-001.
 */
export function getPolicy(policyId: string = DEFAULT_POLICY_ID): Policy | null {
  return store.policies[policyId] || null;
}

export function setPolicy(policyId: string, policy: Policy) {
  store.policies[policyId] = policy;
  // Ensure partition exists
  if (!store.events[policyId]) store.events[policyId] = [];
  if (!store.snapshots[policyId]) store.snapshots[policyId] = [];
  if (!store.sequences[policyId]) store.sequences[policyId] = 0;
  saveStore();
}

export function getAllPolicyIds(): string[] {
  return Object.keys(store.policies);
}

// ── Event Operations ─────────────────────────────────────────────────────

/**
 * Gets events for a policy. Returns empty array if policy not found.
 * Events are returned in storage order (not necessarily sorted).
 */
export function getEvents(policyId: string = DEFAULT_POLICY_ID): ReplayEvent[] {
  return store.events[policyId] || [];
}

/**
 * Adds an event to a policy's stream with auto-sequence numbering.
 * Returns the enriched event with sequence metadata.
 */
export function addEvent(policyId: string, event: ReplayEvent): ReplayEvent {
  if (!store.events[policyId]) store.events[policyId] = [];
  if (!store.sequences[policyId]) store.sequences[policyId] = 0;

  // Auto-increment sequence
  store.sequences[policyId]++;
  const enrichedEvent: ReplayEvent = {
    ...event,
    policyId,
    metadata: {
      ...event.metadata,
      sequence: store.sequences[policyId],
    },
  };

  store.events[policyId].push(enrichedEvent);
  saveStore();
  return enrichedEvent;
}

/**
 * Adds multiple events in batch. Maintains sequence integrity.
 */
export function addEvents(policyId: string, events: ReplayEvent[]): ReplayEvent[] {
  return events.map(event => addEvent(policyId, event));
}

// ── Snapshot Operations ──────────────────────────────────────────────────

export function getSnapshots(policyId: string = DEFAULT_POLICY_ID): Snapshot[] {
  return store.snapshots[policyId] || [];
}

export function addSnapshot(policyId: string, snapshot: Snapshot) {
  if (!store.snapshots[policyId]) store.snapshots[policyId] = [];
  store.snapshots[policyId].push(snapshot);
  saveStore();
}

// ── Sequence Counter ─────────────────────────────────────────────────────

export function getNextSequence(policyId: string = DEFAULT_POLICY_ID): number {
  if (!store.sequences[policyId]) store.sequences[policyId] = 0;
  return store.sequences[policyId] + 1;
}

// ── Reset ────────────────────────────────────────────────────────────────

export function resetStore(): StoreShape {
  const defaultStore = buildDefaultStore();
  Object.assign(store, defaultStore);
  saveStore();
  return store;
}

// ── Backward Compatibility ───────────────────────────────────────────────
// These accessors maintain the old `store.policy` / `store.events` interface
// for components that haven't migrated yet. They operate on POL-001.

Object.defineProperty(store, 'policy', {
  get: () => store.policies[DEFAULT_POLICY_ID],
  set: (value: Policy) => { store.policies[DEFAULT_POLICY_ID] = value; },
  enumerable: false,
  configurable: true,
});
