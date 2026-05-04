"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext, Role, User } from "../context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAppContext();
  const [userId, setUserId] = useState("");

  const handleSelectRole = (role: Role) => {
    const user: User = { role, id: userId || `USR-${Math.floor(Math.random() * 10000)}` };
    setUser(user);
    localStorage.setItem("app-user", JSON.stringify(user));
    
    // Redirect based on role
    if (role === "POLICYHOLDER") {
      router.push("/overview");
    } else if (role === "AUDITOR") {
      router.push("/validation");
    } else {
      router.push("/dashboard");
    }
  };

  const ROLES: { id: Role; label: string; desc: string }[] = [
    { id: "POLICYHOLDER", label: "Policyholder", desc: "View policy and basic history. No audit access." },
    { id: "AGENT", label: "Agent", desc: "Create and update policies." },
    { id: "UNDERWRITER", label: "Underwriter", desc: "Pricing decisions and risk evaluation." },
    { id: "AUDITOR", label: "Compliance Auditor", desc: "Access validation hub and branching drift graph." },
    { id: "ADMIN", label: "Administrator", desc: "Full system access and maintenance." },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-12 bg-transparent overflow-hidden">
      
      {/* Structural Enterprise Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] -z-10" 
           style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="max-w-4xl w-full text-center mb-16 relative z-10">
        <div className="inline-block mb-6 relative px-8 py-2">
           <span className="relative forensic-text !text-[10px] tracking-[0.4em] text-accent-primary font-bold uppercase">SECURE_IDENTITY_GATEWAY</span>
        </div>
        <h1 className="text-4xl md:text-5xl tracking-tight mb-4 font-black text-[var(--text-primary)]">
           Policy Intelligence Engine
        </h1>
        <div className="flex items-center justify-center gap-6 forensic-text text-[var(--text-muted)] !text-[10px] uppercase tracking-[0.3em] font-bold">
           <span>ENTERPRISE_GRADE_AUDIT</span>
           <span className="w-1.5 h-px bg-[var(--border-subtle)]" />
           <span>DETERMINISTIC_REPLAY</span>
        </div>
      </div>

      <div className="w-full max-w-md mb-10 z-10 relative">
        <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2 font-bold ml-2">Identity Token / User ID (Optional)</label>
        <input 
          type="text" 
          placeholder="e.g. USR-9842" 
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full bg-[rgba(15,23,42,0.4)] border border-[var(--border-subtle)] rounded-xl px-5 py-4 text-sm text-[var(--text-primary)] focus:border-accent-primary transition-all outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl relative z-10">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => handleSelectRole(role.id)}
            className="group glass-panel p-8 rounded-2xl transition-all duration-300 hover:border-accent-primary text-left flex flex-col h-full shadow-lg hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="mb-6 text-[var(--text-muted)] group-hover:text-accent-primary transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 21c4.478 0 8.268-2.943 9.542-7m-3.927-1.117A6 6 0 1110.158 4M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <div className="flex-1">
               <h3 className="text-sm tracking-wide mb-3 group-hover:text-accent-primary transition-colors font-bold uppercase text-[var(--text-primary)]">
                 {role.label}
               </h3>
               <p className="text-[var(--text-muted)] leading-relaxed text-xs">
                 {role.desc}
               </p>
            </div>

            <div className="mt-8 flex items-center gap-3 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
               <span className="text-[9px] tracking-[0.2em] font-bold text-accent-primary uppercase">AUTHENTICATE</span>
               <div className="h-px flex-1 bg-[var(--border-subtle)]" />
               <span className="text-accent-primary text-xs font-black group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        ))}
      </div>

      <footer className="mt-24 relative z-10 flex flex-col items-center gap-6">
        <div className="w-16 h-px bg-[var(--border-subtle)]" />
        <div className="forensic-text !text-[8px] tracking-[0.3em] text-[var(--text-muted)] font-bold uppercase">
          SECURED_ENTERPRISE_ENVIRONMENT_v2.0_STABLE
        </div>
      </footer>
    </div>
  );
}
