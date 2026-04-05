"use client";

import React from "react";
import { useAppContext } from "../context/AppContext";

export default function SettingsPage() {
  const { theme, setTheme, role, logout } = useAppContext();

  return (
    <div className="p-12 pl-32 min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="flex flex-col mb-16">
        <h1 className="text-3xl font-bold tracking-tight mb-2">User Preferences</h1>
        <p className="text-slate-500 dark:text-slate-400 font-mono text-xs uppercase tracking-widest">
          Interface Configuration // Account Node: {role}
        </p>
      </div>

      <div className="max-w-xl space-y-12">
        <section className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-none transition-colors">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Visual System</h2>
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
            <span className="text-sm font-mono transition-colors">Interface Theme</span>
            <div className="flex space-x-4">
              <button 
                onClick={() => setTheme("dark")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  theme === "dark" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40 border border-blue-500" : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:text-blue-500 dark:hover:text-white"
                }`}
              >
                Dark Mode
              </button>
              <button 
                onClick={() => setTheme("light")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  theme === "light" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40 border border-blue-500" : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 hover:text-blue-600 dark:hover:text-white"
                }`}
              >
                Light Mode
              </button>
            </div>
          </div>
        </section>

        <section className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-none transition-colors">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Session Control</h2>
          <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-mono leading-relaxed">
              Terminate active node connection and return to selection profile gateway.
            </div>
            <button 
              onClick={logout}
              className="w-full py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-red-600 dark:text-red-500 text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
            >
              Log Out of Simulation
            </button>
          </div>
        </section>

        <footer className="pt-8 border-t border-slate-200 dark:border-slate-900 text-[10px] text-slate-400 dark:text-slate-800 font-mono leading-relaxed uppercase tracking-tighter">
          Engine Build: 0.1.0-release.alpha // Protocol: Web3-Simulation-Layer
        </footer>
      </div>
    </div>
  );
}
