import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { ReplayEvent } from "@/types/event";

export async function POST(req: Request) {
  const { scenario, currentPremium, currentCoverage } = await req.json();
  const generatedEvents: ReplayEvent[] = [];
  const nowMs = Date.now();

  if (scenario === 'claim') {
    generatedEvents.push({
      id: crypto.randomUUID(),
      type: 'CLAIM_REPORTED',
      timestamp: new Date(nowMs + 1000).toISOString()
    });
    generatedEvents.push({
      id: crypto.randomUUID(),
      type: 'CLAIM_APPROVED',
      payload: { payout: 5000 },
      timestamp: new Date(nowMs + 2000).toISOString()
    });
    const newPremium = currentPremium + 3000;
    generatedEvents.push({
      id: crypto.randomUUID(),
      type: 'POLICY_QUOTED',
      payload: { premium: newPremium },
      timestamp: new Date(nowMs + 3000).toISOString()
    });
    generatedEvents.push({
      id: crypto.randomUUID(),
      type: 'POLICY_ENDORSED',
      payload: { premium: newPremium },
      timestamp: new Date(nowMs + 4000).toISOString()
    });
  } else if (scenario === 'endorsement') {
    const newCoverage = currentCoverage + 50000;
    generatedEvents.push({
      id: crypto.randomUUID(),
      type: 'POLICY_ENDORSED',
      payload: { coverageLimit: newCoverage },
      timestamp: new Date(nowMs + 1000).toISOString()
    });
    const newPremium = currentPremium + 800;
    generatedEvents.push({
      id: crypto.randomUUID(),
      type: 'POLICY_QUOTED',
      payload: { premium: newPremium },
      timestamp: new Date(nowMs + 2000).toISOString()
    });
  }

  // Append new simulation events to the central log.
  store!.events.push(...generatedEvents);
  
  return NextResponse.json(generatedEvents);
}
