"use client";

import React, { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { reconstructState } from "@/lib/replayEngine";
import { Policy } from "@/types/policy";

export default function ValidationPage() {
  const { events, policy } = useAppContext();
  const [sliderIndex, setSliderIndex] = useState(0);

  const timestamps = useMemo(() => {
    return events
      .map((event) => event.timestamp)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [events]);

  const selectedTime = timestamps[sliderIndex] || "";
  const { state: historicalPolicy, progression } = reconstructState(events, selectedTime);

  const validationField = (field: keyof Policy) => {
    if (!historicalPolicy) return "NO DATA";
    if (typeof historicalPolicy[field] === "number" || typeof policy[field] === "number") {
      return Number(historicalPolicy[field]) === Number(policy[field]) ? "MATCH" : "MISMATCH";
    }
    return String(historicalPolicy[field]) === String(policy[field]) ? "MATCH" : "MISMATCH";
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      selectedTime,
      policySnapshot: policy,
      historicalState: historicalPolicy || null,
      validation: {
        premium: validationField("premium"),
        coverageLimit: validationField("coverageLimit"),
        status: validationField("status"),
      },
      progression,
      eventCount: timestamps.length,
      events: events.filter((event) => new Date(event.timestamp).getTime() <= new Date(selectedTime).getTime()),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `validation-report-${new Date().toISOString()}.json`;
    link.click();
  };

  const exportReportCsv = () => {
    const rows = [
      ["field", "current", "historical", "validation"],
      ["premium", policy.premium, historicalPolicy?.premium ?? "N/A", validationField("premium")],
      ["coverageLimit", policy.coverageLimit, historicalPolicy?.coverageLimit ?? "N/A", validationField("coverageLimit")],
      ["status", policy.status, historicalPolicy?.status ?? "N/A", validationField("status")],
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `validation-report-${new Date().toISOString()}.csv`;
    link.click();
  };

  return (
    <div className="relative min-h-screen bg-bg-base text-text-primary transition-all duration-700 overflow-x-hidden selection:bg-accent selection:text-black pt-32 px-8 pb-16">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-signal-gradient">Validation Hub</h1>
          <p className="mt-4 text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Reconstruct policy state over time and verify whether historical values still match the current data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-8">
          <div className="glass-panel rounded-3xl p-8 border border-white/10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-text-secondary mb-2">Timeline Selection</p>
                  <h2 className="text-2xl font-semibold text-text-primary">Time Slider Replay</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={exportReport}
                    className="rounded-full bg-accent px-5 py-3 text-black font-semibold uppercase tracking-[0.18em] text-xs hover:bg-accent/90 transition"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={exportReportCsv}
                    className="rounded-full bg-white/10 px-5 py-3 text-text-primary font-semibold uppercase tracking-[0.18em] text-xs hover:bg-white/20 transition"
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-text-secondary text-sm">Move the slider to select a historic reconstruction point.</div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(timestamps.length - 1, 0)}
                  value={sliderIndex}
                  onChange={(e) => setSliderIndex(Number(e.target.value))}
                  className="w-full accent-accent"
                  disabled={timestamps.length === 0}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-panel rounded-2xl p-4 border border-white/10">
                    <p className="text-xs uppercase tracking-[0.35em] text-text-secondary">Selected timestamp</p>
                    <p className="mt-2 text-sm text-text-primary break-words">{selectedTime || "No events available"}</p>
                  </div>
                  <div className="glass-panel rounded-2xl p-4 border border-white/10">
                    <p className="text-xs uppercase tracking-[0.35em] text-text-secondary">Event count</p>
                    <p className="mt-2 text-2xl font-semibold text-text-primary">{timestamps.length}</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-3xl bg-bg-elevated p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Validation Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["premium", "coverageLimit", "status"] as const).map((field) => {
                    const status = validationField(field);
                    const isMatch = status === "MATCH";
                    return (
                      <div key={field} className="rounded-3xl p-4 border border-white/10 bg-bg-base/50">
                        <div className="text-xs uppercase tracking-[0.3em] text-text-secondary mb-2">{field}</div>
                        <div className={`text-2xl font-bold ${isMatch ? "text-status-success" : "text-status-error"}`}>{status}</div>
                        <div className="text-text-secondary text-sm mt-3">
                          Historical vs current comparison
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 border border-white/10 bg-bg-elevated">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-text-primary">Reconstructed State</h3>
                <p className="text-text-secondary text-sm mt-2">This is the computed policy snapshot at the selected timestamp.</p>
              </div>
              <div className="space-y-4">
                {historicalPolicy ? (
                  <div className="grid grid-cols-1 gap-4">
                    {(["id", "name", "premium", "coverageLimit", "status"] as const).map((key) => {
                      const currentValue = policy[key];
                      const historicalValue = historicalPolicy[key];
                      const match = String(currentValue) === String(historicalValue);
                      return (
                        <div key={key} className="rounded-2xl border border-white/10 p-4 bg-bg-base/70">
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <span className="font-semibold text-text-primary uppercase tracking-[0.18em] text-[10px]">{key}</span>
                            <span className={`text-[10px] uppercase tracking-[0.3em] font-bold ${match ? 'text-status-success' : 'text-status-error'}`}>
                              {match ? 'MATCH' : 'MISMATCH'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="rounded-2xl bg-bg-elevated p-3">
                              <div className="text-[9px] uppercase tracking-[0.3em] text-text-secondary mb-1">Current</div>
                              <div className="font-mono text-text-primary">{String(currentValue)}</div>
                            </div>
                            <div className="rounded-2xl bg-bg-elevated p-3">
                              <div className="text-[9px] uppercase tracking-[0.3em] text-text-secondary mb-1">Historical</div>
                              <div className="font-mono text-text-primary">{String(historicalValue)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 p-6 text-text-secondary text-sm">
                    No reconstructed policy data is available for the selected time range.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-white/10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-text-primary">State Progression</h3>
              <p className="text-text-secondary text-sm mt-1">The reconstruction steps that led to the selected historical state.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-text-secondary">{progression.length} steps</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {progression.map((step) => (
              <span key={step} className="rounded-full bg-accent/10 px-4 py-2 text-sm text-accent">{step}</span>
            ))}
            {progression.length === 0 && <span className="text-text-secondary text-sm">No lifecycle states reconstructed.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
