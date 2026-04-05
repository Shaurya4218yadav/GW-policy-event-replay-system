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
    return <div className="p-32 text-center forensic-text uppercase tracking-[0.4em] text-text-dim/60 font-black flex flex-col items-center gap-6">
      <div className="w-16 h-px bg-status-error/40 glow-secondary" />
      ACCESS_DENIED // ADMINISTRATIVE_ELEVATION_REQUIRED
      <div className="w-16 h-px bg-status-error/40 glow-secondary" />
    </div>;
  }

  return (
    <div className="relative min-h-screen bg-bg-base text-text-primary transition-all duration-700 overflow-hidden pt-24 px-12 selection:bg-accent selection:text-black">
      {/* HEADER HUD */}
      <div className="mb-16 relative z-10 transition-all duration-1000">
        <h1 className="tool-title !text-2xl tracking-tighter uppercase flex items-center gap-4">
           <span className="w-1.5 h-6 bg-status-error rounded-full shadow-[0_0_20px_rgba(239,68,68,0.3)] glow-secondary animate-pulse" />
           <span className="text-signal-gradient font-black">ADMINISTRATIVE_COMMAND_NODE</span>
        </h1>
        <div className="flex items-center gap-5 forensic-text uppercase tracking-[0.4em] font-bold !text-[9.5px] pl-6 mt-3">
           <span className="text-status-error underline decoration-status-error/20 underline-offset-[10px]">ROOT_ACCESS_ELEVATED</span>
           <span className="w-2 h-px bg-white/10" />
           <span className="text-text-secondary">KERNEL_ID: 0x{events.length.toString(16).padStart(4, '0')}</span>
           <span className="w-2 h-px bg-white/10" />
           <span className="text-status-success">HEALTH: {systemStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 relative z-10">
        <div className="glass-panel p-10 rounded-3xl border-white/5 group hover:border-accent/20 transition-all duration-700">
          <div className="tool-label !text-[7px] text-text-dim/60 mb-4 uppercase tracking-[0.2em] font-bold">SIGNAL_SEQUENCE_LENGTH</div>
          <div className="tool-value !text-5xl text-text-primary font-black tracking-tighter group-hover:text-accent transition-all group-hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">{totalEvents}</div>
        </div>
        <div className="glass-panel p-10 rounded-3xl border-white/5 group hover:border-status-success/20 transition-all duration-700">
          <div className="tool-label !text-[7px] text-text-dim/60 mb-4 uppercase tracking-[0.2em] font-bold">ENGINE_KERNEL_STATE</div>
          <div className="tool-value !text-xl text-status-success font-black tracking-[0.4em] uppercase">{systemStatus}</div>
        </div>
        <div className="glass-panel p-10 rounded-3xl border-white/5 group hover:border-accent/10 transition-all duration-700">
          <div className="tool-label !text-[7px] text-text-dim/60 mb-4 uppercase tracking-[0.2em] font-bold">KERNEL_LOAD_INDEX</div>
          <div className="tool-value !text-5xl text-text-primary font-black tracking-tighter">0.02%</div>
        </div>
        <div className="glass-panel p-10 rounded-3xl border-white/5 group hover:border-accent/10 transition-all duration-700">
          <div className="tool-label !text-[7px] text-text-dim/60 mb-4 uppercase tracking-[0.2em] font-bold">CONNECTED_UPLINKS</div>
          <div className="tool-value !text-5xl text-text-primary font-black tracking-tighter">01</div>
        </div>
      </div>

      <div className="max-w-3xl relative z-10">
        <div className="glass-panel p-12 rounded-[40px] border-status-error/10 bg-status-error/[0.02] hover:bg-status-error/[0.04] transition-all duration-700 shadow-2xl">
          <div className="flex items-center gap-5 mb-12">
             <div className="w-2.5 h-2.5 rounded-full bg-status-error animate-signal-pulse glow-secondary" />
             <h2 className="tool-title !text-sm tracking-[0.4em] uppercase text-status-error font-black">INFRASTRUCTURE_OPS: DANGER_ZONE</h2>
          </div>
          
          <div className="space-y-10">
            <div className="space-y-4 border-l border-status-error/10 pl-8">
              <div className="forensic-text !text-[11px] text-status-error/60 uppercase mb-4 tracking-[0.3em] font-black">SIGNAL_PURGE_SEQUENCE</div>
              <p className="forensic-text text-text-dim leading-relaxed text-[11px] font-bold uppercase tracking-widest">
                EXECUTING_A_SYSTEM_RESET_WILL_PERMANENTLY_ERASE_ALL_HISTORICAL_SIGNALS_AND_REVERT_KERNEL_STATE_TO_INITIAL_BASELINE. 
                THIS_ACTION_COULD_TRIGGER_DATA_LOSS_ACROSS_ALL_DOWNSTREAM_NODES.
              </p>
            </div>

            <button 
              onClick={handleReset}
              className="group relative w-full h-16 overflow-hidden border border-status-error/20 hover:border-status-error transition-all duration-700 rounded-full"
            >
              <div className="absolute inset-0 bg-status-error/5 group-hover:bg-status-error/10 transition-all" />
              <div className="relative flex items-center justify-center gap-6">
                 <div className="w-2 h-2 rounded-full bg-status-error/40 group-hover:animate-ping glow-secondary" />
                 <span className="forensic-text !text-[10px] tracking-[0.5em] font-black text-status-error group-hover:text-status-error group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                   [ TRIGGER_FULL_SIGNAL_PURGE ]
                 </span>
              </div>
            </button>
          </div>

          <div className="mt-16 pt-10 border-t border-white/5 flex justify-between items-center">
            <div className="flex flex-col gap-2">
               <span className="tool-label !text-[7px] text-text-dim/40 uppercase font-bold tracking-[0.2em]">TERMINAL_LAST_UPLINK</span>
               <span className="forensic-text !text-[10px] text-text-dim/60 font-black tracking-widest">{lastUpdate}</span>
            </div>
            <div className="forensic-text !text-[9px] text-text-dim/10 tracking-[0.4em] font-black">0x7F_SECURE_KERNEL</div>
          </div>
        </div>
      </div>

      {/* BACKGROUND DECORATIONS */}
      <div className="fixed top-1/4 -right-48 w-[800px] h-[800px] bg-status-error/[0.02] blur-[200px] rounded-full -z-10 animate-pulse" />
      <div className="fixed bottom-1/4 -left-48 w-[500px] h-[500px] bg-status-error/[0.01] blur-[150px] rounded-full -z-10" />
      
      {/* GRID TRACES */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] -z-10" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '150px 150px' }} />
    </div>
  );
}
