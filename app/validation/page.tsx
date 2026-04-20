"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { reconstructState } from "@/lib/replayEngine";
import { Policy } from "@/types/policy";

export default function ValidationPage() {
  const { events, policy } = useAppContext();
  const [mounted, setMounted] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [reconstructedState, setReconstructedState] = useState<any>(null);
  const [progressionSteps, setProgressionSteps] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    console.log("Validation Engine Initialized. Events:", events.length);
  }, [events]);

  // 1. FORCE CHRONOLOGICAL ORDER
  const sortedEvents = useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [events]);

  // 2. SYNC RECONSTRUCTION
  useEffect(() => {
    if (sortedEvents.length > 0) {
      const selectedEvent = sortedEvents[sliderIndex];
      if (selectedEvent) {
        console.log(`Reconstructing state at index ${sliderIndex} (TS: ${selectedEvent.timestamp})`);
        const { replay } = reconstructState(sortedEvents, selectedEvent.timestamp);
        setReconstructedState(replay.state);
        setProgressionSteps(replay.progression);
      }
    }
  }, [sliderIndex, sortedEvents]);

  if (!mounted || (events && events.length === 0)) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center forensic-text uppercase tracking-[0.4em] text-accent animate-pulse">
        Initializing_Validation_Stream...
      </div>
    );
  }

  const selectedEvent = sortedEvents[sliderIndex];
  const selectedTime = selectedEvent?.timestamp || "";

  const validationField = (field: keyof Policy) => {
    if (!reconstructedState) return "NO DATA";
    
    const past = reconstructedState[field];
    const current = policy[field];

    if (typeof past === "number" || typeof current === "number") {
      return Number(past) === Number(current) ? "MATCH" : "MISMATCH";
    }
    return String(past) === String(current) ? "MATCH" : "MISMATCH";
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      selectedTime,
      policySnapshot: policy,
      historicalState: reconstructedState || null,
      validation: {
        premium: validationField("premium"),
        coverageLimit: validationField("coverageLimit"),
        status: validationField("status"),
      },
      progression: progressionSteps,
      eventCount: sortedEvents.length,
      events: sortedEvents.filter((e) => new Date(e.timestamp).getTime() <= new Date(selectedTime).getTime()),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `validation-report-${new Date().toISOString()}.json`;
    link.click();
  };

  return (
    <div className="relative min-h-screen bg-bg-base text-text-primary transition-all duration-700 overflow-x-hidden selection:bg-accent selection:text-black pt-32 px-8 pb-16">
      
      {/* 🛠️ TEMPORARY DEBUG HUD */}
      <div className="fixed top-24 right-8 z-[100] glass-panel p-4 border border-accent/20 text-[8px] font-mono space-y-1 bg-black/80 max-w-xs overflow-hidden">
         <div className="text-accent border-b border-accent/20 pb-1 mb-2 font-bold uppercase tracking-widest">Debug_Telemetry</div>
         <div className="flex justify-between"><span>TOTAL_EVENTS:</span> <span className="text-white">{sortedEvents.length}</span></div>
         <div className="flex justify-between"><span>ACTIVE_INDEX:</span> <span className="text-white">{sliderIndex}</span></div>
         <div className="flex justify-between"><span>SLIDER_TS:</span> <span className="text-white text-[6px]">{selectedTime || 'N/A'}</span></div>
         <div className="mt-2 text-accent/50">RECONSTRUCTED_STATE:</div>
         <pre className="text-[6px] text-text-secondary/70 overflow-x-auto">
            {JSON.stringify(reconstructedState, (k,v) => k === 'reasons' ? undefined : v, 2)}
         </pre>
      </div>

      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-signal-gradient tracking-tighter">Validation Hub</h1>
          <p className="mt-4 text-text-secondary max-w-2xl mx-auto leading-relaxed border-l-2 border-accent/20 pl-6 italic">
            Deterministic state reconstruction engine. move the slider to scrub through system history and verify data integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-8">
          <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-text-secondary mb-2">Timeline Control</p>
                  <h2 className="text-2xl font-semibold text-text-primary">Master Sequence scrubbing</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={exportReport}
                    className="rounded-full bg-accent px-5 py-3 text-black font-extrabold uppercase tracking-[0.18em] text-[10px] hover:bg-accent/90 transition shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  >
                    Generate Report
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-text-secondary text-[10px] uppercase font-bold tracking-widest flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                   Scrub through {sortedEvents.length} distinct system signals
                </div>
                
                <input
                  type="range"
                  min={0}
                  max={Math.max(sortedEvents.length - 1, 0)}
                  value={sliderIndex}
                  onChange={(e) => setSliderIndex(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-accent"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-panel rounded-2xl p-5 border border-white/5 bg-white/[0.02]">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-text-secondary font-black mb-3">Target_Timestamp</p>
                    <p className="text-[11px] font-mono text-accent truncate bg-black/30 p-2 rounded border border-white/5">
                      {mounted ? (selectedTime || "NO_SEQUENCE_DETECTED") : "CALIBRATING..."}
                    </p>
                  </div>
                  <div className="glass-panel rounded-2xl p-5 border border-white/5 bg-white/[0.02]">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-text-secondary font-black mb-3">Engine_Sequence</p>
                    <p className="text-2xl font-black text-text-primary font-mono tracking-tighter">
                       {String(sliderIndex + 1).padStart(3, '0')} / {String(sortedEvents.length).padStart(3, '0')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-3xl bg-bg-elevated p-8 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <svg width="100" height="100" viewBox="0 0 100 100" className="text-accent fill-current"><path d="M50 0 L100 50 L50 100 L0 50 Z" /></svg>
                </div>
                <h3 className="text-xs font-black text-accent tracking-[0.4em] uppercase mb-8 flex items-center gap-3">
                   <span className="w-4 h-px bg-accent/30" />
                   Validation_Telemetry Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(["premium", "coverageLimit", "status"] as const).map((field) => {
                    const status = validationField(field);
                    const isMatch = status === "MATCH";
                    return (
                      <div key={field} className="relative group/card">
                        <div className={`absolute -inset-0.5 rounded-2xl blur opacity-20 group-hover/card:opacity-40 transition duration-500 ${isMatch ? 'bg-status-success' : 'bg-status-error'}`} />
                        <div className="relative rounded-2xl p-5 border border-white/5 bg-bg-base flex flex-col h-full">
                          <div className="text-[8px] uppercase tracking-[0.4em] text-text-dim font-black mb-1">{field}</div>
                          <div className={`text-xl font-black tracking-tighter ${isMatch ? "text-status-success" : "text-status-error"}`}>
                             {status}
                          </div>
                          <div className="mt-auto pt-4 border-t border-white/5 text-[7px] uppercase tracking-[0.2em] text-text-dim/50 font-bold">
                            Forensic_Verification
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: RECONSTRUCTED STATE */}
          <div className="glass-panel rounded-3xl p-8 border border-white/10 bg-bg-elevated/40 backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-signal-gradient opacity-30" />
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-black text-text-primary tracking-tight">System_State_Trace</h3>
                <p className="text-text-secondary text-[10px] uppercase font-bold tracking-widest mt-2 opacity-50 italic">
                  Reconstructed_snapshot_at_selected_index
                </p>
              </div>
              <div className="space-y-3">
                {reconstructedState ? (
                  <div className="grid grid-cols-1 gap-3">
                    {(["id", "name", "premium", "coverageLimit", "status"] as const).map((key) => {
                      const currentValue = policy[key];
                      const historicalValue = reconstructedState[key];
                      const match = String(currentValue) === String(historicalValue);
                      return (
                        <div key={key} className="rounded-xl border border-white/5 p-4 bg-black/20 hover:bg-black/40 transition-colors group/row">
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <span className="font-bold text-text-dim uppercase tracking-[0.3em] text-[8px] group-hover/row:text-accent transition-colors">{key}</span>
                            <span className={`text-[8px] uppercase tracking-[0.3em] font-black px-2 py-0.5 rounded border ${
                              match ? 'text-status-success border-status-success/20 bg-status-success/5' : 'text-status-error border-status-error/20 bg-status-error/5'
                            }`}>
                              {match ? 'VERIFIED' : 'CONFLICT'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-white/5 p-2 border border-white/5">
                              <div className="text-[6px] uppercase tracking-[0.3em] text-text-dim/50 mb-1 font-bold">Current_Live</div>
                              <div className="font-mono text-[9px] text-white truncate">{String(currentValue)}</div>
                            </div>
                            <div className="rounded-lg bg-accent/5 p-2 border border-accent/10">
                              <div className="text-[6px] uppercase tracking-[0.3em] text-accent/50 mb-1 font-bold">Historical_Trace</div>
                              <div className="font-mono text-[9px] text-accent truncate">{String(historicalValue)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
                    <div className="text-text-dim/30 forensic-text text-[10px] uppercase tracking-[0.5em] animate-pulse">
                       Awaiting_Signal_Reconstruction...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: SYSTEM STEP TRACE */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10 relative">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-text-primary tracking-tight">Mutation_Lifecycle_Analysis</h3>
              <p className="text-text-secondary text-[10px] uppercase font-bold tracking-widest mt-1 opacity-50">
                Trace of state transitions leading to current index
              </p>
            </div>
            <div className="px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
               <span className="text-[9px] uppercase tracking-[0.35em] text-accent font-black">{progressionSteps.length} lifecycle_steps</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {progressionSteps.map((step, idx) => (
              <div 
                key={`${step}-${idx}`} 
                className="flex items-center gap-3 group"
              >
                <div className="rounded-lg bg-bg-elevated border border-white/10 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-text-primary group-hover:border-accent/40 transition-all flex items-center gap-3">
                   <div className="w-1 h-1 rounded-full bg-accent" />
                   {step}
                </div>
                {idx < progressionSteps.length - 1 && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                )}
              </div>
            ))}
            {progressionSteps.length === 0 && (
              <div className="text-text-dim/40 forensic-text text-[9px] uppercase tracking-widest italic py-4">
                 // No_Significant_Lifecycle_Mutations_Detected_At_This_Interval
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
