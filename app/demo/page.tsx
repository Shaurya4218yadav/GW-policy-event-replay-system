"use client";

import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import EventTimeline from "../components/EventTimeline";
import SimulationPanel from "../components/SimulationPanel";
import ReplayView from "../components/ReplayView";
import { ReplayEvent } from "@/types/event";

interface Scenario {
  id: string;
  title: string;
  description: string;
  events: ReplayEvent[];
  icon: string;
  color: string;
  category: string;
}

const scenarios: Scenario[] = [
  {
    id: "policy-pricing-change",
    title: "Policy Pricing Change",
    description: "Demonstrates how premium adjustments are calculated and applied based on risk factors and market conditions.",
    icon: "💰",
    color: "from-blue-500 to-cyan-500",
    category: "Pricing",
    events: [
      {
        id: "pricing-1",
        type: "POLICY_QUOTED",
        payload: { premium: 1200 },
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "pricing-2",
        type: "POLICY_ENDORSED",
        payload: { coverageLimit: 75000 },
        timestamp: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: "pricing-3",
        type: "POLICY_QUOTED",
        payload: { premium: 1350 },
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    id: "claim-impact",
    title: "Claim Impact on Policy",
    description: "Shows how a claim affects policy status, premium calculations, and triggers automated underwriting reviews.",
    icon: "⚠️",
    color: "from-red-500 to-orange-500",
    category: "Claims",
    events: [
      {
        id: "claim-1",
        type: "CLAIM_REPORTED",
        payload: { claimAmount: 5000, description: "Vehicle collision" },
        timestamp: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "claim-2",
        type: "CLAIM_APPROVED",
        payload: { approvedAmount: 4500 },
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "claim-3",
        type: "POLICY_ENDORSED",
        payload: { coverageLimit: 45000 },
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    id: "policy-endorsement",
    title: "Policy Endorsement",
    description: "Illustrates the process of modifying policy terms mid-term, including coverage changes and premium recalculations.",
    icon: "📝",
    color: "from-green-500 to-emerald-500",
    category: "Policy",
    events: [
      {
        id: "endorse-1",
        type: "POLICY_BOUND",
        payload: { status: "Active" },
        timestamp: new Date(Date.now() - 2592000000).toISOString(),
      },
      {
        id: "endorse-2",
        type: "POLICY_ENDORSED",
        payload: { coverageLimit: 100000 },
        timestamp: new Date(Date.now() - 1296000000).toISOString(),
      },
      {
        id: "endorse-3",
        type: "POLICY_QUOTED",
        payload: { premium: 1800 },
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    id: "audit-investigation",
    title: "Audit Investigation",
    description: "Demonstrates forensic analysis of policy events to investigate discrepancies and ensure compliance.",
    icon: "🔍",
    color: "from-purple-500 to-pink-500",
    category: "Audit",
    events: [
      {
        id: "audit-1",
        type: "POLICY_CREATED",
        payload: { name: "Commercial Property", premium: 2500, coverageLimit: 500000 },
        timestamp: new Date(Date.now() - 5184000000).toISOString(),
      },
      {
        id: "audit-2",
        type: "POLICY_BOUND",
        payload: { status: "Active" },
        timestamp: new Date(Date.now() - 4320000000).toISOString(),
      },
      {
        id: "audit-3",
        type: "CLAIM_REPORTED",
        payload: { claimAmount: 15000, description: "Property damage" },
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "audit-4",
        type: "CLAIM_APPROVED",
        payload: { approvedAmount: 12000 },
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    id: "system-recovery",
    title: "System Recovery",
    description: "Shows how the system recovers and rebuilds policy state from event history after a system failure.",
    icon: "🔄",
    color: "from-yellow-500 to-amber-500",
    category: "System",
    events: [
      {
        id: "recovery-1",
        type: "POLICY_CREATED",
        payload: { name: "Recovery Test", premium: 800, coverageLimit: 30000 },
        timestamp: new Date(Date.now() - 604800000).toISOString(),
      },
      {
        id: "recovery-2",
        type: "POLICY_BOUND",
        payload: { status: "Active" },
        timestamp: new Date(Date.now() - 518400000).toISOString(),
      },
      {
        id: "recovery-3",
        type: "POLICY_ENDORSED",
        payload: { coverageLimit: 40000 },
        timestamp: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        id: "recovery-4",
        type: "CLAIM_REPORTED",
        payload: { claimAmount: 2000, description: "Minor incident" },
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "recovery-5",
        type: "CLAIM_APPROVED",
        payload: { approvedAmount: 1800 },
        timestamp: new Date().toISOString(),
      },
    ],
  },
];

export default function DemoPage() {
  const { events, setEvents } = useAppContext();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [activeTimestamp, setActiveTimestamp] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [executionPhase, setExecutionPhase] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);

  const handleRunScenario = async (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setEvents([]); // Clear previous events
    setIsExecuting(true);
    setExecutionLogs([]);
    setTotalSteps(scenario.events.length + 1);
    setCurrentStep(1);
    setExecutionPhase("INITIALIZATION");

    setExecutionLogs(["> Loading scenario events..."]);
    await new Promise((r) => setTimeout(r, 900));

    for (let i = 0; i < scenario.events.length; i++) {
      const event = scenario.events[i];
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
        case "POLICY_CREATED":
          phase = "POLICY CREATION";
          reasoningLog = "initial policy parameters established";
          delay = 800;
          break;
      }

      setExecutionPhase(phase);
      setExecutionLogs((prev) => [...prev, `> ${phase}: ${reasoningLog}...`]);
      const eventWithReasoning = { ...event, reasoning: `→ ${reasoningLog}` };

      await new Promise((r) => setTimeout(r, delay));
      setEvents((prev) => [...prev, eventWithReasoning]);
    }

    setExecutionPhase("FINALLY");
    setExecutionLogs((prev) => [...prev, `[ SIMULATION COMPLETE ]`]);
    await new Promise((r) => setTimeout(r, 1000));
    setIsExecuting(false);
  };

  const handleBackToScenarios = () => {
    setSelectedScenario(null);
    setEvents([]);
    setExecutionLogs([]);
    setExecutionPhase(null);
    setCurrentStep(0);
    setTotalSteps(0);
  };

  if (selectedScenario) {
    return (
      <div className="relative min-h-screen bg-bg-base text-text-primary transition-all duration-700 overflow-x-hidden selection:bg-accent selection:text-black">
        {/* HUD HEADER */}
        <div className={`fixed top-16 left-12 z-50 transition-all duration-1000 ${isFocusMode ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
          <div className="flex flex-col gap-0.5">
            <h1 className="tool-title !text-lg tracking-tighter uppercase flex items-center gap-3">
              <span className="w-1 h-3 bg-signal-gradient rounded-full glow-primary" />
              <span className="text-signal-gradient font-black">DEMO_ENGINE</span>
            </h1>
            <div className="flex items-center gap-4 forensic-text uppercase tracking-[0.4em] font-bold !text-[8.5px] pl-4 mt-1">
              <span className="text-text-secondary">SCENARIO:</span>
              <span className="text-accent">{selectedScenario.title.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="fixed top-16 right-12 z-50">
          <button
            onClick={handleBackToScenarios}
            className="px-4 py-2 bg-bg-secondary border border-text-secondary/20 rounded text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            ← Back to Scenarios
          </button>
        </div>

        <div className="pt-32 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <EventTimeline
                  events={events}
                  activeTimestamp={activeTimestamp}
                  setActiveTimestamp={setActiveTimestamp}
                  isFocusMode={isFocusMode}
                  setIsFocusMode={setIsFocusMode}
                />
              </div>
              <div className="space-y-6">
                <SimulationPanel
                  isExecuting={isExecuting}
                  executionLogs={executionLogs}
                  executionPhase={executionPhase}
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                />
                <ReplayView
                  events={events}
                  activeTimestamp={activeTimestamp}
                  setActiveTimestamp={setActiveTimestamp}
                  isFocusMode={isFocusMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bg-base text-text-primary transition-all duration-700 overflow-x-hidden selection:bg-accent selection:text-black">
      {/* HUD HEADER */}
      <div className="fixed top-16 left-12 z-50">
        <div className="flex flex-col gap-0.5">
          <h1 className="tool-title !text-lg tracking-tighter uppercase flex items-center gap-3">
            <span className="w-1 h-3 bg-signal-gradient rounded-full glow-primary animate-pulse" />
            <span className="text-signal-gradient font-black">DEMO_SCENARIOS</span>
          </h1>
          <div className="flex items-center gap-4 forensic-text uppercase tracking-[0.4em] font-bold !text-[8.5px] pl-4 mt-1">
            <span className="text-text-secondary">MODE:</span>
            <span className="text-accent">INTERACTIVE</span>
            <span className="w-1.5 h-px bg-white/10" />
            <span className="text-text-secondary">SCENARIOS:</span>
            <span className="text-text-primary">{scenarios.length}</span>
          </div>
        </div>
      </div>

      <div className="pt-32 px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center text-2xl">
                🎯
              </div>
              <h2 className="text-5xl font-black text-signal-gradient tracking-tight">
                Demo Scenarios
              </h2>
            </div>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Real-world insurance use cases powered by event replay technology.
              Experience how complex workflows are executed through immutable event streams.
            </p>
          </div>

          {/* Scenario Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {scenarios.map((scenario, index) => (
              <div
                key={scenario.id}
                className="group relative glass-panel rounded-xl p-8 hover:scale-105 transition-all duration-500 cursor-pointer overflow-hidden animate-card-enter opacity-0"
                style={{ animationDelay: `${index * 150}ms` }}
                onClick={() => handleRunScenario(scenario)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${scenario.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                {/* Category Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${scenario.color} text-white/90`}>
                    {scenario.category}
                  </div>
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                    {scenario.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-text-primary mb-4 group-hover:text-accent-primary transition-colors duration-300">
                  {scenario.title}
                </h3>

                {/* Description */}
                <p className="text-text-secondary mb-6 leading-relaxed text-sm">
                  {scenario.description}
                </p>

                {/* Event Count & Duration */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-text-dim">
                    <span className="text-xs font-mono">EVENTS</span>
                    <span className="px-2 py-1 bg-bg-elevated rounded text-xs font-bold">
                      {scenario.events.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-text-dim">
                    <span className="text-xs font-mono">DURATION</span>
                    <span className="px-2 py-1 bg-bg-elevated rounded text-xs font-bold">
                      ~{Math.ceil(scenario.events.length * 1.2)}s
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full relative overflow-hidden bg-gradient-to-r from-accent-primary to-accent-secondary text-black font-bold py-4 px-6 rounded-lg hover:shadow-lg hover:shadow-accent-primary/25 transition-all duration-300 group-hover:scale-105">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>▶</span>
                    <span>Run Scenario</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${scenario.color} blur-xl opacity-10`} />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="text-center mt-16 pt-8 border-t border-glass-border">
            <p className="text-text-dim text-sm">
              Each scenario demonstrates real insurance workflows through event-driven architecture
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}