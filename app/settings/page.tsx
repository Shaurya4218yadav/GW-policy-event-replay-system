"use client";

import React from "react";
import { useAppContext } from "../context/AppContext";

export default function SettingsPage() {
  const { theme, setTheme, role, logout } = useAppContext();

  return (
    <div className="relative min-h-screen bg-bg-base text-text-primary transition-all duration-700 overflow-hidden pt-24 px-12 selection:bg-accent selection:text-black">
      {/* HEADER HUD */}
      <div className="mb-16 relative z-10">
        <h1 className="tool-title !text-2xl tracking-tighter uppercase flex items-center gap-4">
           <span className="w-1.5 h-6 bg-signal-gradient rounded-full glow-primary animate-signal-pulse" />
           <span className="text-signal-gradient font-black">USER_PREFERENCE_GATEWAY</span>
        </h1>
        <div className="flex items-center gap-5 forensic-text uppercase tracking-[0.4em] font-bold !text-[9.5px] pl-6 mt-3">
           <span className="text-accent underline decoration-accent/20 underline-offset-[10px]">INTERFACE_CONFIG</span>
           <span className="w-2 h-px bg-white/10" />
           <span className="text-text-secondary">ACCOUNT_NODE:</span>
           <span className="text-text-primary">{role?.toUpperCase()}</span>
           <span className="w-2 h-px bg-white/10" />
           <span className="text-text-secondary">BUILD: 0.1.0-ALPHA</span>
        </div>
      </div>

      <div className="max-w-4xl space-y-12 relative z-10">
        <section className="glass-panel p-12 rounded-[40px] border-white/5 hover:border-accent/10 transition-all duration-700 group">
          <div className="flex items-center gap-4 mb-12">
             <div className="w-1.5 h-1.5 rounded-full bg-accent glow-primary animate-pulse" />
             <h2 className="tool-title !text-[10px] tracking-[0.4em] uppercase text-text-dim/60 group-hover:text-text-primary transition-all font-black">VISUAL_SYSTEM_LAYER</h2>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 py-8 px-10 border border-white/5 rounded-3xl bg-white/[0.01] hover:bg-white/[0.02] transition-all">
            <div className="space-y-2">
               <span className="forensic-text !text-[12px] font-black tracking-tight text-text-primary uppercase">INTERFACE_THEME</span>
               <p className="forensic-text !text-[9px] text-text-dim/40 uppercase tracking-[0.3em] font-bold">SELECT_GLOBAL_CHROMATIC_PROFILE</p>
            </div>
            
            <div className="flex gap-6">
              <button 
                onClick={() => setTheme("dark")}
                className={`group relative px-10 py-3.5 rounded-full transition-all duration-700 overflow-hidden border-2 ${
                  theme === "dark" 
                    ? "bg-accent/[0.03] border-accent text-accent glow-primary" 
                    : "border-white/5 text-text-dim/40 hover:text-text-primary hover:border-white/10"
                }`}
              >
                <div className={`absolute inset-0 bg-signal-gradient opacity-0 transition-opacity ${theme === "dark" ? 'opacity-5' : 'group-hover:opacity-5'}`} />
                <span className="relative forensic-text !text-[10px] tracking-[0.4em] font-black">DARK_MODE</span>
              </button>
              <button 
                onClick={() => setTheme("light")}
                className={`group relative px-10 py-3.5 rounded-full transition-all duration-700 overflow-hidden border-2 ${
                  theme === "light" 
                    ? "bg-accent/[0.03] border-accent text-accent glow-primary" 
                    : "border-white/5 text-text-dim/40 hover:text-text-primary hover:border-white/10"
                }`}
              >
                <div className={`absolute inset-0 bg-signal-gradient opacity-0 transition-opacity ${theme === "light" ? 'opacity-5' : 'group-hover:opacity-5'}`} />
                <span className="relative forensic-text !text-[10px] tracking-[0.4em] font-black">LIGHT_MODE</span>
              </button>
            </div>
          </div>
        </section>

        <section className="glass-panel p-12 rounded-[40px] border-white/5 hover:border-status-error/10 transition-all duration-700 group">
          <div className="flex items-center gap-4 mb-12">
             <div className="w-1.5 h-1.5 rounded-full bg-status-error/40 group-hover:bg-status-error transition-all scale-110 glow-secondary" />
             <h2 className="tool-title !text-[10px] tracking-[0.4em] uppercase text-text-dim/60 group-hover:text-text-primary transition-all font-black">SESSION_TERMINATION_PROTOCOL</h2>
          </div>
          
          <div className="p-10 border border-white/5 rounded-3xl bg-white/[0.01]">
            <p className="forensic-text !text-[11px] text-text-dim/40 leading-relaxed mb-10 italic uppercase tracking-[0.3em] font-bold border-l border-white/5 pl-8">
               TERMINATE_ACTIVE_NODE_CONNECTION_AND_RETURN_TO_SELECTION_PROFILE_GATEWAY_PROTOCOL.
            </p>
            <button 
              onClick={logout}
              className="group relative w-full h-14 overflow-hidden border border-status-error/20 hover:border-status-error transition-all duration-700 rounded-full"
            >
              <div className="absolute inset-0 bg-status-error/5 group-hover:bg-status-error/10 transition-all" />
              <span className="relative forensic-text !text-[10px] tracking-[0.5em] font-black text-status-error group-hover:text-status-error group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                [ INIT_PURGE_AND_DISCONNECT ]
              </span>
            </button>
          </div>
        </section>

        <footer className="pt-16 flex items-center gap-8">
           <div className="h-px flex-1 bg-white/5" />
           <div className="forensic-text !text-[8.5px] tracking-[0.6em] text-text-dim/10 font-black uppercase">
             ENGINE_BUILD: 0.1.0-RELEASE.ALPHA // CORE_PROTOCOL: POLICY_INTELLIGENCE_v4
           </div>
        </footer>
      </div>

      {/* BACKGROUND DECORATIONS */}
      <div className="fixed top-1/2 -right-48 w-[600px] h-[600px] bg-accent/5 blur-[200px] rounded-full -z-10 animate-pulse" />
      <div className="fixed bottom-1/4 -left-48 w-[400px] h-[400px] bg-accent-secondary/5 blur-[150px] rounded-full -z-10" />
      
      {/* GRID TRACES */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] -z-10" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '150px 150px' }} />
    </div>
  );
}
