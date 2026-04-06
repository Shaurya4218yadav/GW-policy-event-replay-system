"use client";

import React, { useState, useEffect } from "react";

interface EventStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByEntity: Record<string, number>;
  lastEventTimestamp: string | null;
}

interface ExternalEvent {
  id: string;
  entity: string;
  eventType: string;
  timestamp: string;
  receivedAt: string;
  source: string;
  payload?: Record<string, unknown>;
}

export default function MonitoringPage() {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [events, setEvents] = useState<ExternalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/external/events');
      const data = await response.json();
      setStats(data.stats);
      setEvents(data.events);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const resetEvents = async () => {
    try {
      await fetch('/api/external/events', { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to reset events:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p>Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bg-base text-text-primary transition-all duration-700 overflow-x-hidden selection:bg-accent selection:text-black">
      {/* HUD HEADER */}
      <div className="fixed top-16 left-12 z-50">
        <div className="flex flex-col gap-0.5">
          <h1 className="tool-title !text-lg tracking-tighter uppercase flex items-center gap-3">
            <span className="w-1 h-3 bg-signal-gradient rounded-full glow-primary" />
            <span className="text-signal-gradient font-black">EXTERNAL_MONITORING</span>
          </h1>
          <div className="flex items-center gap-4 forensic-text uppercase tracking-[0.4em] font-bold !text-[8.5px] pl-4 mt-1">
            <span className="text-text-secondary">STATUS:</span>
            <span className="text-accent">ACTIVE</span>
            <span className="w-1.5 h-px bg-white/10" />
            <span className="text-text-secondary">LAST_UPDATE:</span>
            <span className="text-text-primary">{lastUpdate?.toLocaleTimeString() || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="pt-32 px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-2xl">
                📊
              </div>
              <h2 className="text-5xl font-black text-signal-gradient tracking-tight">
                External Event Monitoring
              </h2>
            </div>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Real-time monitoring of events streamed from Guidewire systems to external services.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-panel rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">{stats?.totalEvents || 0}</div>
              <div className="text-text-secondary text-sm uppercase tracking-wider">Total Events</div>
            </div>
            <div className="glass-panel rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-accent-secondary mb-2">
                {Object.keys(stats?.eventsByEntity || {}).length}
              </div>
              <div className="text-text-secondary text-sm uppercase tracking-wider">Entity Types</div>
            </div>
            <div className="glass-panel rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-accent-primary mb-2">
                {Object.keys(stats?.eventsByType || {}).length}
              </div>
              <div className="text-text-secondary text-sm uppercase tracking-wider">Event Types</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Events by Type */}
            <div className="glass-panel rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-text-primary">Events by Type</h3>
              <div className="space-y-3">
                {Object.entries(stats?.eventsByType || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-text-secondary font-mono text-sm">{type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-bg-elevated rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(count / (stats?.totalEvents || 1)) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-text-primary font-bold text-sm w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(stats?.eventsByType || {}).length === 0 && (
                  <p className="text-text-dim text-center py-4">No events received yet</p>
                )}
              </div>
            </div>

            {/* Events by Entity */}
            <div className="glass-panel rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-text-primary">Events by Entity</h3>
              <div className="space-y-3">
                {Object.entries(stats?.eventsByEntity || {}).map(([entity, count]) => (
                  <div key={entity} className="flex items-center justify-between">
                    <span className="text-text-secondary font-mono text-sm">{entity}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-bg-elevated rounded-full h-2">
                        <div
                          className="bg-accent-secondary h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(count / (stats?.totalEvents || 1)) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-text-primary font-bold text-sm w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(stats?.eventsByEntity || {}).length === 0 && (
                  <p className="text-text-dim text-center py-4">No events received yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="glass-panel rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary">Recent Events</h3>
              <button
                onClick={resetEvents}
                className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-colors text-sm"
              >
                Reset Events
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {events.length > 0 ? (
                events.slice().reverse().map((event) => (
                  <div key={event.id} className="bg-bg-elevated rounded-lg p-4 border border-text-secondary/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-bold">
                          {event.eventType}
                        </span>
                        <span className="text-text-secondary text-sm">{event.entity}</span>
                      </div>
                      <span className="text-text-dim text-xs">
                        {new Date(event.receivedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-text-secondary text-sm font-mono">
                      ID: {event.id.slice(0, 12)}...
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-text-dim">No external events received yet</p>
                  <p className="text-text-dim text-sm mt-2">
                    Events will appear here when Guidewire sends them via POST /api/external/events
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* API Testing Section */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-text-primary">API Testing</h3>
            <div className="bg-bg-elevated rounded-lg p-4 font-mono text-sm">
              <div className="text-text-secondary mb-2">Test the external events endpoint:</div>
              <div className="text-accent">
                POST http://localhost:3000/api/external/events
              </div>
              <div className="text-text-dim mt-2 text-xs">
                Content-Type: application/json
              </div>
              <div className="text-text-primary mt-2 bg-bg-base p-2 rounded">
                {`{
  "entity": "Policy",
  "eventType": "UPDATE",
  "timestamp": "${new Date().toISOString()}",
  "changes": {
    "premium": 1500,
    "status": "Active"
  }
}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}