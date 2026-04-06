import { NextResponse } from "next/server";

// In-memory storage for external events (simulating external system)
let externalEvents: Array<{
  id: string;
  entity: string;
  eventType: string;
  timestamp: string;
  receivedAt: string;
  source: string;
  payload?: Record<string, unknown>;
}> = [];
let eventStats = {
  totalEvents: 0,
  eventsByType: {} as Record<string, number>,
  eventsByEntity: {} as Record<string, number>,
  lastEventTimestamp: null as string | null,
};

export async function POST(req: Request) {
  try {
    const eventData = await req.json();

    // Validate required fields
    if (!eventData.entity || !eventData.eventType || !eventData.timestamp) {
      return NextResponse.json(
        { error: "Missing required fields: entity, eventType, timestamp" },
        { status: 400 }
      );
    }

    // Add metadata
    const enrichedEvent = {
      ...eventData,
      receivedAt: new Date().toISOString(),
      source: "guidewire-external",
      id: `ext-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Store the event
    externalEvents.push(enrichedEvent);

    // Update statistics
    eventStats.totalEvents++;
    eventStats.eventsByType[eventData.eventType] = (eventStats.eventsByType[eventData.eventType] || 0) + 1;
    eventStats.eventsByEntity[eventData.entity] = (eventStats.eventsByEntity[eventData.entity] || 0) + 1;
    eventStats.lastEventTimestamp = enrichedEvent.receivedAt;

    console.log(`📨 External Event Received: ${eventData.entity} - ${eventData.eventType}`);

    return NextResponse.json({
      success: true,
      eventId: enrichedEvent.id,
      message: "Event received and processed successfully",
      stats: {
        totalEvents: eventStats.totalEvents,
        eventsByType: eventStats.eventsByType,
        eventsByEntity: eventStats.eventsByEntity,
      }
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
  return NextResponse.json({
    events: externalEvents.slice(-50), // Return last 50 events
    stats: eventStats,
    totalStored: externalEvents.length,
  });
}

// Reset endpoint for testing
export async function DELETE() {
  externalEvents = [];
  eventStats = {
    totalEvents: 0,
    eventsByType: {},
    eventsByEntity: {},
    lastEventTimestamp: null,
  };

  return NextResponse.json({ message: "External events reset successfully" });
}