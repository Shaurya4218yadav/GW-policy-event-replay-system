/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SNAPSHOT API — Checkpoint management for replay optimization
 * ═══════════════════════════════════════════════════════════════════════════
 * GET  /api/snapshot?policyId=X  → List snapshots for a policy
 * POST /api/snapshot             → Create a snapshot at current state
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from "next/server";
import { getPolicy, getEvents, getSnapshots, addSnapshot } from "@/lib/store";
import { reconstructState } from "@/lib/replayEngine";
import { createSnapshot } from "@/lib/snapshotManager";

const DEFAULT_POLICY_ID = "POL-001";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const policyId = searchParams.get("policyId") || DEFAULT_POLICY_ID;
  const snapshots = getSnapshots(policyId);

  return NextResponse.json({
    policyId,
    snapshots,
    count: snapshots.length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const policyId = body.policyId || DEFAULT_POLICY_ID;
    const targetTime = body.targetTime || new Date().toISOString();

    const policy = getPolicy(policyId);
    if (!policy) {
      return NextResponse.json(
        { error: `Policy ${policyId} not found` },
        { status: 404 }
      );
    }

    const events = getEvents(policyId);
    if (events.length === 0) {
      return NextResponse.json(
        { error: `No events found for policy ${policyId}` },
        { status: 404 }
      );
    }

    // Replay to get current state at the target time
    const { replay } = reconstructState(events, targetTime);
    if (!replay.state) {
      return NextResponse.json(
        { error: "Could not reconstruct state at target time" },
        { status: 400 }
      );
    }

    // Create and store snapshot
    const snapshot = createSnapshot(
      policyId,
      replay.state,
      targetTime,
      events.length - 1
    );

    addSnapshot(policyId, snapshot);

    return NextResponse.json({
      message: "Snapshot created successfully",
      snapshot,
      totalSnapshots: getSnapshots(policyId).length,
    });
  } catch (error) {
    console.error("Snapshot creation error:", error);
    return NextResponse.json(
      { error: "Internal error creating snapshot" },
      { status: 500 }
    );
  }
}
