import { NextResponse } from "next/server";
import { resetStore } from "@/lib/store";

export async function POST() {
  const newStore = resetStore();
  return NextResponse.json({ 
    message: "System reset successful", 
    policy: newStore!.policy,
    events: newStore!.events
  });
}
