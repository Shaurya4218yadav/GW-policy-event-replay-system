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

  const { setEvents } = useAppContext();

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
        setEvents((prev: ReplayEvent[]) => [...prev, ...generatedEvents]);
        onSimulate(generatedEvents);
      }
    } catch (error) {
      console.error("Simulation engine failure:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-8 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Simulation Engine</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-blue-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
          <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">
            {isSimulating ? 'Processing Sequence' : 'Engine Idle'}
          </span>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Predictive Scenario Profile</label>
          <select 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            disabled={isSimulating}
          >
            <option value="claim">Accident Claim Workflow</option>
            <option value="endorsement">Coverage Enhancement Path</option>
          </select>
          <div className="absolute right-3 top-9 pointer-events-none text-slate-400 dark:text-slate-600">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        <button 
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className={`w-full relative group transition-all duration-300 ${
            isSimulating 
              ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-400 dark:text-slate-500' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40 hover:shadow-indigo-500/20 active:scale-[0.98]'
          } font-bold py-4 rounded-xl overflow-hidden`}
        >
          <div className="relative z-10 flex items-center justify-center space-x-2">
            {isSimulating && (
              <svg className="animate-spin h-4 w-4 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span className="uppercase tracking-[0.15em] text-xs">
              {isSimulating ? 'Executing Simulation...' : 'Run Simulation Sequence'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
