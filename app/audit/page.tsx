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
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm dark:shadow-none transition-all hover:border-blue-500/30">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">{label} Traceability</h3>
        <div className="space-y-6 relative border-l border-slate-200 dark:border-slate-800 ml-2 pl-6">
          {list.map((item, idx) => (
            <div key={idx} className="relative">
              <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-500 -left-[27.5px] top-1.5 shadow-lg shadow-blue-500/20" />
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{new Date(item.ts).toLocaleString()}</span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-tighter">{item.type}</span>
              </div>
              <div className="text-sm font-mono text-slate-700 dark:text-slate-200">
                Value set to: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{typeof item.val === 'number' ? `$${item.val.toLocaleString()}` : item.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (role !== "auditor" && role !== "admin") {
    return <div className="p-32 text-center text-slate-500 font-mono text-xs uppercase tracking-widest leading-loose">
      Access Denied // auditor or admin profile required
    </div>;
  }

  return (
    <div className="p-12 pl-32 min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="flex flex-col mb-16">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Immutable Historical Ledger</h1>
        <p className="text-slate-500 dark:text-slate-400 font-mono text-xs uppercase tracking-widest">
          Audit Repository // Signal Consistency Verified
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <div className="space-y-12">
          {renderAuditBlock("Risk Premium", "premium")}
          {renderAuditBlock("Maximum Liability", "coverageLimit")}
          {renderAuditBlock("Contract Status", "status")}
        </div>

        <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full max-h-[800px] shadow-sm dark:shadow-none">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Full System Signal Stream</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <EventTimeline events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
