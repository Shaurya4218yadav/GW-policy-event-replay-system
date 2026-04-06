"use client";

import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import EventTimeline from "../components/EventTimeline";
import UpdateForm from "../components/UpdateForm";
import SimulationPanel from "../components/SimulationPanel";
import ReplayView from "../components/ReplayView";
import { Policy } from "@/types/policy";
import { ReplayEvent } from "@/types/event";

export default function SimulationPage() {
  const { policy, syncPolicy, events, setEvents, addExternalEvent, role } = useAppContext();
  const [activeTimestamp, setActiveTimestamp] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [executionPhase, setExecutionPhase] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);

  const handleUpdatePolicy = async (newPolicy: Policy) => {
    const parsedPolicy = {
      ...newPolicy,
      premium: Number(newPolicy.premium),
      coverageLimit: Number(newPolicy.coverageLimit),
    };

    const newEvents: ReplayEvent[] = [];
    const now = new Date().toISOString();

    if (policy.premium !== parsedPolicy.premium) {
      newEvents.push({
        id: crypto.randomUUID(),
        type: "POLICY_QUOTED",
        payload: { premium: parsedPolicy.premium },
        timestamp: now,
      });
    }

    if (policy.status !== "Active" && parsedPolicy.status === "Active") {
      newEvents.push({
        id: crypto.randomUUID(),
        type: "POLICY_BOUND",
        payload: { status: "Active" },
        timestamp: now,
      });
    }

    if (policy.coverageLimit !== parsedPolicy.coverageLimit) {
      newEvents.push({
        id: crypto.randomUUID(),
        type: "POLICY_ENDORSED",
        payload: { coverageLimit: parsedPolicy.coverageLimit },
        timestamp: now,
      });
    }

    if (newEvents.length > 0) {
      // Use syncPolicy and addExternalEvent for persistence
      await syncPolicy(parsedPolicy);
      for (const event of newEvents) {
        await addExternalEvent(event);
      }
    }
  };

  const handleSimulateScenario = async (generatedEvents: ReplayEvent[]) => {
    setIsExecuting(true);
    setExecutionLogs([]);
    setTotalSteps(generatedEvents.length + 1);
    setCurrentStep(1);
    setExecutionPhase("INITIALIZATION");
    
    setExecutionLogs(["> Evaluating policy risk profile..."]);
    await new Promise((r) => setTimeout(r, 900));

    for (let i = 0; i < generatedEvents.length; i++) {
      const event = generatedEvents[i];
      setCurrentStep(i + 2);

      let phase = "SYSTEM UPDATE";
      let reasoningLog = "processing state change";
      let delay = 600;

      switch (event.type) {
        case "POLICY_QUOTED":
          phase = "RISK EVALUATION";
          reasoningLog = "premium calculated based on dynamic risk drivers";
          delay = 1200;
          break;
        case "POLICY_BOUND":
          phase = "POLICY ACTIVATION";
          reasoningLog = "coverage bounds established and verified";
          delay = 900;
          break;
        case "POLICY_ENDORSED":
          phase = "ENDORSEMENT UPDATE";
          reasoningLog = "applying requested limits adjustment";
          delay = 1000;
          break;
        case "CLAIM_REPORTED":
          phase = "CLAIMS REGISTRY";
          reasoningLog = "loss event identified within coverage bounds";
          delay = 1000;
          break;
        case "CLAIM_APPROVED":
          phase = "CLAIM DISBURSEMENT";
          reasoningLog = "claim verified, initiating automatic payout";
          delay = 1200;
          break;
      }

      setExecutionPhase(phase);
      setExecutionLogs((prev) => [...prev, `> ${phase}: ${reasoningLog}...`]);
      event.reasoning = `→ ${reasoningLog}`;
      
      await new Promise((r) => setTimeout(r, delay));
      setEvents((prev) => [...prev, event]);
    }
    
    setExecutionPhase("FINALLY");
    setExecutionLogs((prev) => [...prev, `[ SIMULATION COMPLETE ]`]);
    await new Promise((r) => setTimeout(r, 1000));
    setIsExecuting(false);
  };

  const canReplay = role === "analyst" || role === "admin";

  return (
    <div className="relative min-h-screen bg-bg-base text-text-primary transition-all duration-700 overflow-x-hidden selection:bg-accent selection:text-black">
      {/* HUD HEADER - FLOATING METADATA */}
      <div className={`fixed top-16 left-12 z-30 transition-all duration-1000 ${isFocusMode ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
        <div className="flex flex-col gap-0.5">
          <h1 className="tool-title !text-lg tracking-tighter uppercase flex items-center gap-3">
             <span className="w-1 h-3 bg-signal-gradient rounded-full glow-primary" />
             <span className="text-signal-gradient font-black">FORENSIC_ENGINE_v4</span>
          </h1>
          <div className="flex items-center gap-4 forensic-text uppercase tracking-[0.4em] font-bold !text-[8.5px] pl-4 mt-1">
             <span className="text-text-secondary">AUTH_ROLE:</span>
             <span className="text-accent">{role?.toUpperCase() || 'GUEST'}</span>
             <span className="w-1.5 h-px bg-white/10" />
             <span className="text-text-secondary">REPLICANT:</span>
             <span className="text-text-primary">0x{events.length.toString(16).padStart(4, '0')}</span>
          </div>
        </div>
      </div>

      <div className="fixed top-16 right-12 z-30 transition-all duration-1000">
        <button 
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={`group flex items-center gap-4 px-5 py-2 glass-panel rounded-full transition-all duration-700 ${
            isFocusMode ? 'border-accent/40 bg-accent/5' : 'hover:border-white/10'
          }`}
        >
          <span className="forensic-text !text-[8px] tracking-[0.3em] font-black group-hover:text-text-primary transition-colors">FOCUS_MODE</span>
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${isFocusMode ? 'bg-accent glow-primary scale-125' : 'bg-white/10'}`} />
        </button>
      </div>

      {/* EXECUTION HUD OVERLAY */}
      {isExecuting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center animate-in fade-in transition-all duration-700">
          <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-xl" />
          <div className="relative glass-panel p-10 rounded-3xl w-[450px] border-accent/20 glow-primary">
            <div className="flex flex-col items-center text-center">
               <div className="w-16 h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
                  <div className="h-full bg-signal-gradient animate-pulse" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
               </div>
               <h3 className="tool-label !text-accent-secondary tracking-[0.5em] mb-4 font-black animate-pulse">[ EXECUTION_SEQUENCE ]</h3>
               <div className="tool-value !text-lg mb-8 flex flex-col items-center gap-2">
                  <span className="tool-label !text-[7px] text-text-dim tracking-[0.2em]">CURRENT_PHASE</span>
                  <span className="tracking-[0.2em] font-black uppercase text-text-primary px-6 py-2 glass-panel rounded-full border-accent/10">{executionPhase}</span>
               </div>
               <div className="forensic-text italic text-[10px] text-text-secondary h-12 flex items-center justify-center bg-white/[0.02] w-full rounded-xl border border-white/5">
                  {executionLogs[executionLogs.length - 1]}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN SIGNAL STREAM (TIMELINE) */}
      <div className={`relative transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFocusMode ? 'scale-[1.02] translate-y-0' : 'translate-y-12'
      }`}>
         <EventTimeline events={events} activeTimestamp={activeTimestamp} isFocusMode={isFocusMode} />
      </div>

      {/* FLOATING CONTROL ZONES (ASIDE HUDs) */}
      <div className={`fixed left-12 top-40 w-[320px] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFocusMode ? '-translate-x-[110%] opacity-0' : 'translate-x-0 opacity-100'
      }`}>
        <div className="space-y-12">
           <UpdateForm policy={policy} onUpdate={handleUpdatePolicy} />
           <SimulationPanel 
              onSimulate={handleSimulateScenario} 
              currentPremium={policy.premium} 
              currentCoverage={policy.coverageLimit} 
            />
        </div>
      </div>

      <div className={`fixed right-12 top-24 w-[380px] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFocusMode ? 'translate-x-[110%] opacity-0' : 'translate-x-0 opacity-100'
      }`}>
        {canReplay ? (
          <ReplayView 
            events={events} 
            currentPolicy={policy} 
            onTimeSelect={(ts) => setActiveTimestamp(ts)}
          />
        ) : (
          <div className="glass-panel p-8 rounded-3xl border-status-error/10 bg-status-error/[0.02]">
            <h3 className="tool-label !text-status-error font-black tracking-[0.2em] mb-4 flex items-center gap-3">
               <span className="w-1.5 h-1.5 rounded-full bg-status-error animate-pulse" />
               REPLAY_SEQUENCE_LOCKED
            </h3>
            <p className="forensic-text text-text-secondary leading-relaxed italic !text-[10px] uppercase tracking-widest opacity-60">
              UNAUTHORIZED_CREDENTIALS: REQUIRES_ADMIN_STATE_ELEVATION.
            </p>
          </div>
        )}
      </div>

      {/* ABSTRACT DECORATIVE ELEMENTS (CIRCUITS) */}
      {!isFocusMode && (
        <>
          <div className="fixed left-0 top-1/2 -translate-y-1/2 w-64 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent z-0 pointer-events-none" />
          <div className="fixed right-0 top-1/4 -translate-y-1/2 w-96 h-px bg-gradient-to-l from-transparent via-accent-secondary/5 to-transparent z-0 pointer-events-none" />
          <div className="fixed left-1/3 top-0 w-px h-[400px] bg-gradient-to-b from-transparent via-accent/5 to-transparent z-0 pointer-events-none" />
        </>
      )}
    </div>
  );
}
