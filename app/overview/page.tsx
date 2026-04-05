"use client";

import React from "react";
import Link from "next/link";

export default function OverviewPage() {
  return (
    <div className="p-12 pl-32 min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-24 py-12">
        {/* HEADER */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tighter transition-colors">The Future of Policy Auditing</h1>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-sm uppercase tracking-[0.3em]">
            Deterministic Event-Sourced Replay Engine
          </p>
          <div className="pt-8 flex justify-center space-x-4">
            <Link href="/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-lg shadow-blue-900/40">
              Get Started
            </Link>
            <Link href="/login" className="px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              View Documentation
            </Link>
          </div>
        </section>

        {/* SECTION 1: THE PROBLEM */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-foreground">
          <div className="space-y-6">
            <h2 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">The Problem</h2>
            <h3 className="text-3xl font-bold leading-tight">Current systems are blind to the past.</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Traditional CRUD-based insurance systems only store the current state (the "Final Snapshot"). When a premium value changes from $1,000 to $12,000, 
              the historical context—who changed it, why, and which business event triggered it—is often lost or buried in opaque system logs. 
              This makes auditing impossible and debugging state drifts a nightmare.
            </p>
          </div>
          <div className="p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-xs space-y-4 shadow-sm dark:shadow-none">
            <div className="text-red-500 opacity-50">// Traditional DB Snapshot</div>
            <div className="text-slate-800 dark:text-slate-300">
              {`{`}
              <div className="pl-4">"id": "POL-001",</div>
              <div className="pl-4">"premium": 12000, <span className="text-red-500/50 underline">/* How did it get here? */</span></div>
              <div className="pl-4">"status": "Active"</div>
              {`}`}
            </div>
          </div>
        </section>

        {/* SECTION 2: THE SOLUTION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-foreground">
          <div className="order-2 md:order-1 p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-xs space-y-4 shadow-sm dark:shadow-none">
            <div className="text-emerald-500 opacity-50">// Event-Sourced Audit Trail</div>
            <div className="space-y-1">
              <div className="text-slate-400 dark:text-slate-500">10:01:00 POLICY_CREATED</div>
              <div className="text-slate-400 dark:text-slate-500">10:05:32 POLICY_QUOTED (P: 1000)</div>
              <div className="text-emerald-600 dark:text-emerald-400">10:45:12 POLICY_ENDORSED (P: 12000)</div>
              <div className="text-slate-300 dark:text-slate-500 opacity-30">... system signals continue ...</div>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6 text-right md:text-left">
            <h2 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">The Solution</h2>
            <h3 className="text-3xl font-bold leading-tight">Every change is a business signal.</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              By treating every state change as an immutable business event, we build a perfect record of the policy's lifecycle. 
              Our engine doesn't just store values; it stores the <strong>intent</strong> and the <strong>event</strong> that led to that value. 
              This ensures 100% deterministic traceability.
            </p>
          </div>
        </section>

        {/* SECTION 3: ARCHITECTURE */}
        <section className="p-12 bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-12 shadow-sm dark:shadow-none">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Core Architecture</h2>
            <h3 className="text-2xl font-bold">Transparent Signal Processing</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            {[
              { step: "01", label: "Frontend", desc: "Interactive Command Console" },
              { step: "02", label: "API Layer", desc: "Signal Orchestration" },
              { step: "03", label: "Event Store", desc: "Immutable Append-Only Log" },
              { step: "04", label: "Replay Engine", desc: "Deterministic Reconstruction" },
            ].map((item) => (
              <div key={item.step} className="p-6 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 group hover:border-blue-500/50 transition-colors">
                <div className="text-blue-500 font-mono text-xs tracking-widest mb-2">{item.step}</div>
                <div className="text-sm font-bold uppercase transition-colors">{item.label}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: CAPABILITIES */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Point-in-Time Replay", desc: "Time-travel to any microsecond in the system history to see the exact policy state as it existed then." },
            { title: "Signal Validation", desc: "Instantly compare historical reconstructions against the live record to detect state drift or anomalies." },
            { title: "What-If Simulation", desc: "Project future business scenarios like claims or complex endorsements before they ever touch production." },
          ].map((item) => (
            <div key={item.title} className="space-y-4">
              <h4 className="text-lg font-bold">{item.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* FOOTER */}
        <footer className="pt-20 border-t border-slate-200 dark:border-slate-900 text-center space-y-4">
          <div className="text-[10px] text-slate-500 dark:text-slate-700 font-mono uppercase tracking-widest">
            Policy Event Replay System // Enterprise v1.0
          </div>
        </footer>
      </div>
    </div>
  );
}
