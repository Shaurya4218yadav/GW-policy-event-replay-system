"use client";

import React from "react";
import { useAppContext } from "../context/AppContext";
import PolicyCard from "../components/PolicyCard";

export default function DashboardPage() {
  const { policy, events, role, systemTime } = useAppContext();

  const recentEvents = [...events].reverse().slice(0, 5);
  const totalEvents = events.length;

  return (
    <div className="p-8 pl-10 md:pl-[88px] min-h-screen max-w-[1400px] mx-auto">
      {/* Header section with system status */}
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-border pb-6 mt-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">System Overview</h1>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-mono text-xs">
              Role: {role || 'unknown'}
            </span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground font-mono text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Status: Active
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-muted-foreground font-mono text-xs flex flex-col gap-1">
            <span>SYS_TIME: {systemTime}</span>
            <span>EVENTS_TOTAL: {totalEvents}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 xl:gap-12 content-start">
        {/* Main Stats */}
        <div className="xl:col-span-3 space-y-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Active Policy State</span>
              <div className="flex-1 border-b border-border border-dashed"></div>
            </div>
            <PolicyCard policy={policy} events={events} />
          </div>

          <div>
             <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest">System Metrics</span>
              <div className="flex-1 border-b border-border border-dashed"></div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="p-5 border-l-2 border-border bg-background hover:bg-muted/5 transition-colors">
                <div className="text-[10px] font-mono text-muted uppercase mb-1">Health</div>
                <div className="text-lg font-mono text-emerald-500/80">OPTIMAL</div>
              </div>
              <div className="p-5 border-l-2 border-border bg-background hover:bg-muted/5 transition-colors">
                <div className="text-[10px] font-mono text-muted uppercase mb-1">Sync Offset</div>
                <div className="text-lg font-mono text-foreground">0.05ms</div>
              </div>
              <div className="p-5 border-l-2 border-border bg-background hover:bg-muted/5 transition-colors">
                <div className="text-[10px] font-mono text-muted uppercase mb-1">Uptime</div>
                <div className="text-lg font-mono text-foreground">99.99%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Stream */}
        <aside className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[10px] font-mono text-muted uppercase tracking-widest">Recent Signals</h2>
          </div>
          
          <div className="flex flex-col gap-px bg-border p-px">
            {recentEvents.map((event) => (
              <div key={event.id} className="p-3 bg-background hover:bg-muted/5 transition-colors flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-mono text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' })}
                  </span>
                  <span className="font-mono text-accent-muted bg-accent/10 px-1 rounded-sm">
                    {event.type.split('_')[0]}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-foreground truncate pl-2 border-l-2 border-border">
                  {event.type}
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-2 py-2 text-[10px] font-mono text-muted-foreground hover:text-foreground border border-border hover:bg-muted/5 transition-colors">
            [ View Full Log ]
          </button>
        </aside>
      </div>
    </div>
  );
}
