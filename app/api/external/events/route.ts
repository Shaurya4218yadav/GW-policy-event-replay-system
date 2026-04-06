import { NextResponse } from "next/server";
import { externalStore, saveExternalStore, resetExternalStore } from "@/lib/externalStore";

const API_KEY = process.env.GW_EXTERNAL_EVENTS_API_KEY ?? "dev-guidewire-key";

function getRequestApiKey(req: Request) {
  return (
    req.headers.get("x-api-key") ||
    (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "") ||
    null
  );
}

function requireApiKey(req: Request) {
  const providedKey = getRequestApiKey(req);
  if (!providedKey || providedKey !== API_KEY) {
    return NextResponse.json(
      { error: "Unauthorized: invalid or missing API key" },
      { status: 401 }
    );
  }
  return null;
}

function buildEventStats(events: Array<Record<string, any>>) {
  const stats = {
    totalEvents: events.length,
    eventsByType: {} as Record<string, number>,
    eventsByEntity: {} as Record<string, number>,
    lastEventTimestamp: null as string | null,
  };

  events.forEach((event) => {
    const eventType = event.eventType as string;
    const entity = event.entity as string;
    stats.eventsByType[eventType] = (stats.eventsByType[eventType] || 0) + 1;
    stats.eventsByEntity[entity] = (stats.eventsByEntity[entity] || 0) + 1;
    stats.lastEventTimestamp = event.receivedAt || stats.lastEventTimestamp;
  });

  return stats;
}

export async function POST(req: Request) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  try {
    const eventData = await req.json();

    // Validate required fields
    if (!eventData.entity || !eventData.eventType || !eventData.timestamp) {
      return NextResponse.json(
        { error: "Missing required fields: entity, eventType, timestamp" },
        { status: 400 }
      );
    }

    const enrichedEvent = {
      ...eventData,
      receivedAt: new Date().toISOString(),
      source: "guidewire-external",
      id: `ext-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    };

    const events = [...externalStore.events, enrichedEvent].slice(-1000);
    externalStore.events = events;
    externalStore.stats = buildEventStats(events);
    saveExternalStore();

    console.log(`📨 External Event Received: ${eventData.entity} - ${eventData.eventType}`);

    return NextResponse.json({
      success: true,
      eventId: enrichedEvent.id,
      message: "Event received and processed successfully",
      stats: externalStore.stats,
    });

  } catch (error) {
    console.error("Error processing external event:", error);
    return NextResponse.json(
      { error: "Internal server error processing event" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const events = externalStore.events.slice(-50);
  const stats = externalStore.stats || buildEventStats(externalStore.events);

  return NextResponse.json({
    events,
    stats,
    totalStored: externalStore.events.length,
  });
}

// Reset endpoint for testing
export async function DELETE(req: Request) {
  const authError = requireApiKey(req);
  if (authError) return authError;
  externalStore.events = [];
  externalStore.stats = {
    totalEvents: 0,
    eventsByType: {},
    eventsByEntity: {},
    lastEventTimestamp: null,
  };
  await resetExternalStore();

  return NextResponse.json({ message: "External events reset successfully" });
}