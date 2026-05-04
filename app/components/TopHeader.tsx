"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { usePathname } from "next/navigation";

export default function TopHeader() {
  const { events, systemTime, user, policy } = useAppContext();
  const pathname = usePathname();
  
  const isOverview = pathname === "/overview";

  // Telemetry Calculations
  const uniqueTypes = new Set(events.map(e => e.type)).size;
  const entropy = events.length > 0 ? (uniqueTypes / events.length * 100).toFixed(0) : "0";
  const pulseRate = events.length > 0 ? Math.min(100, events.length * 5) : 0; 

  if ((!user && !isOverview) || pathname === "/login") return null;

  // Determine System Status from policy state
  const isError = policy.status.toLowerCase() === 'cancelled';
  const isDraft = policy.status.toLowerCase() === 'draft';
  const dotColor = isError ? 'bg-status-error' : isDraft ? 'bg-status-warning' : 'bg-status-success';
  const dotPingColor = isError ? 'bg-status-error/40' : isDraft ? 'bg-status-warning/40' : 'bg-status-success/40';
  const statusLabel = isError ? 'Error / Halted' : isDraft ? 'Draft Mode' : 'Active';

  return (
    <header className="fixed top-2 left-1/2 -translate-x-1/2 w-[90%] lg:w-[800px] h-9 glass-panel z-50 flex items-center justify-between px-6 rounded-full animate-hud-slide">
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className={`w-2.5 h-2.5 rounded-full ${dotPingColor} blur-[2px] animate-pulse absolute`} />
          <div className={`w-1.5 h-1.5 rounded-full ${dotColor} relative z-10`} />
        </div>
        <span className="forensic-text uppercase tracking-[0.2em] flex items-center gap-4 !text-[8.5px]">
          <div className="flex items-center gap-1.5 group">
            <span className="opacity-30 group-hover:opacity-50 transition-opacity">SYS_STATE:</span>
            <span className="text-text-primary font-bold group-hover:text-accent transition-colors">{statusLabel}</span>
          </div>
          <span className="opacity-10 border-l border-white/5 h-3"></span>
          <div className="flex items-center gap-1.5 group">
            <span className="opacity-30 group-hover:opacity-50 transition-opacity">SIGNAL_SEQ:</span>
            <span className="text-accent font-bold group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] transition-all">{events.length}</span>
          </div>
          <span className="opacity-10 border-l border-white/5 h-3"></span>
          <div className="hidden sm:flex items-center gap-4">
             <div className="flex items-center gap-1.5 group">
                <span className="opacity-30 group-hover:opacity-50 transition-opacity">ENTROPY:</span>
                <span className="text-text-secondary group-hover:text-text-primary font-medium transition-all">{entropy}%</span>
             </div>
             <div className="flex items-center gap-1.5 group">
                <span className="opacity-30 group-hover:opacity-50 transition-opacity">PULSE:</span>
                <span className="text-text-secondary group-hover:text-text-primary font-medium transition-all">{pulseRate}%</span>
             </div>
          </div>
        </span>
      </div>

      <div className="flex items-center gap-4">
         <span className="forensic-text opacity-30 uppercase tracking-widest hidden md:inline">
            T_TRACE: {systemTime || "00:00:00"}
         </span>
      </div>
    </header>
  );
}
