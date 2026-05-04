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
import { getEvents, addEvent } from "@/lib/store";
import { enrichWithGuidewireEntity } from "@/lib/guidewireMapping";
import { ReplayEvent } from "@/types/event";

function getUserFromRequest(req: Request) {
  const role = req.headers.get("x-user-role");
  if (!role) return null;
  return { role };
}

const DEFAULT_POLICY_ID = "POL-001";

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  const allowedRoles = ["POLICYHOLDER", "AGENT", "UNDERWRITER", "AUDITOR", "ADMIN"];
  
  if (!user || !allowedRoles.includes(user.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const policyId = searchParams.get("policyId") || DEFAULT_POLICY_ID;
  const events = getEvents(policyId);
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const user = getUserFromRequest(req);
  const allowedRoles = ["AGENT", "UNDERWRITER", "ADMIN"];
  
  if (!user || !allowedRoles.includes(user.role)) {
    return new Response("Forbidden", { status: 403 });
  }

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
