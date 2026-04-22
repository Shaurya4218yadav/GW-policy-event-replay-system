import { ReplayEvent } from '@/types/event';

export type FraudSeverity = 'LOW' | 'MEDIUM' | 'CRITICAL';

export interface FraudFlag {
  id: string;
  severity: FraudSeverity;
  reason: string;
  eventId: string;
  timestamp: string;
}

export function detectFraud(events: ReplayEvent[]): { flags: FraudFlag[], isLocked: boolean } {
  const flags: FraudFlag[] = [];
  const clearedFlags = new Set<string>();
  let forceLocked = false;
  let forceUnlocked = false;
  
  // Pre-process to find cleared flags
  const sorted = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  sorted.forEach(e => {
    if (e.type === 'FRAUD_FLAG_CLEARED' && e.payload?.flagId) {
      clearedFlags.add(e.payload.flagId);
    }
  });

  let currentCoverage = 0;
  
  for (let i = 0; i < sorted.length; i++) {
    const event = sorted[i];
    
    if (event.type === 'POLICY_UNLOCKED') forceUnlocked = true;
    if (event.type === 'POLICY_LOCKED') forceLocked = true;

    if (event.type === 'POLICY_CREATED' || event.type === 'POLICY_ENDORSED') {
      if (event.payload?.coverageLimit) {
        if (currentCoverage > 0 && event.payload.coverageLimit > currentCoverage * 3) {
          const flagId = `F-${event.id}`;
          if (!clearedFlags.has(flagId)) {
            flags.push({
              id: flagId,
              severity: 'CRITICAL',
              reason: 'Suspiciously large coverage limit increase (>300%).',
              eventId: event.id,
              timestamp: event.timestamp
            });
          }
        }
        currentCoverage = Number(event.payload.coverageLimit);
      }
    }
    
    if (event.type === 'CLAIM_REPORTED') {
      const claimAmount = Number(event.payload?.claimAmount || 0);
      
      if (currentCoverage > 0 && claimAmount > currentCoverage * 0.8) {
        const flagId = `F-${event.id}`;
        if (!clearedFlags.has(flagId)) {
          flags.push({
            id: flagId,
            severity: 'CRITICAL',
            reason: 'Claim amount is unusually high (>80% of coverage limit).',
            eventId: event.id,
            timestamp: event.timestamp
          });
        }
      }
      
      const recentEndorsement = sorted.slice(0, i).reverse().find(e => 
        e.type === 'POLICY_ENDORSED' && 
        (new Date(event.timestamp).getTime() - new Date(e.timestamp).getTime()) < 172800000
      );
      
      if (recentEndorsement) {
        const flagId = `F-PUMP-${event.id}`;
        if (!clearedFlags.has(flagId)) {
          flags.push({
            id: flagId,
            severity: 'CRITICAL',
            reason: 'Claim reported shortly after a policy endorsement (Potential Pump-and-Dump).',
            eventId: event.id,
            timestamp: event.timestamp
          });
        }
      }
    }
  }
  
  const isLocked = forceLocked || (flags.length > 0 && !forceUnlocked);
  return { flags, isLocked };
}
