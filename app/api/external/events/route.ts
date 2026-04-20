/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXTERNAL EVENTS API — Guidewire Integration Endpoint
 * ═══════════════════════════════════════════════════════════════════════════
 * POST   /api/external/events  → Ingest events (single or batch)
 * GET    /api/external/events  → Retrieve recent external events
 * DELETE /api/external/events  → Reset external event store
 *
 * Enhancements over previous version:
 * - Batch ingestion (accept array of events)
 * - Out-of-order event handling (sorts before storage)
 * - Sequence integrity maintenance
 * - Guidewire entity enrichment
 * - Delayed timestamp support
 * ═══════════════════════════════════════════════════════════════════════════
 */

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

/**
 * Assigns a deterministic sequence number to events based on their
 * position after timestamp-sorting. This ensures sequence integrity
 * even when events arrive out of order.
 */
function assignSequences(events: Array<Record<string, any>>): Array<Record<string, any>> {
  // Sort by timestamp for proper sequencing
  const sorted = [...events].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeA - timeB;
  });

  return sorted.map((event, index) => ({
    ...event,
    metadata: {
      ...event.metadata,
      sequence: index + 1,
    },
  }));
}

export async function POST(req: Request) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  try {
    const rawBody = await req.json();

    // ── Support batch ingestion ──────────────────────────────────────
    // Accept either a single event object or an array of events
    const eventDataArray = Array.isArray(rawBody) ? rawBody : [rawBody];

    const results: Array<{ success: boolean; eventId?: string; error?: string }> = [];
    const newEvents: Array<Record<string, any>> = [];

    for (const eventData of eventDataArray) {
      // Validate required fields
      if (!eventData.entity || !eventData.eventType || !eventData.timestamp) {
        results.push({
          success: false,
          error: `Missing required fields: entity, eventType, timestamp`,
        });
        continue;
      }

      const enrichedEvent = {
        ...eventData,
        receivedAt: new Date().toISOString(),
        source: "guidewire-external",
        id: `ext-${Date.now()}-${eventData.eventType}-${results.length}`,
      };

      newEvents.push(enrichedEvent);
      results.push({
        success: true,
        eventId: enrichedEvent.id,
      });
    }

    // ── Merge and sort all events by timestamp ─────────────────────
    // This handles out-of-order and delayed events by re-sorting
    const allEvents = [...externalStore.events, ...newEvents];

    // Sort by timestamp to handle out-of-order events
    allEvents.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });

    // Re-assign sequences after sorting to maintain integrity
    const sequencedEvents = assignSequences(allEvents).slice(-1000);

    externalStore.events = sequencedEvents;
    externalStore.stats = buildEventStats(sequencedEvents);
    saveExternalStore();

    const eventsIngested = results.filter(r => r.success).length;
    const eventsFailed = results.filter(r => !r.success).length;

    console.log(`📨 External Events Received: ${eventsIngested} ingested, ${eventsFailed} failed`);

    return NextResponse.json({
      success: eventsFailed === 0,
      results,
      summary: {
        ingested: eventsIngested,
        failed: eventsFailed,
        totalStored: externalStore.events.length,
      },
      stats: externalStore.stats,
      message: `${eventsIngested} event(s) received and processed successfully`,
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