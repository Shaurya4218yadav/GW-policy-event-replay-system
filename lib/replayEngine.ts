import { ReplayEvent } from '@/types/event';

export function reconstructState(events: ReplayEvent[], targetTime: string) {
  // Start with specified initial policy
  const state: any = {
    name: "Standard Auto",
    premium: 1000,
    coverageLimit: 50000,
    status: "Active"
  };

  if (!targetTime) return state;

  const targetDate = new Date(targetTime).getTime();

  events
    .filter(e => new Date(e.timestamp).getTime() <= targetDate)
    .slice() // copy array before sorting
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .forEach(event => {
      state[event.field] = event.newValue;
    });

  return state;
}
