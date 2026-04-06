"use client";

import React from "react";

export default function DocsPage() {
  return (
    <div className="relative min-h-screen bg-bg-base text-text-primary transition-all duration-700 overflow-x-hidden selection:bg-accent selection:text-black">
      {/* HUD HEADER */}
      <div className="fixed top-16 left-12 z-30">
        <div className="flex flex-col gap-0.5">
          <h1 className="tool-title !text-lg tracking-tighter uppercase flex items-center gap-3">
            <span className="w-1 h-3 bg-signal-gradient rounded-full glow-primary" />
            <span className="text-signal-gradient font-black">API_DOCUMENTATION</span>
          </h1>
          <div className="flex items-center gap-4 forensic-text uppercase tracking-[0.4em] font-bold !text-[8.5px] pl-4 mt-1">
            <span className="text-text-secondary">VERSION:</span>
            <span className="text-accent">1.0.0</span>
            <span className="w-1.5 h-px bg-white/10" />
            <span className="text-text-secondary">STATUS:</span>
            <span className="text-accent">ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="pt-32 px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-2xl">
                📚
              </div>
              <h2 className="text-5xl font-black text-signal-gradient tracking-tight">
                API Documentation
              </h2>
            </div>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Integration guide for Guidewire Event Replay & Audit Engine external APIs.
            </p>
          </div>

          {/* Base URL */}
          <div className="glass-panel rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 text-text-primary">Base URL</h3>
            <div className="bg-bg-elevated rounded-lg p-4 font-mono text-accent">
              https://your-domain.com/api
            </div>
            <p className="text-text-secondary text-sm mt-2">
              Replace with your actual deployment domain
            </p>
          </div>

          {/* External Events API */}
          <div className="glass-panel rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm font-bold">POST</span>
              <h3 className="text-xl font-bold text-text-primary">/external/events</h3>
            </div>
            <p className="text-text-secondary mb-6">
              Endpoint for Guidewire to stream events to external systems for audit and monitoring.
            </p>

            <h4 className="text-lg font-semibold mb-3 text-text-primary">Request Body</h4>
            <div className="bg-bg-elevated rounded-lg p-4 font-mono text-sm text-text-primary mb-4 overflow-x-auto">
{`{
  "entity": "Policy" | "Claim",
  "eventType": "CREATE" | "UPDATE" | "ENDORSE" | "APPROVE" | "REJECT",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "entityId": "POL-001",
  "userId": "user123",
  "changes": {
    "fieldName": {
      "oldValue": "previous_value",
      "newValue": "new_value"
    }
  },
  "metadata": {
    "source": "PolicyCenter",
    "version": "10.0"
  }
}`}
            </div>

            <h4 className="text-lg font-semibold mb-3 text-text-primary">Response</h4>
            <div className="bg-bg-elevated rounded-lg p-4 font-mono text-sm text-green-400 mb-4">
{`{
  "success": true,
  "eventId": "ext-1234567890-abc123def",
  "message": "Event received and processed successfully",
  "stats": {
    "totalEvents": 150,
    "eventsByType": { "UPDATE": 120, "CREATE": 30 },
    "eventsByEntity": { "Policy": 100, "Claim": 50 }
  }
}`}
            </div>

            <h4 className="text-lg font-semibold mb-3 text-text-primary">Error Responses</h4>
            <div className="space-y-2">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="font-mono text-sm text-red-400">400 Bad Request</div>
                <div className="text-text-secondary text-sm">Missing required fields: entity, eventType, timestamp</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="font-mono text-sm text-red-400">500 Internal Server Error</div>
                <div className="text-text-secondary text-sm">Internal server error processing event</div>
              </div>
            </div>
          </div>

          {/* Monitoring API */}
          <div className="glass-panel rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm font-bold">GET</span>
              <h3 className="text-xl font-bold text-text-primary">/external/events</h3>
            </div>
            <p className="text-text-secondary mb-6">
              Retrieve external events and statistics for monitoring and auditing.
            </p>

            <h4 className="text-lg font-semibold mb-3 text-text-primary">Response</h4>
            <div className="bg-bg-elevated rounded-lg p-4 font-mono text-sm text-text-primary mb-4 overflow-x-auto">
{`{
  "events": [
    {
      "id": "ext-1234567890-abc123def",
      "entity": "Policy",
      "eventType": "UPDATE",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "receivedAt": "2024-01-01T12:00:05.000Z",
      "source": "guidewire-external",
      "payload": { ... }
    }
  ],
  "stats": {
    "totalEvents": 150,
    "eventsByType": { "UPDATE": 120, "CREATE": 30 },
    "eventsByEntity": { "Policy": 100, "Claim": 50 },
    "lastEventTimestamp": "2024-01-01T12:00:05.000Z"
  },
  "totalStored": 150
}`}
            </div>
          </div>

          {/* Reset API */}
          <div className="glass-panel rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm font-bold">DELETE</span>
              <h3 className="text-xl font-bold text-text-primary">/external/events</h3>
            </div>
            <p className="text-text-secondary mb-6">
              Reset external events storage (for testing purposes).
            </p>

            <h4 className="text-lg font-semibold mb-3 text-text-primary">Response</h4>
            <div className="bg-bg-elevated rounded-lg p-4 font-mono text-sm text-text-primary">
{`{
  "message": "External events reset successfully"
}`}
            </div>
          </div>

          {/* Integration Guide */}
          <div className="glass-panel rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 text-text-primary">Guidewire Integration Guide</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-2 text-text-primary">1. Business Rule Configuration</h4>
                <div className="bg-bg-elevated rounded-lg p-4 font-mono text-sm text-text-primary">
{`// Add to Policy Business Rules
when Policy is updated {
  call ExternalEventService.sendEvent({
    entity: "Policy",
    eventType: "UPDATE",
    entityId: Policy.PolicyNumber,
    changes: getChangedFields()
  });
}`}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2 text-text-primary">2. REST API Configuration</h4>
                <div className="bg-bg-elevated rounded-lg p-4 text-sm text-text-primary">
                  <p className="mb-2">Configure the external API endpoint in Guidewire:</p>
                  <ul className="list-disc list-inside space-y-1 text-text-secondary">
                    <li>Add REST endpoint configuration</li>
                    <li>Configure authentication (API keys, OAuth)</li>
                    <li>Set up retry logic for failed requests</li>
                    <li>Configure request/response mapping</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2 text-text-primary">3. Error Handling</h4>
                <div className="bg-bg-elevated rounded-lg p-4 text-sm text-text-primary">
                  <p className="mb-2">Implement proper error handling:</p>
                  <ul className="list-disc list-inside space-y-1 text-text-secondary">
                    <li>Log failed API calls</li>
                    <li>Implement circuit breaker pattern</li>
                    <li>Queue events for retry on failure</li>
                    <li>Monitor API health and latency</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Testing Section */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-text-primary">Testing the Integration</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2 text-text-primary">Using curl</h4>
                <div className="bg-bg-elevated rounded-lg p-4 font-mono text-sm text-text-primary overflow-x-auto">
{`curl -X POST http://localhost:3000/api/external/events \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: dev-guidewire-key" \\
  -d '{
    "entity": "Policy",
    "eventType": "UPDATE",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "entityId": "POL-001",
    "changes": {
      "premium": { "oldValue": 1000, "newValue": 1200 }
    }
  }'`}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2 text-text-primary">Using JavaScript</h4>
                <div className="bg-bg-elevated rounded-lg p-4 font-mono text-sm text-text-primary overflow-x-auto">
{`fetch('/api/external/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'dev-guidewire-key'
  },
  body: JSON.stringify({
    entity: 'Policy',
    eventType: 'UPDATE',
    timestamp: new Date().toISOString(),
    entityId: 'POL-001',
    changes: { premium: { oldValue: 1000, newValue: 1200 } }
  })
});`}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-text-primary">Local Quick Start</h3>
            <div className="space-y-3 text-text-secondary text-sm">
              <p>Run the app locally, then use the mock event generator or curl to POST events to <code className="font-mono">/api/external/events</code>.</p>
              <p>The app stores policy and event history in <code className="font-mono">/data/store.json</code> and <code className="font-mono">/data/external-events.json</code>, so state persists across dev server restarts.</p>
              <p>Use <code className="font-mono">dev-guidewire-key</code> as the default API key in local mode. In production, configure <code className="font-mono">GW_EXTERNAL_EVENTS_API_KEY</code>.</p>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-text-primary">What Still Needs Guidewire VM</h3>
            <div className="space-y-3 text-text-secondary text-sm">
              <p>This local project is a feature-level proof of concept. True Guidewire integration requires:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>PolicyCenter/ClaimCenter screens and PCF page definitions</li>
                <li>Guidewire entity model customization and data extension</li>
                <li>Business rules and event hooks inside actual Guidewire rules</li>
                <li>Real integration tests with Guidewire runtime and JVM-based services</li>
              </ul>
              <p>The current local build covers API simulation, event replay, validation, persistence, and monitoring without needing a Guidewire VM.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}