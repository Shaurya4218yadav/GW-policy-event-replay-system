import { useState, useEffect } from 'react';

import { ReplayEvent } from '@/types/event';

interface EventTimelineProps {
  events: ReplayEvent[];
  activeTimestamp?: string | null;
  isFocusMode?: boolean;
}

export default function EventTimeline({ events, activeTimestamp, isFocusMode }: EventTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'anomalies' | 'financial' | 'lifecycle'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lastUpdated = events.length > 0 && mounted ? new Date(events[events.length - 1].timestamp).toLocaleTimeString() : 'N/A';


  const isActive = (timestamp: string) => {
    if (!activeTimestamp) return true;
    return new Date(timestamp) <= new Date(activeTimestamp);
  };

  const getEventBadgeClass = (type: string, active: boolean) => {
    if (!active) return "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/10 text-slate-400 dark:text-slate-700 opacity-40";
    
    switch (type) {
      case 'POLICY_CREATED': return 'border-white/10 bg-white/5 text-text-primary';
      case 'POLICY_QUOTED': return 'border-accent/20 bg-accent/5 text-accent';
      case 'POLICY_BOUND': return 'border-status-success/20 bg-status-success/5 text-status-success';
      case 'POLICY_ENDORSED': return 'border-accent-secondary/20 bg-accent-secondary/5 text-accent-secondary';
      case 'POLICY_CANCELLED': return 'border-status-error/20 bg-status-error/5 text-status-error';
      default: return 'border-white/10 bg-white/5 text-text-primary';
    }
  };

  const getDotClass = (type: string, active: boolean) => {
    if (!active) return "bg-bg-elevated border border-white/5";
    switch (type) {
      case 'POLICY_CREATED': return 'bg-text-dim shadow-[0_0_10px_rgba(110,118,129,0.3)]';
      case 'POLICY_QUOTED': return 'bg-accent shadow-[0_0_15px_rgba(34,211,238,0.4)]';
      case 'POLICY_BOUND': return 'bg-status-success shadow-[0_0_15px_rgba(34,197,94,0.4)]';
      case 'POLICY_ENDORSED': return 'bg-accent-secondary shadow-[0_0_15px_rgba(139,92,246,0.4)]';
      default: return 'bg-accent shadow-[0_0_10px_var(--accent-primary)]';
    }
  };

  const calculateDelta = (key: string, currentValue: any, currentIndex: number) => {
    if (typeof currentValue !== 'number') return null;
    for (let i = currentIndex - 1; i >= 0; i--) {
      const pastEvent = events[i];
      if (pastEvent.payload && typeof pastEvent.payload[key] === 'number') {
        const pastValue = pastEvent.payload[key];
        const diff = currentValue - pastValue;
        if (diff === 0) return null;
        
        const deltaStr = diff > 0 ? `(↑ +₹${diff.toLocaleString()})` : `(↓ -₹${Math.abs(diff).toLocaleString()})`;
        
        // ANOMALY DETECTION: > 50% change or > ₹5,000
        const isAnomaly = Math.abs(diff) > (pastValue * 0.5) || Math.abs(diff) > 5000;
        
        return { 
          text: deltaStr, 
          isAnomaly, 
          isPositive: diff > 0 
        };
      }
    }
    return null;
  };

  const generateTelemetry = (event: ReplayEvent) => {
     const hash = "0x" + event.id.replace(/-/g, "").substring(0, 10);
     const code = event.timestamp.charCodeAt(event.timestamp.length - 1) || 1;
     const ttc = (code * 3 + 12) + "ms";
     return { hash, ttc };
  };

  const filteredEvents = events.filter(event => {
    if (activeFilter === 'all') return true;
    
    const delta = calculateDelta('premium', event.payload?.premium, events.indexOf(event)) || 
                  calculateDelta('coverageLimit', event.payload?.coverageLimit, events.indexOf(event));
    
    if (activeFilter === 'anomalies') return delta?.isAnomaly;
    
    if (activeFilter === 'financial') {
      return ['POLICY_QUOTED', 'POLICY_ENDORSED', 'CLAIM_APPROVED'].includes(event.type);
    }
    
    if (activeFilter === 'lifecycle') {
      return ['POLICY_CREATED', 'POLICY_BOUND', 'POLICY_CANCELLED'].includes(event.type);
    }
    
    return true;
  });

  return (
    <div className="relative py-32 flex flex-col items-center min-h-[80vh]">
      {/* FILTER HUD */}
      <div className="sticky top-16 z-20 mb-20 flex items-center gap-1 p-0.5 glass-panel rounded-full relative">
        {(['all', 'anomalies', 'financial', 'lifecycle'] as const).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-5 py-1 rounded-full font-mono text-[8px] uppercase tracking-[0.2em] transition-all relative overflow-hidden group ${
              activeFilter === f 
                ? 'text-white' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {activeFilter === f && (
              <div className="absolute inset-0 bg-signal-gradient animate-signal-pulse -z-10" />
            )}
            <span className="relative z-10">{f}</span>
          </button>
        ))}
      </div>

      {/* Central Axis */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent -translate-x-1/2 z-0" />

      {events.length === 0 ? (
        <div className="forensic-text uppercase tracking-[0.3em] mt-24 opacity-30 animate-pulse">
          Awaiting_System_Signals...
        </div>
      ) : (
        <div className="w-full max-w-[1000px] relative z-10">
          {filteredEvents.map((event, idx) => {
            const active = isActive(event.timestamp);
            const isLeft = idx % 2 === 0;
            const isCurrentHead = idx === events.length - 1;
            const isDimmed = isFocusMode && !isCurrentHead;
            const telemetry = generateTelemetry(event);

            // Vary vertical spacing for organic feel
            const dynamicSpacing = idx % 3 === 0 ? 'pb-32' : 'pb-20';

            return (
              <div 
                key={event.id} 
                className={`flex items-center w-full group transition-all duration-700 ${dynamicSpacing} ${isDimmed ? 'opacity-20 blur-[2px] scale-95' : 'opacity-100'}`}
              >
                {/* Visual Node */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-700 relative ${
                    active 
                      ? 'bg-accent glow-primary scale-125' 
                      : 'bg-white/10 scale-75'
                  }`}>
                    {active && <div className="absolute inset-0 bg-signal-gradient rounded-full" />}
                  </div>
                  {isCurrentHead && active && (
                    <div className="absolute w-4 h-4 rounded-full border border-accent animate-ping opacity-20" />
                  )}
                </div>

                {/* Event Label Section */}
                <div className={`flex flex-col ${isLeft ? 'w-1/2 pr-12 items-end text-right' : 'w-1/2 ml-auto pl-12 items-start text-left'}`}>
                  {/* Timestamp & Hash HUD */}
                  <div className="flex items-center gap-3 mb-1 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="forensic-text text-[7px] tracking-widest">{telemetry.hash}</span>
                    <span className="forensic-text text-[7px] tracking-widest">
                      {mounted ? new Date(event.timestamp).toLocaleTimeString([], { hour12: false, second: "2-digit" }) : '--:--:--'}
                    </span>

                  </div>

                  {/* Event Type Name */}
                  <div className={`font-sans font-bold tracking-wide text-[11px] transition-all duration-300 ${
                    active ? 'text-text-primary' : 'text-text-dim opacity-40'
                  } group-hover:text-accent group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]`}>
                    {event.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                  </div>

                  {/* Reasoning Trace */}
                  {event.reasoning && active && (
                    <div className="mt-1 forensic-text italic text-[8px] max-w-[200px] opacity-40 group-hover:opacity-80">
                      // {event.reasoning}
                    </div>
                  )}

                  {/* Payload Data Stream */}
                  {event.payload && active && (
                    <div className="mt-4 space-y-1">
                      {Object.entries(event.payload).map(([k, v]) => {
                        const delta = calculateDelta(k, v, idx);
                        if (k === 'id' || k === 'timestamp') return null;
                        
                        return (
                          <div key={k} className={`flex flex-col ${isLeft ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-baseline gap-2">
                               <span className="tool-label !text-[7px] opacity-30">{k}</span>
                               <span className="tool-value !text-[11px] tracking-tighter">
                                 {typeof v === 'number' ? `₹${v.toLocaleString()}` : String(v)}
                               </span>
                            </div>
                            {delta && (
                              <div className={`flex items-center gap-1.5 mt-0.5 ${delta.isPositive ? 'text-status-success/80' : 'text-status-error/80'} forensic-text !text-[7px] font-bold`}>
                                 <span>{delta.text}</span>
                                 {delta.isAnomaly && (
                                   <span className="px-1 bg-status-warning/10 text-status-warning rounded-[2px] tracking-[0.2em] uppercase glow-secondary border border-status-warning/20">Sensitive</span>
                                 )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
