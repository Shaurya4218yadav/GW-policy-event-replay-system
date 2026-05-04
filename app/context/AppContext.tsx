"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Policy } from "@/types/policy";
import { ReplayEvent } from "@/types/event";

export type Role =
  | "POLICYHOLDER"
  | "AGENT"
  | "UNDERWRITER"
  | "AUDITOR"
  | "ADMIN";

export type User = {
  id?: string;
  role: Role;
};

export type Theme = "light" | "dark";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  policy: Policy;
  setPolicy: (policy: Policy) => void;
  syncPolicy: (policy: Policy) => Promise<void>;
  events: ReplayEvent[];
  setEvents: React.Dispatch<React.SetStateAction<ReplayEvent[]>>;
  syncEvents: (events: ReplayEvent[]) => Promise<void>;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  addExternalEvent: (event: ReplayEvent) => Promise<void>;
  logout: () => void;
  systemTime: string;
}

const initialPolicy: Policy = {
  id: "POL-001",
  name: "Standard Auto",
  premium: 0,
  coverageLimit: 50000,
  status: "Draft",
};

const initialEvent: ReplayEvent = {
  id: "init-event-001",
  type: "POLICY_CREATED",
  payload: {
    name: "Standard Auto",
    premium: 0,
    coverageLimit: 50000,
    status: "Draft",
  },
  timestamp: new Date().toISOString(),
  policyId: "POL-001",
  source: "SYSTEM",
  reasoning: "Initial policy creation",
  metadata: { sequence: 1 },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [policy, setPolicy] = useState<Policy>(initialPolicy);
  const [events, setEvents] = useState<ReplayEvent[]>([initialEvent]);
  const [theme, setTheme] = useState<Theme>("dark");
  const [systemTime, setSystemTime] = useState(() => new Date().toLocaleTimeString([], { hour12: false }));
  const [hydrated, setHydrated] = useState(false);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString([], { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchInitialData = useCallback(async () => {
    if (!user?.role) return;
    
    try {
      const headers = { "x-user-role": user.role };
      const [policyRes, eventsRes] = await Promise.all([
        fetch("/api/policy", { headers }),
        fetch("/api/events", { headers })
      ]);
      
      if (!policyRes.ok || !eventsRes.ok) {
        if (policyRes.status === 403 || eventsRes.status === 403) {
          console.warn("Access forbidden. User might not have correct role.");
          return;
        }
        throw new Error("Failed to fetch initial data");
      }
      
      const policyData = await policyRes.json();
      const eventsData = await eventsRes.json();
      setPolicy(policyData);
      setEvents(eventsData);
    } catch (error) {
      console.error("Failed to sync with backend store:", error);
    }
  }, [user?.role]);

  // Handle Hydration
  useEffect(() => {
    const storedTheme = localStorage.getItem("app-theme") as Theme;
    if (storedTheme) setTheme(storedTheme);
    
    try {
      const storedUser = localStorage.getItem("app-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage");
    } finally {
      setHydrated(true);
    }
  }, []);

  // Fetch data when user or hydration changes
  useEffect(() => {
    if (hydrated && user) {
      fetchInitialData();
    }
  }, [hydrated, user, fetchInitialData]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  }, []);

  const syncPolicy = async (newPolicy: Policy) => {
    setPolicy(newPolicy);
    await fetch("/api/policy", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(user?.role ? { "x-user-role": user.role } : {})
      },
      body: JSON.stringify(newPolicy),
    });
  };

  const syncEvents = async (newEvents: ReplayEvent[]) => {
    setEvents(prev => [...prev, ...newEvents]);
    for (const event of newEvents) {
      await fetch("/api/events", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(user?.role ? { "x-user-role": user.role } : {})
        },
        body: JSON.stringify(event),
      });
    }
  };

  const addExternalEvent = async (event: ReplayEvent) => {
    setEvents(prev => [...prev, event]);
    await fetch("/api/events", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(user?.role ? { "x-user-role": user.role } : {})
      },
      body: JSON.stringify(event),
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("app-user");
    router.push("/login");
  };

  return (
    <AppContext.Provider
      value={{
        user, setUser,
        policy, setPolicy, syncPolicy,
        events, setEvents, syncEvents,
        theme, setTheme, toggleTheme,
        addExternalEvent,
        logout,
        systemTime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
