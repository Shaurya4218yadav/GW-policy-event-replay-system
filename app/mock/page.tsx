"use client";

import { useState } from "react";

const sampleEvents = {
  policyUpdate: {
    entity: "Policy",
    eventType: "UPDATE",
    timestamp: new Date().toISOString(),
    entityId: "POL-999",
    userId: "guidewire-demo",
    changes: {
      premium: { oldValue: 1200, newValue: 1500 },
      coverageLimit: { oldValue: 50000, newValue: 75000 },
    },
  },
  claimReport: {
    entity: "Claim",
    eventType: "REPORT",
    timestamp: new Date().toISOString(),
    entityId: "CLM-999",
    userId: "guidewire-demo",
    changes: {
      status: { oldValue: null, newValue: "Open" },
      amount: { oldValue: null, newValue: 5300 },
    },
  },
};

export default function MockGuidewirePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [apiKey, setApiKey] = useState("dev-guidewire-key");

  const sendEvent = async (payload: Record<string, unknown>) => {
    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    setIsSending(true);
    setLogs((prev) => [`Sending ${payload.eventType} event...`, ...prev]);

    while (attempt < maxRetries && !success) {
      attempt += 1;
      try {
        const response = await fetch("/api/external/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setLogs((prev) => [`✅ [Attempt ${attempt}] ${payload.eventType} event sent`, ...prev]);
          success = true;
          break;
        }

        const message = data?.error || response.statusText || "Unknown error";
        setLogs((prev) => [`⚠️ [Attempt ${attempt}] ${message}`, ...prev]);

        if (response.status >= 500 || response.status === 401) {
          await new Promise((res) => setTimeout(res, attempt * 800));
          continue;
        }

        break;
      } catch (error) {
        setLogs((prev) => [`❌ [Attempt ${attempt}] Failed to send event: ${String(error)}`, ...prev]);
        await new Promise((res) => setTimeout(res, attempt * 800));
      }
    }

    if (!success) {
      setLogs((prev) => [`🚫 All retry attempts failed for ${payload.eventType}`, ...prev]);
    }

    setIsSending(false);
  };

  const sendTrafficBurst = async () => {
    if (isSending) return;
    setLogs((prev) => [`🚀 Starting mock Guidewire burst traffic...`, ...prev]);
    await sendEvent(sampleEvents.policyUpdate);
    await new Promise((resolve) => setTimeout(resolve, 700));
    await sendEvent(sampleEvents.claimReport);
    await new Promise((resolve) => setTimeout(resolve, 700));
    await sendEvent({
      entity: "Policy",
      eventType: "ENDORSE",
      timestamp: new Date().toISOString(),
      entityId: "POL-999",
      userId: "guidewire-demo",
      changes: {
        coverageLimit: { oldValue: 50000, newValue: 75000 },
      },
    });
    setLogs((prev) => [`✅ Burst traffic complete`, ...prev]);
  };

  return (
    <div className="relative min-h-screen bg-bg-base text-text-primary transition-all duration-700 overflow-x-hidden selection:bg-accent selection:text-black pt-32 px-8 pb-16">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-signal-gradient">Guidewire Event Simulator</h1>
          <p className="mt-4 text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Generate mock Guidewire payloads locally and stream them through the external event API.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-panel rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-semibold mb-6">Payload Generator</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-[0.3em] text-text-secondary">API Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-bg-base/80 px-4 py-3 text-sm text-text-primary focus:border-accent outline-none"
                />
                <p className="text-text-secondary text-xs">Use the token below for local Guidewire auth simulation.</p>
              </div>
              <button
                disabled={isSending}
                className="w-full rounded-3xl bg-gradient-to-r from-accent-primary to-accent-secondary text-black font-semibold py-4 hover:shadow-lg transition"
                onClick={() => sendEvent(sampleEvents.policyUpdate)}
              >
                Send Policy Update Event
              </button>
              <button
                disabled={isSending}
                className="w-full rounded-3xl bg-white/5 border border-white/10 text-text-primary font-semibold py-4 hover:border-accent/30 transition"
                onClick={() => sendEvent(sampleEvents.claimReport)}
              >
                Send Claim Report Event
              </button>
              <button
                disabled={isSending}
                className="w-full rounded-3xl bg-gradient-to-r from-slate-700 to-slate-900 text-white font-semibold py-4 hover:shadow-lg transition"
                onClick={sendTrafficBurst}
              >
                Send Burst Traffic
              </button>
              <div className="rounded-3xl border border-white/10 bg-bg-elevated p-4 text-sm text-text-secondary">
                <p className="font-semibold text-text-primary mb-2">Example payload format</p>
                <pre className="overflow-x-auto text-xs font-mono leading-relaxed">
{`{
  "entity": "Policy",
  "eventType": "UPDATE",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "entityId": "POL-999",
  "userId": "guidewire-demo",
  "changes": {
    "premium": { "oldValue": 1200, "newValue": 1500 }
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-semibold mb-6">Simulation Logs</h2>
            <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
              {logs.length === 0 ? (
                <div className="text-text-secondary text-sm">No events sent yet. Use the buttons to stream sample Guidewire events.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="rounded-2xl bg-bg-base/80 border border-white/10 p-4 text-sm text-text-primary">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
