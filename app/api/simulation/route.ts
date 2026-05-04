/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SIMULATION API — Streaming simulation with failure injection
 * ═══════════════════════════════════════════════════════════════════════════
 * POST /api/simulation
 *
 * Supports:
 * - Claim and endorsement scenarios
 * - Streaming mode (events returned with delays for real-time ingestion)
 * - Failure simulation (missing, duplicate, out-of-order events)
 * - Guidewire entity enrichment
 * - Per-policy event generation
 *
 * DETERMINISM: Event content is deterministic given the same inputs.
 * Timestamps use incremental offsets from request time.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from "next/server";
import { addEvent, getEvents, store, saveStore } from "@/lib/store";
import { ReplayEvent } from "@/types/event";
import { enrichWithGuidewireEntity } from "@/lib/guidewireMapping";

const DEFAULT_POLICY_ID = "POL-001";

type FailureType = "MISSING_EVENT" | "DUPLICATE" | "OUT_OF_ORDER";

interface SimulationRequest {
  scenario: "claim" | "endorsement";
  currentPremium: number;
  currentCoverage: number;
  policyId?: string;
  /** Enable streaming simulation (events arrive with delays) */
  streaming?: boolean;
  /** Inject failure scenarios for testing */
  simulateFailure?: boolean;
  failureType?: FailureType;
}

function getUserFromRequest(req: Request) {
  const role = req.headers.get("x-user-role");
  if (!role) return null;
  return { role };
}

export async function POST(req: Request) {
  const user = getUserFromRequest(req);
  const allowedRoles = ["AGENT", "UNDERWRITER", "ADMIN"];
  
  if (!user || !allowedRoles.includes(user.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  const body: SimulationRequest = await req.json();
  const {
    scenario,
    currentPremium,
    currentCoverage,
    policyId = DEFAULT_POLICY_ID,
    streaming = false,
    simulateFailure = false,
    failureType,
  } = body;

  const generatedEvents: ReplayEvent[] = [];
  const nowMs = Date.now();

  // ── Generate scenario events ─────────────────────────────────────────
  if (scenario === "claim") {
    generatedEvents.push(
      buildEvent("CLAIM_REPORTED", policyId, nowMs + 1000, undefined,
        "Accident claim reported by policyholder via mobile app"),
      buildEvent("CLAIM_APPROVED", policyId, nowMs + 2000, { payout: 5000 },
        "Claim approved by adjuster after damage assessment"),
      buildEvent("POLICY_QUOTED", policyId, nowMs + 3000, { premium: currentPremium + 3000 },
        `Post-claim premium adjustment: base ${currentPremium} + 3000 surcharge`),
      buildEvent("POLICY_ENDORSED", policyId, nowMs + 4000, { premium: currentPremium + 3000 },
        "Premium endorsement applied following claim approval"),
    );
  } else if (scenario === "endorsement") {
    const newCoverage = currentCoverage + 50000;
    const newPremium = currentPremium + 800;
    generatedEvents.push(
      buildEvent("POLICY_ENDORSED", policyId, nowMs + 1000, { coverageLimit: newCoverage },
        `Coverage increase requested: ${currentCoverage} → ${newCoverage}`),
      buildEvent("POLICY_QUOTED", policyId, nowMs + 2000, { premium: newPremium },
        `Re-rated premium for coverage change: ${currentPremium} → ${newPremium}`),
    );
  }

  // ── Apply failure simulation ─────────────────────────────────────────
  let finalEvents = [...generatedEvents];

  if (simulateFailure && failureType) {
    finalEvents = applyFailureSimulation(finalEvents, failureType);
  }

  // ── Enrich with Guidewire entities ───────────────────────────────────
  const enrichedEvents = finalEvents.map(enrichWithGuidewireEntity);

  // ── Persist events ───────────────────────────────────────────────────
  const storedEvents: ReplayEvent[] = [];
  for (const event of enrichedEvents) {
    const stored = addEvent(policyId, event);
    storedEvents.push(stored);
  }

  // ── Streaming response ───────────────────────────────────────────────
  if (streaming) {
    // Return a streaming response that sends events with delays.
    // Client should consume as Server-Sent Events (SSE).
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < storedEvents.length; i++) {
          const event = storedEvents[i];
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));

          // Simulate real-time delay between events (500–1200ms)
          // Using deterministic delays based on index to maintain testability
          const delay = 500 + (i * 175); // 500, 675, 850, 1025ms
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  // ── Standard batch response ──────────────────────────────────────────
  return NextResponse.json({
    events: storedEvents,
    metadata: {
      scenario,
      policyId,
      eventsGenerated: storedEvents.length,
      failureSimulated: simulateFailure ? failureType : null,
      streaming: false,
    },
  });
}

// ── Event Builder ────────────────────────────────────────────────────────

function buildEvent(
  type: ReplayEvent["type"],
  policyId: string,
  timestampMs: number,
  payload: any,
  reasoning: string
): ReplayEvent {
  return {
    id: crypto.randomUUID(),
    type,
    policyId,
    source: "SYSTEM",
    reasoning,
    payload,
    timestamp: new Date(timestampMs).toISOString(),
    metadata: {
      actor: "SimulationEngine",
      correlationId: `sim-${Date.now()}`,
    },
  };
}

// ── Failure Simulation ───────────────────────────────────────────────────
// Modifies the event array to simulate real-world failure scenarios.
// The replay engine should still reconstruct deterministically and
// flag anomalies/drift appropriately.

function applyFailureSimulation(
  events: ReplayEvent[],
  failureType: FailureType
): ReplayEvent[] {
  switch (failureType) {
    case "MISSING_EVENT":
      // Remove the second event (index 1) to simulate a gap
      if (events.length > 1) {
        const result = [...events];
        result.splice(1, 1);
        return result;
      }
      return events;

    case "DUPLICATE":
      // Duplicate the first event to simulate double-ingestion
      if (events.length > 0) {
        return [events[0], ...events];
      }
      return events;

    case "OUT_OF_ORDER":
      // Reverse the event order to simulate out-of-order arrival
      // The replay engine's deterministic sort should handle this
      return [...events].reverse();

    default:
      return events;
  }
}
