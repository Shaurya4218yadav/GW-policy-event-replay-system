"use client";

import React from "react";
import { useAppContext } from "../context/AppContext";
import PolicyCard from "../components/PolicyCard";

export default function DashboardPage() {
  const { policy, events } = useAppContext();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const recentEvents = [...events].reverse().slice(0, 8);


  return (
    <div className="relative min-h-screen bg-background text-foreground transition-all duration-700 overflow-hidden pt-24 px-12 selection:bg-accent selection:text-black">
      {/* HEADER HUD */}
      <div className="mb-12 relative z-10">
        <h1 className="tool-title !text-2xl tracking-tighter uppercase flex items-center gap-4">
           <span className="w-1.5 h-6 bg-signal-gradient rounded-full glow-primary" />
           <span className="text-signal-gradient">SYSTEM_INTELLIGENCE_DASHBOARD</span>
        </h1>
        <div className="flex items-center gap-4 forensic-text uppercase tracking-[0.3em] font-black !text-[9.5px] pl-6 mt-2">
           <span className="text-accent underline decoration-accent/20 underline-offset-8">LIVE_HEARTBEAT</span>
           <span className="w-1.5 h-px bg-white/10" />
           <span className="text-status-success font-bold">ENGINE_STATUS: OPTIMAL</span>
           <span className="w-1.5 h-px bg-white/10" />
           <span className="text-text-secondary">SIGNAL_COUNT: {events.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 relative z-10">
        {/* CENTRAL FOCUS: POLICY MASTER */}
        <div className="xl:col-span-9 space-y-12">
          <div className="relative group">
            <div className="absolute -inset-8 bg-accent/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
            <PolicyCard policy={policy} events={events} />
          </div>

          {/* SYSTEM METRICS HUD */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="glass-panel p-6 rounded-2xl border-white/5 group hover:border-status-success/20 transition-all duration-500">
              <div className="tool-label !text-[7px] opacity-30 mb-2">SYSTEM_HEALTH</div>
              <div className="tool-value !text-[11px] text-status-success tracking-[0.3em] font-black">CONNECTED</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-white/5 group hover:border-accent/20 transition-all duration-500">
              <div className="tool-label !text-[7px] opacity-30 mb-2">LATENCY_OFFSET</div>
              <div className="tool-value !text-[11px] text-text-primary tracking-[0.3em] font-black">{events.length > 0 ? '0.002MS' : '---'}</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-white/5 group hover:border-accent/20 transition-all duration-500">
              <div className="tool-label !text-[7px] opacity-30 mb-2">UPTIME_VECTOR</div>
              <div className="tool-value !text-[11px] text-text-primary tracking-[0.3em] font-black">99.999%</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-white/5 group hover:border-accent/20 transition-all duration-500">
              <div className="tool-label !text-[7px] opacity-30 mb-2">ENTROPY_INDEX</div>
              <div className="tool-value !text-[11px] text-accent tracking-[0.3em] font-black glow-primary">LOW</div>
            </div>
          </div>
        </div>

        {/* SIDE HUD: SIGNAL STREAM */}
        <div className="xl:col-span-3">
          <div className="glass-panel p-6 rounded-2xl h-full border-white/5">
             <div className="mb-10 flex justify-between items-center">
                <h3 className="tool-label !text-[8.5px] font-black text-text-dim/60 tracking-[0.2em]">RECENT_SIGNALS</h3>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse glow-primary" />
             </div>
            
            <div className="space-y-4">
              {recentEvents.map((event, idx) => (
                <div key={event.id} className="group relative pl-4 border-l border-white/5 hover:border-cyan-400/40 transition-colors py-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="forensic-text !text-[8px] text-cyan-400 font-black opacity-60 group-hover:opacity-100 transition-opacity">S-{String(idx + 1).padStart(2, '0')}</span>
                    <span className="forensic-text !text-[7.5px] text-text-dim/40 group-hover:text-text-dim transition-colors">
                      {mounted ? new Date(event.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                    </span>

                  </div>
                  <div className="forensic-text !text-[10px] text-text-primary/70 truncate uppercase tracking-[0.2em] font-bold group-hover:text-accent transition-colors">
                    {event.type.replace('POLICY_', '')}
                  </div>
                </div>
              ))}
              
              {recentEvents.length === 0 && (
                <div className="forensic-text !text-[9px] opacity-20 italic py-8 text-center">
                  NO_SIGNALS_DETECTED
                </div>
              )}
            </div>

            <button className="w-full mt-10 group relative overflow-hidden h-10 border border-white/5 rounded-full transition-all duration-700 hover:border-accent/40">
              <div className="absolute inset-0 bg-signal-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="relative forensic-text !text-[9px] tracking-[0.3em] font-black text-text-dim group-hover:text-accent transition-all group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                VIEW_ALL_LOGS
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* BACKGROUND DECORATIONS */}
      <div className="fixed top-1/4 -left-20 w-80 h-80 bg-accent/5 blur-[150px] rounded-full -z-10 animate-pulse" />
      <div className="fixed bottom-1/4 -right-20 w-[400px] h-[400px] bg-accent-secondary/5 blur-[200px] rounded-full -z-10" />
      
      {/* GRID TRACES */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] -z-10" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
    </div>
  );
}
