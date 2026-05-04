"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppContext } from "../context/AppContext";

const NAV_LINKS = [
  { label: "Overview", href: "/overview", roles: ["POLICYHOLDER", "AGENT", "UNDERWRITER", "AUDITOR", "ADMIN", null] },
  { label: "Dashboard", href: "/dashboard", roles: ["AGENT", "UNDERWRITER", "ADMIN"] },
  { label: "Simulation", href: "/simulation", roles: ["AGENT", "UNDERWRITER", "ADMIN"] },
  { label: "Demo", href: "/demo", roles: ["POLICYHOLDER", "AGENT", "UNDERWRITER", "AUDITOR", "ADMIN", null] },
  { label: "Validation", href: "/validation", roles: ["AUDITOR", "ADMIN"] },
  { label: "Monitoring", href: "/monitoring", roles: ["AGENT", "UNDERWRITER", "AUDITOR", "ADMIN", null] },
  { label: "Mock", href: "/mock", roles: ["ADMIN", null] },
  { label: "Docs", href: "/docs", roles: ["POLICYHOLDER", "AGENT", "UNDERWRITER", "AUDITOR", "ADMIN", null] },
  { label: "Audit", href: "/audit", roles: ["AUDITOR", "ADMIN"] },
  { label: "Settings", href: "/settings", roles: ["POLICYHOLDER", "AGENT", "UNDERWRITER", "AUDITOR", "ADMIN"] },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAppContext();

  if (pathname === "/login") return null;

  const activeRole = user?.role || "GUEST";

  return (
    <nav 
      className="fixed left-3 top-16 bottom-3 z-50 w-8 hover:w-52 bg-[#05070a] border border-white/10 rounded-xl transition-all duration-500 ease-in-out group overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]"
    >
      {/* Collapsed Indicator Arrow */}
      <div className="absolute inset-y-0 left-0 w-8 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Expanded Content */}
      <div className="w-52 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col py-6 pointer-events-none group-hover:pointer-events-auto">
        
        {/* Role indicator */}
        <div className="mb-10 w-full px-5 flex items-center">
          <div className="w-6 h-6 rounded-full bg-accent/5 border border-accent/20 flex items-center justify-center font-mono text-[9px] text-accent glow-primary flex-shrink-0 shadow-[0_0_10px_rgba(0,255,255,0.2)]">
            {activeRole[0].toUpperCase()}
          </div>
          <span className="ml-3 text-[10px] text-accent uppercase tracking-[0.2em] font-mono font-bold whitespace-nowrap">
            {activeRole}
          </span>
        </div>

        {/* Navigation links */}
        <div className="flex-1 flex-col space-y-1 flex mt-2 w-full px-3">
          {NAV_LINKS.filter(l => l.roles.includes(user?.role as any)).map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]" 
                    : "text-text-dim hover:bg-white/5 hover:text-text-primary border border-transparent"
                }`}
              >
                <span className={`text-[9px] uppercase tracking-[0.15em] font-bold whitespace-nowrap ${
                  isActive ? "text-accent-secondary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" : ""
                }`}>
                  {link.label}
                </span>
                
                {/* Highlight bar for active state */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3/5 bg-accent-secondary rounded-r-md" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom section: logout */}
        <div className="mt-auto flex flex-col w-full px-3 pb-2">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2.5 rounded-lg text-muted hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/20"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="ml-3 text-[9px] uppercase tracking-[0.15em] font-bold whitespace-nowrap">
              Logout
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
