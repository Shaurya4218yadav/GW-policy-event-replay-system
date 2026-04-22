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

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          scenario: selectedScenario,
          currentPremium,
          currentCoverage
        }),
      });
      const generatedEvents = await res.json();
      
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
          <h2 className="tool-title !text-lg flex items-center gap-3">
            <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-status-warning animate-pulse glow-secondary' : 'bg-accent glow-primary'} transition-all duration-500`} />
            Endorsement Simulator
          </h2>
          <div className="mt-2 text-text-dim tracking-wider font-semibold text-xs">
            {isSimulating ? 'Executing Endorsement Model...' : 'Engine State: Ready'}
          </div>
        </div>
      </div>
      
      <div className="space-y-10">
        <div className="group relative">
          <label className="tool-label block mb-2 opacity-30 group-hover:opacity-100 transition-opacity">Predictive Scenario Profile</label>
          <div className="relative">
            <select 
              className="w-full bg-transparent border-b border-white/5 py-3 text-[11px] forensic-text !text-text-primary focus:border-accent transition-all appearance-none cursor-pointer tracking-wider font-bold"
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              disabled={isSimulating}
            >
              <option value="claim">Accident Claim Workflow</option>
              <option value="endorsement">Coverage Enhancement Path</option>
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover:text-accent group-hover:opacity-100 transition-all">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        <button 
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className={`w-full group relative overflow-hidden h-12 border rounded-full transition-all duration-700 ${
            isSimulating ? 'border-status-warning/20 opacity-60 cursor-not-allowed' : 'border-accent/20 hover:border-accent'
          }`}
        >
          <div className={`absolute inset-0 ${isSimulating ? 'bg-status-warning/5 animate-pulse' : 'bg-signal-gradient opacity-0 group-hover:opacity-10'} transition-all`} />
          <div className="relative flex items-center justify-center gap-4">
             {isSimulating && (
                <div className="w-1.5 h-1.5 rounded-full bg-status-warning animate-ping blur-[1px]" />
             )}
             <span className="text-xs tracking-widest font-black text-text-primary group-hover:text-accent transition-all group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] uppercase">
               {isSimulating ? 'Predicting Outcomes...' : 'Run Premium Model'}
             </span>
          </div>
        </button>
      </div>
    </div>
  );
}
