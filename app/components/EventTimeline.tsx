import { ReplayEvent } from '@/types/event';

interface EventTimelineProps {
  events: ReplayEvent[];
}

interface EventTimelineProps {
  events: ReplayEvent[];
  activeTimestamp?: string | null;
}

export default function EventTimeline({ events, activeTimestamp }: EventTimelineProps) {
  const lastUpdated = events.length > 0 ? new Date(events[events.length - 1].timestamp).toLocaleTimeString() : 'N/A';

  const isActive = (timestamp: string) => {
    if (!activeTimestamp) return true;
    return new Date(timestamp) <= new Date(activeTimestamp);
  };

  const getEventBadgeClass = (type: string, active: boolean) => {
    if (!active) return "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/10 text-slate-400 dark:text-slate-700 opacity-40";
    
    switch (type) {
      case 'POLICY_CREATED': return 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300';
      case 'POLICY_QUOTED': return 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300';
      case 'POLICY_BOUND': return 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300';
      case 'POLICY_ENDORSED': return 'border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300';
      case 'POLICY_CANCELLED': return 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300';
      default: return 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300';
    }
  };

  const getDotClass = (type: string, active: boolean) => {
    if (!active) return "bg-slate-300 dark:bg-slate-800";
    switch (type) {
      case 'POLICY_CREATED': return 'bg-slate-400 dark:bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.5)]';
      case 'POLICY_QUOTED': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
      case 'POLICY_BOUND': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      case 'POLICY_ENDORSED': return 'bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]';
      default: return 'bg-slate-400 dark:bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.5)]';
    }
  };

  return (
    <div className="relative py-12 flex flex-col items-center transition-colors duration-300">
      {/* Central Timeline Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 -translate-x-1/2" />

      {events.length === 0 ? (
        <div className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-12 bg-background px-4 z-10">
          Listening for system signals...
        </div>
      ) : (
        <div className="w-full max-w-[800px] space-y-12 transition-all">
          {events.map((event, idx) => {
            const active = isActive(event.timestamp);
            const isLeft = idx % 2 === 0;

            return (
              <div key={event.id} className={`flex items-center w-full group transition-all duration-700 ease-in-out`}>
                <div className={`w-1/2 flex items-center ${isLeft ? "justify-end pr-12 order-1" : "order-3 pl-12 justify-start"}`}>
                  <div className={`p-4 border rounded-lg max-w-xs shadow-sm dark:shadow-none transition-all duration-500 ${getEventBadgeClass(event.type, active)}`}>
                    <div className="flex justify-between items-start mb-2 opacity-50">
                      <span className="text-[9px] font-mono whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-tighter">SIGNAL S-0{idx + 1}</span>
                    </div>
                    <div className="font-mono text-xs font-bold uppercase tracking-tight">
                      {event.type.replace(/_/g, " ")}
                    </div>
                    {event.payload && active && (
                      <div className="mt-3 text-[10px] font-mono leading-relaxed p-2 bg-black/5 dark:bg-black/40 rounded border border-black/5 dark:border-white/5 opacity-80">
                        {Object.entries(event.payload).map(([k, v]) => (
                          <div key={k} className="flex space-x-2">
                            <span className="text-slate-400 dark:text-slate-500">{k}:</span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative flex items-center justify-center order-2 w-0">
                  <div className={`absolute w-3 h-3 rounded-full ring-4 ring-background z-10 transition-all duration-500 ${getDotClass(event.type, active)}`} />
                  <div className={`absolute w-12 h-px bg-slate-200 dark:bg-slate-800 transition-all duration-500 ${isLeft ? "-left-12" : "left-0"} ${!active && "opacity-20 translate-x-1"}`} />
                </div>

                <div className="w-1/2 order-3" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
