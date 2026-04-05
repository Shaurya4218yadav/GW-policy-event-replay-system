"use client";

import React from "react";
import { useAppContext } from "../context/AppContext";

export default function AdminPage() {
  const { events, role, setEvents, setPolicy } = useAppContext();

  const totalEvents = events.length;
  const lastUpdate = events[events.length - 1]?.timestamp || "N/A";
  const systemStatus = "OPERATIONAL";

  const handleReset = async () => {
    if (confirm("Permanently reset system to initial state?")) {
      try {
        const res = await fetch("/api/reset", { method: "POST" });
        const data = await res.json();
        setPolicy(data.policy); // Local only
        setEvents(data.events); // Local only
        alert("System record has been purged successfully.");
      } catch (error) {
        console.error("Failed to reset system:", error);
      }
    }
  };

  if (role !== "admin") {
    return <div className="p-32 text-center text-slate-500 font-mono text-xs uppercase tracking-widest leading-loose">
      Access Denied // administrative elevation required
    </div>;
  }

  return (
    <div className="p-12 pl-32 min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="flex flex-col mb-16">
        <h1 className="text-3xl font-bold tracking-tight mb-2 transition-colors">Administrative Console</h1>
        <p className="text-slate-500 dark:text-slate-400 font-mono text-xs uppercase tracking-widest">
          Low-Level System Controls // Root Access Enabled
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-none transition-colors">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Event Signals</div>
          <div className="text-4xl font-mono transition-colors">{totalEvents}</div>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-none transition-colors">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Engine Status</div>
          <div className="text-xl font-mono text-emerald-600 dark:text-emerald-500">{systemStatus}</div>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-none transition-colors">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">System Load</div>
          <div className="text-4xl font-mono transition-colors">0.02%</div>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-none transition-colors">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Active Peers</div>
          <div className="text-4xl font-mono transition-colors">1</div>
        </div>
      </div>

      <div className="max-w-2xl bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-8 space-y-8 shadow-xl dark:shadow-none transition-all hover:border-red-500/20">
        <h2 className="text-sm font-bold uppercase tracking-widest transition-colors tracking-tighter">Infrastructure Operations</h2>
        
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
          <h3 className="text-xs font-bold text-red-600 dark:text-red-500 uppercase mb-2">Danger Zone: System Erasure</h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-500 font-mono leading-relaxed mb-6">
            Executing a system reset will purge all historical events and revert the policy state to the initial production baseline. This action is irreversible.
          </p>
          <button 
            onClick={handleReset}
            className="w-full py-4 bg-red-600/10 hover:bg-red-600 text-red-600 dark:text-red-500 hover:text-white border border-red-600/30 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 transform active:scale-[0.98]"
          >
            Trigger Full System Erase
          </button>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Terminal Signal Index</div>
          <p className="text-xs text-slate-500 font-mono leading-relaxed">
            Last Signal Received: {lastUpdate}
          </p>
        </div>
      </div>
    </div>
  );
}
