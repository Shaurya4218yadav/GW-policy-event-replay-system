"use client";

import React from "react";
import { useAppContext } from "../context/AppContext";
import EventTimeline from "../components/EventTimeline";
import { Policy } from "@/types/policy";

export default function AuditPage() {
  const { events, policy, role } = useAppContext();

  const getDerivedFrom = (field: keyof Policy) => {
    return events
      .filter(e => {
        if (field === "status") return ["POLICY_BOUND", "POLICY_CANCELLED", "POLICY_CREATED", "CLAIM_REPORTED", "CLAIM_APPROVED"].includes(e.type);
        return e.payload !== undefined && e.payload[field] !== undefined;
      })
      .map(e => {
        if (field === "status") {
          const val = e.type === "POLICY_BOUND" ? "Active" : 
                      e.type === "POLICY_CANCELLED" ? "Cancelled" : 
                      e.type === "CLAIM_REPORTED" ? "Claim Open" :
                      e.type === "CLAIM_APPROVED" ? "Claim Approved" : "Draft";
          return { type: e.type, val, ts: e.timestamp };
        }
        return { type: e.type, val: e.payload[field], ts: e.timestamp };
      });
  };

  const renderAuditBlock = (label: string, field: keyof Policy) => {
    const list = getDerivedFrom(field);
    return (
      <div className="glass-panel p-10 rounded-3xl border-white/5 hover:border-accent/10 transition-all duration-700 group">
        <div className="flex items-center gap-4 mb-10">
           <div className="w-1.5 h-1.5 rounded-full bg-accent glow-primary animate-pulse" />
           <h3 className="tool-title !text-[9.5px] tracking-[0.4em] uppercase text-text-dim/60 group-hover:text-text-primary transition-all">
             {label.replace(' ', '_')}_DERIVATION_TRACE
           </h3>
           <div className="flex-1 h-px bg-white/5 group-hover:bg-accent/10 transition-all" />
        </div>
        
        <div className="space-y-10 relative border-l border-white/5 ml-3 pl-10">
          {list.map((item, idx) => (
            <div key={idx} className="group/item relative">
              <div className="absolute w-2 h-2 rounded-full bg-bg-elevated border border-white/10 group-hover/item:border-accent group-hover/item:bg-accent -left-[45px] top-1.5 transition-all glow-primary" />
              <div className="flex justify-between items-start mb-3">
                <span className="forensic-text !text-[8.5px] font-black text-text-dim tracking-widest uppercase opacity-40 group-hover/item:opacity-100 transition-all">
                   {new Date(item.ts).toLocaleString([], { hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                </span>
                <span className="forensic-text !text-[9.5px] text-accent font-black tracking-widest opacity-60 group-hover/item:opacity-100 transition-all group-hover/item:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">{item.type}</span>
              </div>
              <div className="tool-value !text-[11px] text-text-primary/70 group-hover/item:text-text-primary transition-all flex items-center gap-2">
                <span className="tool-label !text-[7px] text-text-dim tracking-[0.2em] font-bold">SIGNAL_VAL:</span>
                <span className="text-text-primary font-black tracking-tight">{typeof item.val === 'number' ? `₹${item.val.toLocaleString()}` : item.val}</span>
              </div>
            </div>
          ))}
          {list.length === 0 && (
             <div className="forensic-text !text-[10px] text-text-dim/40 italic flex items-center gap-3">
               <span className="w-1 h-1 rounded-full bg-white/5" />
               NULL_TRACE: NO_MUTATION_SIGNALS_RECORDED
             </div>
          )}
        </div>
      </div>
    );
  };

  if (role !== "auditor" && role !== "admin") {
    return <div className="p-32 text-center forensic-text uppercase tracking-[0.4em] text-text-dim/60 font-black flex flex-col items-center gap-6">
      <div className="w-16 h-px bg-status-error/40 glow-secondary" />
      ACCESS_DENIED // ADMIN_STATE_ELEVATION_REQUIRED
      <div className="w-16 h-px bg-status-error/40 glow-secondary" />
    </div>;
  }

  return (
    <div className="relative min-h-screen bg-bg-base text-text-primary transition-all duration-700 overflow-hidden pt-24 px-12 selection:bg-accent selection:text-black">
      {/* HEADER HUD */}
      <div className="mb-16 relative z-10">
        <h1 className="tool-title !text-2xl tracking-tighter uppercase flex items-center gap-4">
           <span className="w-1.5 h-6 bg-signal-gradient rounded-full glow-primary animate-signal-pulse" />
           <span className="text-signal-gradient font-black">IMMUTABLE_HISTORICAL_LEDGER</span>
        </h1>
        <div className="flex items-center gap-5 forensic-text uppercase tracking-[0.4em] font-bold !text-[9.5px] pl-6 mt-3">
           <span className="text-accent underline decoration-accent/20 underline-offset-[10px]">AUDIT_REPOSITORY</span>
           <span className="w-2 h-px bg-white/10" />
           <span className="text-status-success">INTEGRITY_VERIFIED: TRUE</span>
           <span className="w-2 h-px bg-white/10" />
           <span className="text-text-secondary">MASTER_SEQUENCE: 0x{events.length.toString(16).padStart(4, '0')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 relative z-10">
        {/* LEDGER TRACES */}
        <div className="xl:col-span-7 space-y-12">
          <div className="grid grid-cols-1 gap-8">
            {renderAuditBlock("Risk Premium", "premium")}
            {renderAuditBlock("Maximum Liability", "coverageLimit")}
            {renderAuditBlock("Contract Status", "status")}
          </div>
        </div>

        {/* FULL SYSTEM STREAM HUD */}
        <div className="xl:col-span-5 h-[calc(100vh-280px)]">
          <div className="glass-panel h-full rounded-3xl overflow-hidden flex flex-col border-white/5 group shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h2 className="tool-label !text-[8.5px] font-black text-text-dim tracking-[0.2em] uppercase">SYSTEM_SIGNAL_STREAM</h2>
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent animate-signal-pulse glow-primary" />
                 <span className="forensic-text !text-[9px] font-black tracking-widest text-text-secondary">{events.length} SIGNALS</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <EventTimeline events={events} />
            </div>
          </div>
        </div>
      </div>

      {/* BACKGROUND DECORATIONS */}
      <div className="fixed top-1/3 -right-32 w-[600px] h-[600px] bg-accent/5 blur-[200px] rounded-full -z-10 animate-pulse" />
      <div className="fixed bottom-1/4 -left-32 w-96 h-96 bg-accent-secondary/5 blur-[150px] rounded-full -z-10" />
      
      {/* GRID TRACES */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] -z-10" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '120px 120px' }} />
    </div>
  );
}
