/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EVENTS API — Multi-policy event stream management
 * ═══════════════════════════════════════════════════════════════════════════
 * GET  /api/events?policyId=X  → Retrieve events for a policy
 * POST /api/events             → Append event to a policy stream
 *
 * Backward compatible: defaults to POL-001 if no policyId specified.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from "next/server";
import { getEvents, addEvent, saveStore, store } from "@/lib/store";
import { enrichWithGuidewireEntity } from "@/lib/guidewireMapping";
import { ReplayEvent } from "@/types/event";

const DEFAULT_POLICY_ID = "POL-001";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const policyId = searchParams.get("policyId") || DEFAULT_POLICY_ID;
  const events = getEvents(policyId);
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const body = await req.json();
  const policyId = body.policyId || DEFAULT_POLICY_ID;

  // Enrich event with required fields if missing
  const event: ReplayEvent = {
    id: body.id || crypto.randomUUID(),
    type: body.type,
    payload: body.payload,
    timestamp: body.timestamp || new Date().toISOString(),
    policyId,
    source: body.source || "USER",
    reasoning: body.reasoning || `Manual ${body.type} event`,
    metadata: body.metadata || {},
  };

  // Add Guidewire entity mapping
  const enrichedEvent = enrichWithGuidewireEntity(event);

  // Add to store with auto-sequencing
  const storedEvent = addEvent(policyId, enrichedEvent);

  return NextResponse.json(getEvents(policyId));
}
