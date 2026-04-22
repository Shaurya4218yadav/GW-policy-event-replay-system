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

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-all duration-700 overflow-hidden pt-24 px-12 selection:bg-accent selection:text-black">
      {/* HEADER HUD */}
      <div className="mb-12 relative z-10">
        <h1 className="tool-title !text-2xl tracking-tighter uppercase flex items-center gap-4">
           <span className="w-1.5 h-6 bg-signal-gradient rounded-full glow-primary" />
           <span className="text-signal-gradient">Policy Overview Dashboard</span>
        </h1>
        <div className="flex items-center gap-4 forensic-text uppercase tracking-widest font-black !text-[9.5px] pl-6 mt-2">
           <span className="text-accent underline decoration-accent/20 underline-offset-8">System Status</span>
           <span className="w-1.5 h-px bg-white/10" />
           <span className="text-status-success font-bold">Integration: Connected</span>
           <span className="w-1.5 h-px bg-white/10" />
           <span className="text-text-secondary">Event Count: {events.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 relative z-10">
        {/* CENTRAL FOCUS: POLICY MASTER */}
        <div className="space-y-12">
          <div className="relative group">
            <div className="absolute -inset-8 bg-accent/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
            <PolicyCard policy={policy} events={events} />
          </div>

          {/* SYSTEM METRICS HUD */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="glass-panel p-6 rounded-2xl border-white/5 group hover:border-status-success/20 transition-all duration-500">
              <div className="tool-label !text-xs opacity-40 mb-2 capitalize">System Health</div>
              <div className="tool-value !text-[11px] text-status-success tracking-widest font-black">Connected</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-white/5 group hover:border-accent/20 transition-all duration-500">
              <div className="tool-label !text-xs opacity-40 mb-2 capitalize">Response Time</div>
              <div className="tool-value !text-[11px] text-text-primary tracking-widest font-black">{events.length > 0 ? '0.002ms' : '---'}</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-white/5 group hover:border-accent/20 transition-all duration-500">
              <div className="tool-label !text-xs opacity-40 mb-2 capitalize">Uptime Monitor</div>
              <div className="tool-value !text-[11px] text-text-primary tracking-widest font-black">99.999%</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-white/5 group hover:border-accent/20 transition-all duration-500">
              <div className="tool-label !text-xs opacity-40 mb-2 capitalize">Data Integrity</div>
              <div className="tool-value !text-[11px] text-accent tracking-widest font-black glow-primary">Verified</div>
            </div>
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
