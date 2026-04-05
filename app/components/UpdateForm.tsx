"use client";

import { useState, useEffect } from 'react';
import { Policy } from '@/types/policy';

interface UpdateFormProps {
  policy: Policy;
  onUpdate: (policy: Policy) => void;
}

export default function UpdateForm({ policy, onUpdate }: UpdateFormProps) {
  const [formData, setFormData] = useState<Policy>(policy);

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

  return (
    <div className="p-8 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Transaction Registry</h2>
        <div className="text-[10px] italic text-slate-400 dark:text-slate-500">Submit to generate new audit signals</div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Policy Description</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
              placeholder="e.g. Standard Auto"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Operational State</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Target Premium (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 text-xs">$</span>
              <input 
                type="number" 
                name="premium" 
                value={formData.premium} 
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 pl-7 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Limit of Liability (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 text-xs">$</span>
              <input 
                type="number" 
                name="coverageLimit" 
                value={formData.coverageLimit} 
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 pl-7 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-blue-900/40 transform transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/30 uppercase tracking-widest text-xs mt-2"
        >
          Execute Field Update
        </button>
      </form>
    </div>
  );
}
