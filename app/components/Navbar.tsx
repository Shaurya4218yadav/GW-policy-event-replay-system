"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppContext } from "../context/AppContext";

const NAV_LINKS = [
  { label: "Overview", href: "/overview", roles: ["user", "analyst", "auditor", "admin", null] },
  { label: "Dashboard", href: "/dashboard", roles: ["user", "analyst", "admin"] },
  { label: "Simulation", href: "/simulation", roles: ["user", "analyst", "admin"] },
  { label: "Audit", href: "/audit", roles: ["auditor", "admin"] },
  { label: "Settings", href: "/settings", roles: ["user", "analyst", "auditor", "admin"] },
];

export default function Navbar() {
  const pathname = usePathname();
  const { role, logout } = useAppContext();

  const isOverview = pathname === "/overview";
  if ((!role && !isOverview) || pathname === "/login") return null;

  const activeRole = role || "user";

  return (
    <nav className="fixed left-3 top-16 bottom-3 w-10 glass-panel z-40 rounded-xl py-6 flex flex-col items-center animate-hud-slide">
      {/* Role indicator */}
      <div className="mb-10">
        <div className="w-6 h-6 rounded-full bg-accent/5 border border-accent/20 flex items-center justify-center font-mono text-[9px] text-accent glow-primary">
          {activeRole[0].toUpperCase()}
        </div>
      </div>

      {/* Navigation links */}
      <div className="flex-1 flex-col space-y-8 hidden md:flex mt-4 w-full items-center">
        {NAV_LINKS.filter(l => l.roles.includes(role as string | null)).map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative vertical-text tracking-[0.2em] text-[8px] uppercase font-bold transition-all duration-500 w-full flex items-center justify-center py-5 ${
                isActive
                  ? "text-accent-secondary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)] scale-110" 
                  : "text-text-dim hover:text-text-primary opacity-40 hover:opacity-100"
              }`}
            >
              <span className="relative z-10 transition-all duration-500">
                {link.label}
              </span>
              {isActive && (
                <div className="absolute left-0 right-0 top-0 bottom-0 bg-accent-secondary/[0.03] rounded-sm blur-[2px]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom section: logout */}
      <div className="mt-auto flex flex-col items-center gap-4 pb-2">
        <button
          onClick={logout}
          className="text-muted hover:text-red-400 transition-colors opacity-50"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
      `}</style>
    </nav>
  );
}
