import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json(store!.policy);
}

export async function POST(req: Request) {
  const newPolicy = await req.json();
  store!.policy = newPolicy;
  return NextResponse.json(store!.policy);
}
