"use client";

import React from "react";
import Link from "next/link";

export default function OverviewPage() {
  return (
    <div className="relative min-h-screen bg-bg-base text-text-primary transition-all duration-700 overflow-x-hidden pt-32 px-12 pb-32 selection:bg-accent selection:text-black">
      {/* BACKGROUND DECORATIONS */}
      <div className="fixed top-1/3 left-1/4 w-[800px] h-[800px] bg-accent/5 blur-[200px] rounded-full -z-10 animate-pulse" />
      <div className="fixed bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent-secondary/5 blur-[150px] rounded-full -z-10" />
      
      {/* GRID TRACES */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] -z-10" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '120px 120px' }} />

      <div className="max-w-5xl mx-auto space-y-48">
        {/* HEADER HUD */}
        <section className="text-center space-y-12 relative z-10">
          <div className="inline-block relative px-12 py-3 mb-10">
             <div className="absolute inset-0 bg-accent/5 skew-x-[-20deg] border-x border-accent/20 glow-primary" />
             <span className="relative forensic-text !text-[11px] tracking-[0.8em] text-accent font-black uppercase">SYSTEM_MANIFESTO</span>
          </div>
          <h1 className="tool-title !text-7xl tracking-tighter uppercase leading-[0.9] font-black text-signal-gradient drop-shadow-[0_0_40px_rgba(34,211,238,0.2)]">
            THE_FUTURE_OF_POLICY_AUDITING
          </h1>
          <p className="forensic-text text-text-dim/60 !text-sm uppercase tracking-[0.6em] font-bold max-w-3xl mx-auto pl-6">
            DETERMINISTIC_EVENT_SOURCED_REPLAY_ENGINE_v4
          </p>
          <div className="pt-16 flex justify-center gap-16 text-[12px] forensic-text font-black">
            <Link href="/login" className="px-12 py-4 glass-panel rounded-full border-accent bg-accent/10 text-accent glow-primary hover:bg-accent/20 transition-all tracking-[0.5em] uppercase">
              [ INIT_SESSION ]
            </Link>
            <Link href="/login" className="px-12 py-4 glass-panel rounded-full border-white/5 hover:border-white/20 transition-all tracking-[0.5em] text-text-dim uppercase hover:text-text-primary">
              EXPLORE_DOCS
            </Link>
          </div>
        </section>

        {/* SECTION 1: THE FORENSIC GAP */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10">
          <div className="space-y-12">
            <div className="flex items-center gap-6">
               <span className="w-12 h-px bg-status-error/40 glow-secondary" />
               <h2 className="forensic-text !text-status-error/60 uppercase tracking-[0.5em] font-black">THE_FORENSIC_GAP</h2>
            </div>
            <h3 className="tool-title !text-5xl tracking-tight leading-[1.1] font-black uppercase">CURRENT_SYSTEMS_ARE_BLIND_TO_THE_PAST</h3>
            <p className="forensic-text text-text-dim/60 leading-relaxed text-[11px] font-bold uppercase tracking-[0.2em] pl-6 border-l border-white/5">
              TRADITIONAL_CRUD_INSURANCE_SYSTEMS_ONLY_STORE_THE_FINAL_SNAPSHOT. 
              WHEN_A_PREMIUM_VALUE_MUTATES_FROM_₹1,000_TO_₹12,000_HISTORICAL_CONTEXT_IS_LOST.
              WITHOUT_EVENT_SOURCING_AUDITING_IS_IMPOSSIBLE.
            </p>
          </div>
          <div className="glass-panel p-12 rounded-[40px] border-status-error/10 bg-status-error/[0.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-status-error/5 blur-[80px] -z-10" />
            <div className="forensic-text !text-[8.5px] text-status-error/40 mb-8 tracking-[0.3em] uppercase font-black">// LEGACY_DB_SNAPSHOT_DUMP</div>
            <div className="tool-value !text-xs text-text-dim/40 font-bold mb-4">
              {`{`}
              <div className="pl-8 py-2 opacity-30 tracking-widest">"id": "POL-001",</div>
              <div className="pl-8 py-2 text-status-error font-black italic tracking-widest">"premium": 12000, // NO_ORIGIN_TRACE</div>
              <div className="pl-8 py-2 opacity-30 tracking-widest">"status": "Active"</div>
              {`}`}
            </div>
          </div>
        </section>

        {/* SECTION 2: THE SIGNAL ARCHITECTURE */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10">
          <div className="order-2 lg:order-1 glass-panel p-12 rounded-[40px] border-accent/10 bg-accent/[0.02] group relative shadow-2xl">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[80px] -z-10" />
             <div className="forensic-text !text-[8.5px] text-accent/60 mb-8 tracking-[0.3em] uppercase font-black">// REPLICANT_AUDIT_TRAIL</div>
             <div className="space-y-6">
                <div className="flex justify-between items-center forensic-text !text-[10px] text-text-dim/20 font-bold uppercase tracking-[0.2em]">
                   <span>10:01:00</span>
                   <span className="tracking-[0.4em]">POLICY_CREATED</span>
                </div>
                <div className="flex justify-between items-center forensic-text !text-[10px] text-text-dim/40 font-bold uppercase tracking-[0.2em]">
                   <span>10:05:32</span>
                   <span className="tracking-[0.4em]">POLICY_QUOTED: ₹1,000</span>
                </div>
                <div className="flex justify-between items-center forensic-text !text-[11px] text-accent font-black uppercase tracking-[0.3em] glow-primary">
                   <span>10:45:12</span>
                   <span className="tracking-[0.4em] font-black">POLICY_ENDORSED_SIGNAL</span>
                </div>
                <div className="h-px bg-accent/10 w-1/3 mt-8" />
                <div className="forensic-text !text-[9px] text-text-dim/20 italic tracking-[0.5em] font-bold uppercase">SIGNAL_STREAM_APPENDING...</div>
             </div>
          </div>
          <div className="order-1 lg:order-2 space-y-12">
            <div className="flex items-center gap-6">
               <span className="w-12 h-px bg-accent/40 glow-primary" />
               <h2 className="forensic-text text-accent uppercase tracking-[0.5em] font-black">THE_SIGNAL_SOLUTION</h2>
            </div>
            <h3 className="tool-title !text-5xl tracking-tight leading-[1.1] font-black uppercase">EVERY_STATE_CHANGE_IS_A_BUSINESS_SIGNAL</h3>
            <p className="forensic-text text-text-dim/60 leading-relaxed text-[11px] font-bold uppercase tracking-[0.2em] pl-6 border-l border-white/5">
              BY_TREATING_EVERY_UPDATE_AS_AN_IMMUTABLE_CORE_EVENT_WE_BUILD_A_PERFECT_LIFECYCLE_RECORD.
              OUR_ENGINE_DOESNT_JUST_STORE_VALUES: IT_STORES_THE_INTENT_AND_THE_SEQUENCE_THAT_LED_TO_THAT_VALUE.
            </p>
          </div>
        </section>

        {/* SECTION 3: ARCHITECTURE NODES */}
        <section className="glass-panel p-20 rounded-[60px] space-y-20 border-white/5 relative z-10 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="forensic-text !text-[9px] text-text-dim/30 tracking-[0.8em] uppercase text-center mb-6 font-black font-mono">CORE_SIGNAL_ARCHITECTURE</div>
            <h3 className="tool-title !text-4xl uppercase tracking-tighter font-black text-text-primary">TRANSPARENT_SIGNAL_PROCESSING</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { step: "01", label: "COMMAND_CONSOLE", desc: "HIGH_FIDELITY_HUD" },
              { step: "02", label: "SIGNAL_GATEWAY", desc: "DETERMINISTIC_ORCHESTRATION" },
              { step: "03", label: "IMMUTABLE_LOG", desc: "APPEND_ONLY_SIGNAL_STORE" },
              { step: "04", label: "REPLAY_ENGINE", desc: "TEMPORAL_RECONSTRUCTION" },
            ].map((item) => (
              <div key={item.step} className="group flex flex-col items-center">
                <div className="w-px h-20 bg-white/5 group-hover:bg-accent/40 transition-all duration-1000 mb-8" />
                <div className="forensic-text !text-accent !text-[11px] tracking-[0.6em] mb-6 font-black group-hover:scale-125 transition-all glow-primary">{item.step}</div>
                <div className="forensic-text !text-[10px] font-black uppercase text-text-dim group-hover:text-text-primary transition-all mb-3 tracking-[0.2em]">{item.label}</div>
                <div className="forensic-text !text-[8px] text-center text-text-dim/20 font-bold uppercase tracking-[0.3em] group-hover:text-accent transition-all">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-32 border-t border-white/5 flex flex-col items-center gap-12">
           <div className="flex gap-20 forensic-text text-text-dim/20 hover:text-accent transition-all cursor-default !text-[9px] tracking-[0.6em] font-black uppercase">
              <span>[ POINT_IN_TIME_REPLAY ]</span>
              <span>[ SIGNAL_VALIDATION ]</span>
              <span>[ WHAT_IF_SIMULATION ]</span>
           </div>
           <div className="forensic-text !text-[8.5px] tracking-[0.8em] text-text-dim/10 font-black uppercase">
             SYSTEM_INTELLIGENCE_ENGINE_v4_MANIFEST_VERIFIED_AUTHENTIC
           </div>
        </footer>
      </div>
    </div>
  );
}
