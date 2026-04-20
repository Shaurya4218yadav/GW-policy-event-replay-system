/**
 * ═══════════════════════════════════════════════════════════════════════════
 * POLICY API — Multi-policy CRUD operations
 * ═══════════════════════════════════════════════════════════════════════════
 * GET  /api/policy?policyId=X  → Get policy state
 * POST /api/policy             → Create/update policy
 *
 * Backward compatible: defaults to POL-001 if no policyId specified.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from "next/server";
import { getPolicy, setPolicy, getAllPolicyIds, store } from "@/lib/store";

const DEFAULT_POLICY_ID = "POL-001";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const policyId = searchParams.get("policyId") || DEFAULT_POLICY_ID;

  // Special: return all policies if policyId is "all"
  if (policyId === "all") {
    return NextResponse.json({
      policies: store.policies,
      policyIds: getAllPolicyIds(),
    });
  }

  const policy = getPolicy(policyId);
  if (!policy) {
    return NextResponse.json(
      { error: `Policy ${policyId} not found` },
      { status: 404 }
    );
  }
  return NextResponse.json(policy);
}

export async function POST(req: Request) {
  const body = await req.json();
  const policyId = body.id || body.policyId || DEFAULT_POLICY_ID;

  const policy = {
    id: policyId,
    name: body.name || "Unnamed Policy",
    premium: Number(body.premium) || 0,
    coverageLimit: Number(body.coverageLimit) || 50000,
    status: body.status || "Draft",
  };

  setPolicy(policyId, policy as any);
  return NextResponse.json(getPolicy(policyId));
}
