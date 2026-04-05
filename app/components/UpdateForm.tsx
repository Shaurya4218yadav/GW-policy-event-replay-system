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
    setFormData(prev => ({
      ...prev,
      [name]: name === 'premium' || name === 'coverageLimit' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Update Policy</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Premium</label>
          <input 
            type="number" 
            name="premium" 
            value={formData.premium} 
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Coverage Limit</label>
          <input 
            type="number" 
            name="coverageLimit" 
            value={formData.coverageLimit} 
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select 
            name="status" 
            value={formData.status} 
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 text-black"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Policy
        </button>
      </form>
    </div>
  );
}
