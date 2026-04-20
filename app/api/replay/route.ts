/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REPLAY API — Full audit replay with drift, anomalies, impact & integrity
 * ═══════════════════════════════════════════════════════════════════════════
 * POST /api/replay
 * Body: { policyId, targetTime?, useSnapshots?: boolean }
 *
 * Returns the complete audit report:
 * {
 *   state,
 *   traceLog,
 *   anomalies,
 *   driftResults,
 *   impactAnalysis,
 *   integrityScore,
 *   progression,
 *   steps
 * }
 *
 * This is the primary endpoint for audit operations. It orchestrates:
 * 1. Event replay (with optional snapshot optimization)
 * 2. Causal trace generation
 * 3. Anomaly detection
 * 4. State drift comparison
 * 5. Business impact calculation
 * 6. Integrity scoring
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from "next/server";
import { getEvents, getPolicy, getSnapshots } from "@/lib/store";
import { reconstructState } from "@/lib/replayEngine";
import { detectDrift } from "@/lib/driftDetector";
import { calculateImpact } from "@/lib/impactEngine";
import { calculateIntegrityScore } from "@/lib/integrityScore";
import { findNearestSnapshot } from "@/lib/snapshotManager";

const DEFAULT_POLICY_ID = "POL-001";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const policyId = body.policyId || DEFAULT_POLICY_ID;
    const targetTime = body.targetTime || new Date().toISOString();
    const useSnapshots = body.useSnapshots ?? true;

    // ── Load policy and events ─────────────────────────────────────────
    const currentPolicy = getPolicy(policyId);
    if (!currentPolicy) {
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

    // ── Check for snapshot optimization ─────────────────────────────────
    let startIndex = 0;
    let initialState = null;

    if (useSnapshots) {
      const snapshots = getSnapshots(policyId);
      const nearestSnapshot = findNearestSnapshot(snapshots, targetTime);
      if (nearestSnapshot) {
        startIndex = nearestSnapshot.eventIndex + 1;
        initialState = nearestSnapshot.state;
      }
    }

    // ── Execute replay ─────────────────────────────────────────────────
    const { replay, anomalies } = reconstructState(events, targetTime, startIndex, initialState);

    // ── Drift detection ────────────────────────────────────────────────
    let driftResults = { driftDetected: false, results: [] as any[] };
    if (replay.state) {
      driftResults = detectDrift(replay.state, currentPolicy);
    }

    // ── Impact analysis ────────────────────────────────────────────────
    const impactAnalysis = calculateImpact(
      driftResults.results,
      anomalies,
      currentPolicy
    );

    // ── Integrity score ────────────────────────────────────────────────
    const integrityScore = calculateIntegrityScore(
      anomalies,
      driftResults.results
    );

    // ── Assemble full audit report ─────────────────────────────────────
    return NextResponse.json({
      policyId,
      targetTime,
      state: replay.state,
      steps: replay.steps,
      progression: replay.progression,
      traceLog: replay.traceLog,
      anomalies: anomalies,
      driftResults: driftResults.results,
      driftDetected: driftResults.driftDetected,
      impactAnalysis,
      integrityScore,
      metadata: {
        totalEvents: events.length,
        eventsReplayed: replay.steps.length,
        snapshotUsed: startIndex > 0,
        snapshotEventIndex: startIndex > 0 ? startIndex - 1 : null,
      },
    });
  } catch (error) {
    console.error("Replay engine error:", error);
    return NextResponse.json(
      { error: "Internal error during replay" },
      { status: 500 }
    );
  }
}
