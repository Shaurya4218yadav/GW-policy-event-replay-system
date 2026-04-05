"use client";

import { useState } from 'react';
import EventTimeline from './components/EventTimeline';
import PolicyCard from './components/PolicyCard';
import UpdateForm from './components/UpdateForm';
import ReplayView from './components/ReplayView';
import { Policy } from '@/types/policy';
import { ReplayEvent } from '@/types/event';

export default function Home() {
  const [policy, setPolicy] = useState<Policy>({
    id: 'POL-001',
    name: 'Standard Auto',
    premium: 1000,
    coverageLimit: 50000,
    status: 'active'
  });

  const [events, setEvents] = useState<ReplayEvent[]>([]);

  const handleUpdatePolicy = (newPolicy: Policy) => {
    // Strongly enforce numeric casting at the root handler level
    const parsedPolicy = {
      ...newPolicy,
      premium: Number(newPolicy.premium),
      coverageLimit: Number(newPolicy.coverageLimit)
    };

    const newEvents: ReplayEvent[] = [];
    const now = new Date().toISOString();
    
    // Compare each field and log an event if changed
    Object.keys(parsedPolicy).forEach((key) => {
      const field = key as keyof Policy;
      if (policy[field] !== parsedPolicy[field]) {
        newEvents.push({
          id: crypto.randomUUID(),
          field,
          oldValue: policy[field],
          newValue: parsedPolicy[field],
          timestamp: now
        });
      }
    });

    if (newEvents.length > 0) {
      setEvents(prev => [...prev, ...newEvents]);
      setPolicy(parsedPolicy);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Pane - Event Timeline */}
      <div className="w-1/2 h-full border-r border-gray-200 overflow-y-auto">
        <EventTimeline events={events} />
      </div>

      {/* Right Pane - Policy Card & Update Form */}
      <div className="w-1/2 h-full flex flex-col overflow-y-auto">
        <div className="border-b border-gray-200">
          <PolicyCard policy={policy} />
        </div>
        <div className="border-b border-gray-200">
          <UpdateForm policy={policy} onUpdate={handleUpdatePolicy} />
        </div>
        <div className="flex-1">
          <ReplayView events={events} currentPolicy={policy} />
        </div>
      </div>
    </div>
  );
}
