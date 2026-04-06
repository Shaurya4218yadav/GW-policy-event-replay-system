"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { ReplayEvent } from '@/types/event';
import { reconstructState } from '@/lib/replayEngine';

import { Policy } from '@/types/policy';

interface ReplayViewProps {
  events: ReplayEvent[];
  currentPolicy: Policy;
  onTimeSelect?: (timestamp: string) => void;
}

export default function ReplayView({ events, currentPolicy, onTimeSelect }: ReplayViewProps) {
  const [targetTime, setTargetTime] = useState('');
  const [sliderIndex, setSliderIndex] = useState(0);
  const [reconstructedState, setReconstructedState] = useState<any>(null);
  const [steps, setSteps] = useState<{ event: ReplayEvent; resultingState: any }[]>([]);
  const [progression, setProgression] = useState<string[]>([]);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const sortedTimestamps = useMemo(
    () => events
      .map((event) => event.timestamp)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    [events]
  );

  const selectedTime = sortedTimestamps[sliderIndex] || targetTime;

  useEffect(() => {
    if (sortedTimestamps.length > 0) {
      const lastIndex = sortedTimestamps.length - 1;
      setSliderIndex(lastIndex);
      setTargetTime(sortedTimestamps[lastIndex]);
    }
  }, [sortedTimestamps.join(',')]);

  useEffect(() => {
    if (!selectedTime) {
      setReconstructedState(null);
      setSteps([]);
      setProgression([]);
      return;
    }

    const { state, steps: newSteps, progression: newProgression } = reconstructState(events, selectedTime);
    setReconstructedState(state);
    setSteps(newSteps);
    setProgression(newProgression);
    if (onTimeSelect) onTimeSelect(new Date(selectedTime).toISOString());
  }, [selectedTime, events, onTimeSelect]);

  const handleReplay = () => {
    if (!targetTime) return;
    const index = sortedTimestamps.indexOf(targetTime);
    if (index !== -1) {
      setSliderIndex(index);
    }
  };
  
  const getValidationResult = (field: keyof Policy) => {
    if (!reconstructedState) return null;
    
    if (field === 'premium' || field === 'coverageLimit') {
      return Number(reconstructedState[field]) === Number(currentPolicy[field]) ? "MATCH" : "MISMATCH";
    }
    
    return String(reconstructedState[field]) === String(currentPolicy[field]) ? "MATCH" : "MISMATCH";
  };

  const getFieldDerivations = (field: keyof Policy) => {
    const derivations: { type: string; reasoning: string }[] = [];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.event.payload && step.event.payload[field] !== undefined) {
         let reasoning = step.event.reasoning || "State mutated via payload update";
         reasoning = reasoning.replace("→ ", "");
         
         // Delta Computation
         let deltaSuffix = "";
         if (typeof step.event.payload[field] === 'number') {
            const currentValue = step.event.payload[field];
            for (let j = i - 1; j >= 0; j--) {
               const pastEvent = steps[j].event;
               if (pastEvent.payload && typeof pastEvent.payload[field] === 'number') {
                  const diff = currentValue - pastEvent.payload[field];
                  if (diff !== 0) {
                     deltaSuffix = diff > 0 
                        ? ` [+ ₹${diff.toLocaleString()}]` 
                        : ` [- ₹${Math.abs(diff).toLocaleString()}]`;
                  }
                  break;
               }
            }
         }
         
         derivations.push({ type: step.event.type, reasoning: reasoning + deltaSuffix });
      } else if (step.event.type === 'POLICY_CREATED') {
         if (field === 'status' || (step.event.payload && step.event.payload[field] !== undefined)) {
            derivations.push({ type: step.event.type, reasoning: "Initial system registration" });
         }
      }
    }
    return derivations;
  };

  const renderFieldValidation = (label: string, field: keyof Policy) => {
    if (!reconstructedState) return null;
    const result = getValidationResult(field);
    const isMatch = result === "MATCH";
    const isExpanded = expandedField === field;
    
    return (
      <div className={`flex flex-col py-3 border-b border-border/20 group hover:border-accent/40 transition-all duration-300 ${isExpanded ? 'bg-accent/5 px-3 rounded-sm border-accent/20' : ''}`}>
        <div 
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => setExpandedField(isExpanded ? null : field)}
        >
          <div className="flex items-center gap-2">
            <span className="tool-label">{label}</span>
            <svg 
              viewBox="0 0 24 24" 
              className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} fill-muted-foreground`}
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest ${
            isMatch ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
          }`}>
            {result}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[9px] text-muted uppercase tracking-widest mb-1">Historical</div>
            <div className="text-sm font-mono text-muted-foreground">
              {typeof reconstructedState[field] === 'number' ? `₹${reconstructedState[field].toLocaleString()}` : String(reconstructedState[field] ?? 'N/A')}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-muted uppercase tracking-widest mb-1">Current</div>
            <div className={`text-sm font-mono ${isMatch ? 'text-foreground' : 'text-red-500'}`}>
              {typeof currentPolicy[field] === 'number' ? `₹${currentPolicy[field].toLocaleString()}` : String(currentPolicy[field])}
            </div>
          </div>
        </div>

        {/* EXPLAIN STATE LOGIC (Visible when expanded or in Debug) */}
        {(isExpanded || isDebugMode) && (
          <div className="mt-4 pt-3 border-t border-border/10 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="text-[9px] text-muted uppercase tracking-widest mb-2 font-bold flex justify-between">
                <span>Forensic Derivation Trace:</span>
                {isExpanded && <span className="text-accent">DETAILED VIEW</span>}
             </div>
             <ul className="space-y-2 pl-0">
               {getFieldDerivations(field).map((deriv, idx) => (
                  <li key={idx} className="flex flex-col gap-1 text-[10px] items-start text-muted-foreground font-mono border-l border-border/40 pl-3">
                    <div className="flex gap-2">
                      <span className="text-accent flex-shrink-0">{deriv.type}</span>
                    </div>
                    <span className="italic text-muted leading-relaxed">→ {deriv.reasoning}</span>
                  </li>
               ))}
               {getFieldDerivations(field).length === 0 && (
                  <li className="text-[10px] text-muted font-mono italic border-l border-border/40 pl-3">- Inherited from base template</li>
               )}
             </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-panel p-6 rounded-2xl animate-hud-slide">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="tool-title !text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            REPLAY_AUDIT_ENGINE
          </h2>
          <div className="forensic-text mt-1 opacity-40">SIGNAL_RECONSTRUCTION_LAYER</div>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center cursor-pointer group">
            <span className="mr-3 forensic-text !text-[8px] tracking-[0.2em] text-muted-foreground group-hover:text-accent transition-colors">DEBUG_TRACE</span>
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only"
                checked={isDebugMode}
                onChange={(e) => setIsDebugMode(e.target.checked)}
              />
              <div className={`w-7 h-3 rounded-full transition-colors ${isDebugMode ? 'bg-accent/40' : 'bg-white/5 border border-white/5'}`}></div>
              <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full transition-transform ${isDebugMode ? 'translate-x-4 bg-accent' : 'translate-x-0 bg-white/20'}`}></div>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-12">
        {/* TEMPORAL OFFSET INPUT */}
        <div className="group relative">
          <label className="tool-label block mb-2 opacity-30 group-hover:opacity-100 transition-opacity">Temporal Offset Selection</label>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-4">
              <input 
                type="datetime-local" 
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className="w-full bg-transparent border-b border-white/5 py-2 forensic-text !text-foreground focus:border-accent transition-all cursor-pointer"
              />
              <div className="flex flex-col justify-end gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-text-secondary">Selected replay timestamp</span>
                <span className="text-sm text-text-primary break-all">{selectedTime || 'No timestamp selected'}</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(sortedTimestamps.length - 1, 0)}
              value={sliderIndex}
              onChange={(e) => {
                const index = Number(e.target.value);
                setSliderIndex(index);
                setTargetTime(sortedTimestamps[index] || '');
              }}
              className="w-full accent-accent"
              disabled={sortedTimestamps.length <= 1}
            />
            <div className="text-xs text-text-secondary flex justify-between">
              <span>{sortedTimestamps[0] ? new Date(sortedTimestamps[0]).toLocaleString() : '—'}</span>
              <span>{sortedTimestamps[sortedTimestamps.length - 1] ? new Date(sortedTimestamps[sortedTimestamps.length - 1]).toLocaleString() : '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleReplay}
                disabled={!targetTime}
                className={`group relative overflow-hidden h-10 border border-white/5 rounded-full transition-all duration-500 ${
                  !targetTime ? 'opacity-20 cursor-not-allowed' : 'hover:border-accent/40'
                }`}
              >
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative forensic-text !text-[9px] tracking-[0.3em] font-bold text-foreground group-hover:text-accent">
                  [ INIT_REPLAY ]
                </span>
              </button>

              <button 
                onClick={() => {
                  const data = JSON.stringify(events, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `audit-log-${new Date().getTime()}.json`;
                  a.click();
                }}
                className="group relative overflow-hidden h-10 bg-white/[0.02] border border-white/5 hover:border-white/20 rounded-full transition-all duration-500"
              >
                <span className="relative forensic-text !text-[8px] tracking-[0.2em] text-muted-foreground group-hover:text-foreground">
                  EXPORT_SIGNALS
                </span>
              </button>
            </div>
          </div>
        </div>

        {reconstructedState && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* LIFECYCLE PROGRESSION */}
            <div className="space-y-3">
              <div className="tool-label !text-[7px] opacity-30">LIFECYCLE_PATH_RECONSTRUCTED</div>
              <div className="flex flex-wrap items-center gap-2">
                {progression.map((p, i) => (
                  <React.Fragment key={p}>
                    <span className="forensic-text !text-[9px] text-accent px-2 py-0.5 bg-accent/5 rounded-[4px] border border-accent/10">
                      {p}
                    </span>
                    {i < progression.length - 1 && (
                      <span className="text-white/10 forensic-text">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* FIELD VALIDATION OVERLAYS */}
            <div className="space-y-4">
              <div className="tool-label !text-[7px] opacity-30">FORENSIC_STATE_STREAMS</div>
              <div className="grid grid-cols-1 gap-2">
                {renderFieldValidation("Risk Premium", "premium")}
                {renderFieldValidation("Liability Cap", "coverageLimit")}
                {renderFieldValidation("Policy Status", "status")}
              </div>
            </div>

            {/* DEBUG TRACE STREAM */}
            {isDebugMode && steps.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                   <div className="tool-label !text-[7px] opacity-30">DETAILED_SIGNAL_SEQUENCE</div>
                   <span className="forensic-text !text-[8px] opacity-20">{steps.length} SIGNALS</span>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                  {steps.map((step, idx) => (
                    <div key={idx} className="group relative pl-4 border-l border-white/5 hover:border-accent/40 transition-colors py-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="forensic-text !text-[8px] text-accent font-bold">S-{String(idx + 1).padStart(2, '0')}</span>
                        <span className="forensic-text !text-[9px] text-foreground/80">{step.event.type}</span>
                      </div>
                      <div className="forensic-text opacity-20 group-hover:opacity-40 transition-opacity">
                        {new Date(step.event.timestamp).toLocaleString([], { hour12: false })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
