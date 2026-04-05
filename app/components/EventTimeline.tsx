import { ReplayEvent } from '@/types/event';

interface EventTimelineProps {
  events: ReplayEvent[];
}

export default function EventTimeline({ events }: EventTimelineProps) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Event Timeline</h2>
      {events.length === 0 ? (
        <p className="text-gray-500">No events recorded yet.</p>
      ) : (
        <div className="space-y-4 border-l-2 border-blue-500 ml-3">
          {events.map((event) => (
            <div key={event.id} className="relative pl-6">
              {/* Timeline dot */}
              <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5" />
              <div className="bg-white border border-gray-200 rounded p-3 shadow-sm text-black font-mono">
                <div>[{new Date(event.timestamp).toLocaleTimeString()}]</div>
                <div>{event.field}: {String(event.oldValue)} → {String(event.newValue)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
