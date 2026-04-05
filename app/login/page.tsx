"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppContext, UserRole } from "../context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useAppContext();

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
    router.push("/dashboard");
  };

  const ROLES: { id: UserRole; label: string; desc: string }[] = [
    { id: "user", label: "General User", desc: "Access to dashboard and basic simulation." },
    { id: "analyst", label: "System Analyst", desc: "Full simulation control and state replay." },
    { id: "auditor", label: "Compliance Auditor", desc: "Read-only access to historical logs and state derivations." },
    { id: "admin", label: "System Administrator", desc: "All-access control, maintenance, and system resets." },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-12 bg-bg-base overflow-hidden selection:bg-accent selection:text-black">
      {/* BACKGROUND DECORATIONS */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-accent/5 blur-[200px] rounded-full animate-pulse" />
         <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent-secondary/5 blur-[150px] rounded-full" />
      </div>

      {/* GRID TRACES */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] -z-10" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

      <div className="max-w-4xl w-full text-center mb-20 relative z-10">
        <div className="inline-block mb-8 relative px-10 py-3">
           <div className="absolute inset-0 bg-accent/5 skew-x-[-20deg] border-x border-accent/20 glow-primary" />
           <span className="relative forensic-text !text-[11px] tracking-[0.6em] text-accent font-black uppercase">SECURE_ACCESS_GATEWAY</span>
        </div>
        <h1 className="tool-title !text-6xl tracking-tighter uppercase mb-6 font-black text-signal-gradient drop-shadow-[0_0_40px_rgba(34,211,238,0.2)]">
           POLICY_INTELLIGENCE_v4
        </h1>
        <div className="flex items-center justify-center gap-6 forensic-text text-text-dim/60 !text-[10px] uppercase tracking-[0.5em] font-bold">
           <span>PREDICTIVE_SIGNAL_ENGINE</span>
           <span className="w-1.5 h-px bg-white/10" />
           <span>AUDIT_REPLICANT_CORE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl relative z-10">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => handleSelectRole(role.id)}
            className="group glass-panel p-12 rounded-3xl transition-all duration-700 hover:border-accent hover:-translate-y-3 text-left flex flex-col h-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-signal-gradient opacity-0 group-hover:opacity-[0.03] transition-all duration-700" />
            
            <div className="mb-12 text-text-dim/30 group-hover:text-accent transition-all duration-700 group-hover:scale-110 origin-left transform glow-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 21c4.478 0 8.268-2.943 9.542-7m-3.927-1.117A6 6 0 1110.158 4M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <div className="flex-1">
               <h3 className="tool-title !text-lg tracking-tight mb-4 group-hover:text-accent transition-all font-black uppercase">
                 {role.label.replace(' ', '_')}
               </h3>
               <p className="forensic-text text-text-dim/60 leading-relaxed font-bold !text-[9.5px] uppercase tracking-widest group-hover:text-text-primary transition-all">
                 {role.desc}
               </p>
            </div>

            <div className="mt-16 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-x-6 group-hover:translate-x-0">
               <span className="forensic-text !text-[9px] tracking-[0.3em] font-black text-accent">INIT_SESSION</span>
               <div className="h-px flex-1 bg-accent/20" />
               <span className="text-accent text-xs font-black animate-pulse">→</span>
            </div>
          </button>
        ))}
      </div>

      <footer className="mt-40 relative z-10 flex flex-col items-center gap-6">
        <div className="w-16 h-px bg-white/5" />
        <div className="forensic-text !text-[8px] tracking-[0.5em] text-text-dim/20 font-black uppercase">
          SECURED_SIMULATION_ENVIRONMENT_v1.0.42_STABLE_BUILD
        </div>
      </footer>
    </div>
  );
}
