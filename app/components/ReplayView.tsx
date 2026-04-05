"use client";

import { useState } from 'react';
import { ReplayEvent } from '@/types/event';
import { reconstructState } from '@/lib/replayEngine';

import { Policy } from '@/types/policy';

interface ReplayViewProps {
  events: ReplayEvent[];
  currentPolicy: Policy;
}

export default function ReplayView({ events, currentPolicy }: ReplayViewProps) {
  const [targetTime, setTargetTime] = useState('');
  const [reconstructedState, setReconstructedState] = useState<any>(null);

  const handleReplay = () => {
    if (!targetTime) return;
    const state = reconstructState(events, targetTime);
    setReconstructedState(state);
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
    const colorClass = result === "MATCH" ? "text-green-600 font-bold" : "text-red-600 font-bold";

    return (
      <div className="mb-4">
        <div className="font-semibold">{label}:</div>
        <div className="ml-2">Past: {String(reconstructedState[field] ?? 'N/A')}</div>
        <div className="ml-2">Current: {String(currentPolicy[field])}</div>
        <div className="ml-2">Result: <span className={colorClass}>{result}</span></div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Replay View</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Replay Time</label>
          <input 
            type="datetime-local" 
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            className="border border-gray-300 rounded p-2 text-black w-full"
          />
        </div>
        <button 
          onClick={handleReplay}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          disabled={!targetTime}
        >
          Replay State
        </button>

        {reconstructedState && (
          <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded text-black font-mono text-sm max-h-64 overflow-auto">
            {renderFieldValidation("Premium", "premium")}
            {renderFieldValidation("Coverage", "coverageLimit")}
            {renderFieldValidation("Status", "status")}
          </div>
        )}
      </div>
    </div>
  );
}
