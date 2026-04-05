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
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#0a0a0a]">
      <div className="max-w-4xl w-full text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Select Operations Profile</h1>
        <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">
          Deterministic Policy Simulation Engine // Access Gateway
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => handleSelectRole(role.id)}
            className="group flex flex-col p-8 bg-slate-900/20 border border-slate-800 rounded-xl transition-all duration-300 hover:border-blue-500/50 hover:bg-slate-900/40 text-left h-full"
          >
            <div className="mb-4 text-blue-500 group-hover:animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 21c4.478 0 8.268-2.943 9.542-7m-3.927-1.117A6 6 0 1110.158 4M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide group-hover:text-blue-400 transition-colors">
              {role.label}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans mt-auto">
              {role.desc}
            </p>
          </button>
        ))}
      </div>

      <footer className="mt-20 text-[10px] text-slate-700 font-mono uppercase tracking-widest border-t border-slate-900 pt-8 w-64 text-center">
        Secured Simulation Environment v1.0.42
      </footer>
    </div>
  );
}
