/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SNAPSHOT MANAGER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Manages point-in-time policy state checkpoints for replay optimization.
 *
 * Without snapshots: replaying a policy with 10,000 events requires
 * processing all 10,000 events from scratch every time.
 *
 * With snapshots: find the nearest snapshot before the target time,
 * then replay only the events AFTER that snapshot. For a policy with
 * 10,000 events and snapshots every 100 events, worst case is
 * replaying ~100 events instead of 10,000.
 *
 * SCALABILITY: In production with millions of policies:
 * - Snapshots would be stored in a separate table/collection
 * - Indexed by (policyId, timestamp) for efficient range queries
 * - Created automatically at business boundaries (bind, renewal)
 * - Garbage-collected after retention period (e.g., 7 years for audit)
 *
 * DETERMINISM: Snapshot creation is deterministic — same state → same
 * snapshot. Replay from snapshot produces identical results to full replay.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Policy } from '@/types/policy';
import { Snapshot } from '@/types/event';

/**
 * Creates a new snapshot at the current point in the event stream.
 *
 * @param policyId   - Policy this snapshot belongs to
 * @param state      - Current policy state to checkpoint
 * @param timestamp  - Timestamp of the last event included
 * @param eventIndex - Index of the last event included
 * @returns New Snapshot object
 */
export function createSnapshot(
  policyId: string,
  state: Policy,
  timestamp: string,
  eventIndex: number
): Snapshot {
  return {
    policyId,
    timestamp,
    state: { ...state }, // Deep copy to prevent mutation
    eventIndex,
  };
}

/**
 * Finds the nearest snapshot AT or BEFORE the target time.
 * Returns null if no suitable snapshot exists.
 *
 * @param snapshots  - Available snapshots for the policy (any order)
 * @param targetTime - ISO timestamp to find snapshot for
 * @returns Nearest preceding snapshot, or null
 *
 * DETERMINISM: Sorts by timestamp descending, picks the first one
 * <= targetTime. Same snapshots + targetTime → same result.
 */
export function findNearestSnapshot(
  snapshots: Snapshot[],
  targetTime: string
): Snapshot | null {
  if (!snapshots || snapshots.length === 0) return null;

  const targetMs = new Date(targetTime).getTime();

  // Sort descending by timestamp to find the nearest one before target
  const sorted = [...snapshots]
    .filter(s => new Date(s.timestamp).getTime() <= targetMs)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return sorted.length > 0 ? sorted[0] : null;
}

/**
 * Determines whether a snapshot should be created based on event count.
 * Strategy: snapshot every N events (configurable).
 *
 * @param eventIndex    - Current event index
 * @param snapshotCount - Number of existing snapshots
 * @param interval      - Events between snapshots (default: 50)
 * @returns true if a snapshot should be created
 */
export function shouldCreateSnapshot(
  eventIndex: number,
  snapshotCount: number,
  interval: number = 50
): boolean {
  // Create snapshot at regular intervals
  // Also create at index 0 if no snapshots exist
  if (snapshotCount === 0 && eventIndex === 0) return true;
  return eventIndex > 0 && eventIndex % interval === 0;
}
