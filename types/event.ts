export type EventType = 'POLICY_CREATED' | 'POLICY_QUOTED' | 'POLICY_BOUND' | 'POLICY_ENDORSED' | 'POLICY_CANCELLED' | 'CLAIM_REPORTED' | 'CLAIM_APPROVED' | 'POLICY_LOCKED' | 'POLICY_UNLOCKED' | 'FRAUD_FLAG_CLEARED';

export interface ReplayEvent {
  id: string;
  type: EventType;
  payload?: any;
  timestamp: string;
  reasoning?: string;
}
