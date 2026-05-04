import { useState } from 'react';
import { ReplayEvent } from '@/types/event';
import { useAppContext } from '../context/AppContext';

interface SimulationPanelProps {
  onSimulate: (newEvents: ReplayEvent[]) => void;
  currentPremium: number;
  currentCoverage: number;
}

export default function SimulationPanel({ onSimulate, currentPremium, currentCoverage }: SimulationPanelProps) {
  const [selectedScenario, setSelectedScenario] = useState('claim');
  const [isSimulating, setIsSimulating] = useState(false);
  const { user } = useAppContext();

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(user?.role ? { "x-user-role": user.role } : {})
        },
        body: JSON.stringify({ 
          scenario: selectedScenario,
          currentPremium,
          currentCoverage
        }),
      });
      const data = await res.json();
      const generatedEvents = data.events || [];
      
      if (generatedEvents.length > 0) {
        onSimulate(generatedEvents);
      }
    } catch (error) {
      console.error("Simulation engine failure:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl animate-hud-slide">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-3">
            <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-accent-secondary animate-pulse' : 'bg-accent-primary'} transition-all duration-500`} />
            Simulation Engine
          </h2>
          <div className="text-[var(--text-muted)] text-[11px] font-medium tracking-wide mt-2">
            {isSimulating ? 'Executing predictive models...' : 'Engine state: Ready'}
          </div>
        </div>
      </div>
      
      <div className="space-y-10">
        <div className="group relative">
          <label className="tool-label block mb-2 opacity-30 group-hover:opacity-100 transition-opacity">Predictive Scenario Profile</label>
          <div className="relative">
            <select 
              className="w-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-md py-2.5 px-4 text-[12px] text-[var(--text-primary)] focus:border-accent-primary transition-all appearance-none cursor-pointer"
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              disabled={isSimulating}
            >
              <option value="claim">Accident Claim Workflow</option>
              <option value="endorsement">Coverage Enhancement Path</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover:text-accent-primary group-hover:opacity-100 transition-all">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        <button 
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className={`w-full group relative overflow-hidden h-10 transition-all duration-300 ${
            isSimulating ? 'bg-[var(--bg-panel)] border border-[var(--border-subtle)] opacity-60 cursor-not-allowed rounded-md' : 'btn-primary rounded-md'
          }`}
        >
          <div className="relative flex items-center justify-center gap-3">
             {isSimulating && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-ping" />
             )}
             <span className={`text-[12px] font-bold transition-all ${isSimulating ? 'text-[var(--text-muted)]' : 'text-black'}`}>
               {isSimulating ? 'Predicting...' : 'Run Simulation'}
             </span>
          </div>
        </button>
      </div>
    </div>
  );
}
