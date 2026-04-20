/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESET API — Full system reset
 * ═══════════════════════════════════════════════════════════════════════════
 * POST /api/reset → Reset entire multi-policy store to initial state
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from "next/server";
import { resetStore } from "@/lib/store";

export async function POST() {
  const newStore = resetStore();
  return NextResponse.json({
    message: "System reset successful",
    policies: newStore.policies,
    events: newStore.events,
    policyCount: Object.keys(newStore.policies).length,
  });
}
