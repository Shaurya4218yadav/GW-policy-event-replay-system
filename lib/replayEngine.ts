import { ReplayEvent } from '@/types/event';

export function reconstructState(events: ReplayEvent[], targetTime: string) {
  let state: any = null;
  const steps: { event: ReplayEvent; resultingState: any }[] = [];
  const progression: string[] = [];

  if (!targetTime && events.length > 0) {
    // If no target time, return the initial state from the first event
    const firstEvent = events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
    return { state: { ...firstEvent.payload }, steps: [{ event: firstEvent, resultingState: firstEvent.payload }], progression: ['Draft'] };
  }
  
  if (!targetTime) return { state, steps, progression };

  const targetDate = new Date(targetTime).getTime();

  const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  sortedEvents
    .filter(e => new Date(e.timestamp).getTime() <= targetDate)
    .forEach(event => {
      switch (event.type) {
        case 'POLICY_CREATED':
          state = { ...event.payload };
          if (!progression.includes('Draft')) progression.push('Draft');
          break;
        case 'POLICY_QUOTED':
          if (state && event.payload?.premium !== undefined) {
            state.premium = event.payload.premium;
          }
          if (!progression.includes('Quoted')) progression.push('Quoted');
          break;
        case 'POLICY_BOUND':
          if (state) state.status = 'Active';
          if (!progression.includes('Active')) progression.push('Active');
          break;
        case 'POLICY_ENDORSED':
          if (state) {
            if (event.payload?.coverageLimit !== undefined) {
              state.coverageLimit = event.payload.coverageLimit;
            }
            if (event.payload?.premium !== undefined) {
              state.premium = event.payload.premium;
            }
            if (!progression.includes('Endorsed')) progression.push('Endorsed');
          }
          break;
        case 'POLICY_CANCELLED':
          if (state) state.status = 'Cancelled';
          if (!progression.includes('Cancelled')) progression.push('Cancelled');
          break;
        case 'CLAIM_REPORTED':
          if (state) state.status = 'Claim Open';
          if (!progression.includes('Claim Reported')) progression.push('Claim Reported');
          break;
        case 'CLAIM_APPROVED':
          if (state) state.status = 'Claim Approved';
          if (!progression.includes('Claim Approved')) progression.push('Claim Approved');
          break;
      }
      
      steps.push({
        event,
        resultingState: state ? { ...state } : null
      });
    });

  // FINAL SAFETY: If we have events but no state was reconstructed (e.g. filter excluded everything)
  if (!state && sortedEvents.length > 0) {
      state = { ...sortedEvents[0].payload };
  }

  return { state, steps, progression };
}
