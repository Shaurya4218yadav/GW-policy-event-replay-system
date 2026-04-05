"use client";

import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import EventTimeline from "../components/EventTimeline";
import UpdateForm from "../components/UpdateForm";
import SimulationPanel from "../components/SimulationPanel";
import ReplayView from "../components/ReplayView";
import { Policy } from "@/types/policy";
import { ReplayEvent } from "@/types/event";

export default function SimulationPage() {
  const { policy, syncPolicy, events, setEvents, addExternalEvent, role } = useAppContext();
  const [activeTimestamp, setActiveTimestamp] = useState<string | null>(null);

  const handleUpdatePolicy = async (newPolicy: Policy) => {
    const parsedPolicy = {
      ...newPolicy,
      premium: Number(newPolicy.premium),
      coverageLimit: Number(newPolicy.coverageLimit),
    };

    const newEvents: ReplayEvent[] = [];
    const now = new Date().toISOString();

    if (policy.premium !== parsedPolicy.premium) {
      newEvents.push({
        id: crypto.randomUUID(),
        type: "POLICY_QUOTED",
        payload: { premium: parsedPolicy.premium },
        timestamp: now,
      });
    }

    if (policy.status !== "Active" && parsedPolicy.status === "Active") {
      newEvents.push({
        id: crypto.randomUUID(),
        type: "POLICY_BOUND",
        payload: { status: "Active" },
        timestamp: now,
      });
    }

    if (policy.coverageLimit !== parsedPolicy.coverageLimit) {
      newEvents.push({
        id: crypto.randomUUID(),
        type: "POLICY_ENDORSED",
        payload: { coverageLimit: parsedPolicy.coverageLimit },
        timestamp: now,
      });
    }

    if (newEvents.length > 0) {
      // Use syncPolicy and addExternalEvent for persistence
      await syncPolicy(parsedPolicy);
      for (const event of newEvents) {
        await addExternalEvent(event);
      }
    }
  };

  const handleSimulateScenario = (generatedEvents: ReplayEvent[]) => {
    // Local update only because backend has already appended these to the store
    setEvents((prev) => [...prev, ...generatedEvents]);
  };

  const canReplay = role === "analyst" || role === "admin";

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
      {/* BACKGROUND HEADER */}
      <div className="fixed top-0 left-20 right-0 py-6 px-12 border-b border-slate-200 dark:border-[#262626] bg-background/80 backdrop-blur-md z-40 flex justify-between items-center transition-colors">
        <div>
          <h1 className="text-xl font-bold tracking-tight">System Replay Console</h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-widest mt-1">
            Deterministic Simulation Environment // Mode: {role}
          </p>
        </div>
      </div>

      {/* LEFT FLOATING PANEL - CONTROLS */}
      <aside className="fixed left-28 top-32 w-80 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar z-30 transition-all duration-500">
        <div className="space-y-8 pb-12">
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#262626] rounded-xl overflow-hidden shadow-sm dark:shadow-none hover:border-blue-500/30 transition-colors">
            <UpdateForm policy={policy} onUpdate={handleUpdatePolicy} />
          </div>
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#262626] rounded-xl overflow-hidden shadow-sm dark:shadow-none hover:border-blue-500/30 transition-colors">
            <SimulationPanel 
              onSimulate={handleSimulateScenario} 
              currentPremium={policy.premium} 
              currentCoverage={policy.coverageLimit} 
            />
          </div>
        </div>
      </aside>

      {/* CENTRAL TIMELINE */}
      <main className="mx-auto w-full max-w-[1200px] pt-40 pb-40">
        <EventTimeline events={events} activeTimestamp={activeTimestamp} />
      </main>

      {/* RIGHT FLOATING PANEL - STATE & REPLAY */}
      <aside className="fixed right-8 top-32 w-96 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar z-30 transition-all duration-500">
        <div className="space-y-8 pb-12">
          {canReplay ? (
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#262626] rounded-xl overflow-hidden shadow-sm dark:shadow-none hover:border-blue-500/30 transition-colors">
              <ReplayView 
                events={events} 
                currentPolicy={policy} 
                onTimeSelect={(ts) => setActiveTimestamp(ts)}
              />
            </div>
          ) : (
            <div className="p-8 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#262626] rounded-xl text-center shadow-sm dark:shadow-none">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Replay Blocked</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                Historical state reconstruction requires ANALYST or ADMIN elevation.
              </p>
            </div>
          )}
        </div>
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #262626;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
}
