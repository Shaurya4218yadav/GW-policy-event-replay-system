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
  { label: "Admin", href: "/admin", roles: ["admin"] },
  { label: "Settings", href: "/settings", roles: ["user", "analyst", "auditor", "admin"] },
];

export default function Navbar() {
  const pathname = usePathname();
  const { role, logout, theme, toggleTheme, events, systemTime } = useAppContext();

  const isOverview = pathname === "/overview";
  if ((!role && !isOverview) || pathname === "/login") return null;

  const activeRole = role || "user";

  return (
    <nav className="fixed left-0 top-0 h-full w-16 flex flex-col items-center py-6 border-r border-border bg-background z-50 transition-colors">
      {/* Role indicator */}
      <div className="mb-8">
        <div className="w-7 h-7 rounded-md bg-accent/20 border border-accent/30 flex items-center justify-center font-mono text-[10px] text-accent font-bold">
          {activeRole[0].toUpperCase()}
        </div>
      </div>

      {/* System status dot */}
      <div className="mb-6 flex flex-col items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
        <span className="text-[7px] font-mono text-muted uppercase tracking-tight">live</span>
      </div>

      {/* Navigation links */}
      <div className="flex-1 flex-col space-y-6 hidden md:flex">
        {NAV_LINKS.filter(l => l.roles.includes(role as string | null)).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`vertical-text tracking-widest text-[9px] uppercase font-medium transition-colors ${
              pathname === link.href 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Bottom section: theme toggle + event count + logout */}
      <div className="mt-auto flex flex-col items-center gap-4 pb-2">
        {/* Event counter */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-mono text-muted-foreground">{events.length}</span>
          <span className="text-[6px] font-mono text-muted-foreground uppercase">evt</span>
        </div>

        {/* Theme toggle pill */}
        <button
          onClick={toggleTheme}
          className="relative w-7 h-[34px] rounded-full border border-border bg-background transition-colors hover:border-accent/50 focus:outline-none"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center ${
            theme === "dark" 
              ? "top-[3px] bg-accent/30" 
              : "bottom-[3px] bg-amber-400/40"
          }`}>
            {theme === "dark" ? (
              <svg className="w-2.5 h-2.5 text-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            ) : (
              <svg className="w-2.5 h-2.5 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zm11.394-5.834a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zm14.25.75a.75.75 0 000-1.5H18a.75.75 0 000 1.5h2.25zm-3.697 5.303l1.591 1.59a.75.75 0 11-1.06 1.061l-1.591-1.59a.75.75 0 011.06-1.06z"/>
              </svg>
            )}
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="text-muted-foreground hover:text-red-400 transition-colors"
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
        }
      `}</style>
    </nav>
  );
}
