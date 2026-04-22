"use client";

import { useState, useEffect } from 'react';
import { Policy } from '@/types/policy';
import { useAppContext } from '../context/AppContext';
import { detectFraud } from '@/lib/fraudDetector';

interface UpdateFormProps {
  policy: Policy;
  onUpdate: (policy: Policy) => void;
}

export default function UpdateForm({ policy, onUpdate }: UpdateFormProps) {
  const { events } = useAppContext();
  const [formData, setFormData] = useState<Policy>(policy);
  const { isLocked } = detectFraud(events);

  // Sync state if policy prop changes externally
  useEffect(() => {
    setFormData(policy);
  }, [policy]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'premium' || name === 'coverageLimit') {
      if (value === '') return;
      
      const numericValue = Number(value);
      if (isNaN(numericValue)) return;
      
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalPolicy = { ...formData };
    finalPolicy.premium = Number(finalPolicy.premium);
    finalPolicy.coverageLimit = Number(finalPolicy.coverageLimit);
    
    onUpdate(finalPolicy);
  };

  const checkConflict = (field: keyof Policy) => {
    if (events.length === 0) return false;
    
    // Find last matching event payload
    for (let i = events.length - 1; i >= 0; i--) {
      const e = events[i];
      if (e.payload && e.payload[field] !== undefined) {
         const eventValue = e.payload[field];
         const inputValue = formData[field];
         
         if (typeof eventValue === 'number') {
            return Number(eventValue) !== Number(inputValue);
         }
         return String(eventValue) !== String(inputValue);
      }
    }
    return false;
  };

  return (
    <div className="glass-panel p-6 rounded-2xl animate-hud-slide">
      <div className="mb-8 overflow-hidden">
        <h2 className="tool-title !text-lg flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-accent glow-primary animate-signal-pulse" />
          Update Form
        </h2>
        <div className="text-text-dim text-xs mt-2 tracking-wider font-semibold">Generate New Events</div>
      </div>
      
      {isLocked && (
        <div className="mb-8 p-4 border border-status-error/30 bg-status-error/5 rounded-xl">
           <div className="text-status-error font-bold tracking-widest text-[10px] mb-2 flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-status-error animate-ping" />
             POLICY LOCKED
           </div>
           <p className="text-[10px] text-text-primary/60 font-mono">
             Suspicious activity detected. All edit operations are halted until an Auditor reviews and clears the security flags.
           </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-8">
          <div className="group relative">
            <label className="tool-label block mb-1">Policy Description</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              className="w-full bg-transparent border-b border-white/5 py-2 text-sm forensic-text !text-text-primary focus:border-accent transition-all placeholder:text-text-dim/20"
              placeholder="Empty String"
            />
          </div>
          
          <div className="group relative">
            <label className="tool-label block mb-1">Operational State</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              className="w-full bg-transparent border-b border-white/5 py-2 text-sm forensic-text !text-text-primary focus:border-accent transition-all appearance-none cursor-pointer"
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Claim Open">Claim Open</option>
              <option value="Claim Approved">Claim Approved</option>
            </select>
          </div>
        </div>

        <div className="space-y-8">
          <div className="group relative">
            <label className="tool-label flex justify-between items-center w-full mb-1">
              Target Premium
              {checkConflict('premium') && (
                <span className="text-[7.5px] font-black text-status-warning animate-pulse tracking-[0.3em] glow-secondary border border-status-warning/20 px-2 rounded-full">[ CONFLICT ]</span>
              )}
            </label>
            <div className="relative flex items-center">
              <span className="tool-value !text-xs opacity-20 mr-2">₹</span>
              <input 
                type="number" 
                name="premium" 
                value={formData.premium} 
                onChange={handleChange}
                className={`w-full bg-transparent border-b border-white/5 py-2 tool-value !text-sm focus:border-accent transition-all ${checkConflict('premium') ? 'text-status-warning' : ''}`}
              />
            </div>
          </div>
          
          <div className="group relative">
            <label className="tool-label flex justify-between items-center w-full mb-1">
              Limit of Liability
              {checkConflict('coverageLimit') && (
                <span className="text-[7.5px] font-black text-status-warning animate-pulse tracking-[0.3em] glow-secondary border border-status-warning/20 px-2 rounded-full">[ CONFLICT ]</span>
              )}
            </label>
            <div className="relative flex items-center">
              <span className="tool-value !text-xs opacity-20 mr-2">₹</span>
              <input 
                type="number" 
                name="coverageLimit" 
                value={formData.coverageLimit} 
                onChange={handleChange}
                className={`w-full bg-transparent border-b border-white/5 py-2 tool-value !text-sm focus:border-accent transition-all ${checkConflict('coverageLimit') ? 'text-status-warning' : ''}`}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLocked}
          className={`w-full group relative overflow-hidden h-12 border transition-all duration-700 rounded-full ${isLocked ? 'border-status-error/20 opacity-50 cursor-not-allowed' : 'border-accent/20 hover:border-accent'}`}
        >
          {!isLocked && <div className="absolute inset-0 bg-signal-gradient opacity-0 group-hover:opacity-10 transition-opacity" />}
          <span className={`relative text-xs tracking-widest font-black uppercase group-hover:transition-all ${isLocked ? 'text-status-error' : 'text-text-primary group-hover:text-accent group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]'}`}>
            {isLocked ? 'System Locked' : 'Execute Update'}
          </span>
        </button>
      </form>
    </div>
  );
}
