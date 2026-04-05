"use client";

import { useState } from 'react';
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
  const [reconstructedState, setReconstructedState] = useState<any>(null);
  const [steps, setSteps] = useState<{ event: ReplayEvent; resultingState: any }[]>([]);
  const [progression, setProgression] = useState<string[]>([]);
  const [isDebugMode, setIsDebugMode] = useState(false);

  const handleReplay = () => {
    if (!targetTime) return;
    const { state, steps: newSteps, progression: newProgression } = reconstructState(events, targetTime);
    setReconstructedState(state);
    setSteps(newSteps);
    setProgression(newProgression);
    if (onTimeSelect) onTimeSelect(new Date(targetTime).toISOString());
  };
  
  const getValidationResult = (field: keyof Policy) => {
    if (!reconstructedState) return null;
    
    if (field === 'premium' || field === 'coverageLimit') {
      return Number(reconstructedState[field]) === Number(currentPolicy[field]) ? "MATCH" : "MISMATCH";
    }
    
    return String(reconstructedState[field]) === String(currentPolicy[field]) ? "MATCH" : "MISMATCH";
  };

  const renderFieldValidation = (label: string, field: keyof Policy) => {
    if (!reconstructedState) return null;
    const result = getValidationResult(field);
    const isMatch = result === "MATCH";
    
    return (
      <div className="flex flex-col p-3 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg group hover:border-blue-500/30 transition-colors shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
            isMatch ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
          }`}>
            {result}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold mb-0.5 tracking-tighter">Historical</div>
            <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
              {typeof reconstructedState[field] === 'number' ? `$${reconstructedState[field].toLocaleString()}` : String(reconstructedState[field] ?? 'N/A')}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold mb-0.5 tracking-tighter">Current</div>
            <div className="text-xs font-mono text-slate-800 dark:text-white font-bold">
              {typeof currentPolicy[field] === 'number' ? `$${currentPolicy[field].toLocaleString()}` : String(currentPolicy[field])}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6 text-foreground">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Replay & Audit Engine</h2>
        <div className="flex items-center space-x-3">
          <label className="flex items-center cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only"
                checked={isDebugMode}
                onChange={(e) => setIsDebugMode(e.target.checked)}
              />
              <div className={`w-8 h-4 rounded-full transition-colors ${isDebugMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isDebugMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-tight text-slate-500 group-hover:text-blue-500 dark:group-hover:text-slate-400 transition-colors">Debug Trace</span>
          </label>
        </div>
      </div>

      <div className="space-y-6">
        {/* SECTION A: REPLAY CONTROL */}
        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Target Temporal Offset</label>
          <div className="flex space-x-3">
            <input 
              type="datetime-local" 
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            />
            <button 
              onClick={handleReplay}
              disabled={!targetTime}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg active:scale-[0.98] transition-all uppercase tracking-widest text-[10px]"
            >
              Init Replay
            </button>
          </div>
        </div>

        {reconstructedState && (
          <>
            {/* SECTION B: RECONSTRUCTED STATE */}
            <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Lifecycle Path:</span>
                <div className="flex flex-wrap items-center gap-1">
                  {progression.map((p, i) => (
                    <span key={p} className="flex items-center">
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">{p}</span>
                      {i < progression.length - 1 && <span className="mx-1 text-slate-400 dark:text-slate-600 text-[10px]">→</span>}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {renderFieldValidation("Risk Premium", "premium")}
                {renderFieldValidation("Liability Cap", "coverageLimit")}
                {renderFieldValidation("Policy Status", "status")}
              </div>
            </div>

            {/* SECTION C: DEBUG / EXPLANATION PANEL */}
            {isDebugMode && steps.length > 0 && (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl dark:shadow-none transition-colors">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-widest">Replay Explanation Panel</h3>
                  <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">{steps.length} signals tracked</span>
                </div>
                <div className="p-3 text-[11px] font-mono leading-relaxed max-h-80 overflow-y-auto space-y-4 custom-scrollbar text-foreground">
                  {steps.map((step, idx) => (
                    <div key={idx} className="border-l-2 border-slate-200 dark:border-slate-700 pl-4 py-1 group hover:border-blue-500 transition-colors">
                      <div className="text-blue-600 dark:text-blue-400 font-bold mb-1 flex items-center">
                        <span className="bg-blue-400/10 px-1.5 py-0.5 rounded mr-2 text-[9px]">S-0{idx + 1}</span>
                        {step.event.type}
                      </div>
                      <div className="text-slate-400 dark:text-slate-500 text-[10px] mb-2 font-light">
                        Temporal Index: {new Date(step.event.timestamp).toLocaleString()}
                      </div>
                      <div className="space-y-1 mt-2">
                        <div className="text-slate-500 dark:text-slate-400 flex">
                          <span className="w-16 flex-shrink-0">Payload:</span>
                          <span className="text-amber-600 dark:text-amber-500/80">{JSON.stringify(step.event.payload)}</span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 flex">
                          <span className="w-16 flex-shrink-0">State:</span>
                          <span className="text-emerald-600 dark:text-emerald-500/80">{JSON.stringify(step.resultingState)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
