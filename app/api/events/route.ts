import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json(store!.events);
}

export async function POST(req: Request) {
  const newEvent = await req.json();
  store!.events.push(newEvent);
  return NextResponse.json(store!.events);
}
