/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GUIDEWIRE ENTITY MAPPING LAYER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Maps internal event types to their corresponding Guidewire InsuranceSuite
 * entity paths. This enables:
 *
 * 1. Audit trail correlation with Guidewire system logs
 * 2. Cross-system event reconciliation
 * 3. Regulatory reporting with Guidewire-standard entity references
 *
 * Mapping Table:
 * ┌──────────────────────┬─────────────────────────────────────────────┐
 * │ Internal Event       │ Guidewire Entity                            │
 * ├──────────────────────┼─────────────────────────────────────────────┤
 * │ POLICY_CREATED       │ PolicyCenter.PolicyPeriod                   │
 * │ POLICY_QUOTED        │ PolicyCenter.Quote                          │
 * │ POLICY_BOUND         │ PolicyCenter.Bind                           │
 * │ POLICY_ENDORSED      │ PolicyCenter.Endorsement                    │
 * │ POLICY_CANCELLED     │ PolicyCenter.Cancellation                   │
 * │ POLICY_REINSTATED    │ PolicyCenter.Reinstatement                  │
 * │ CLAIM_REPORTED       │ ClaimCenter.Claim                           │
 * │ CLAIM_APPROVED       │ ClaimCenter.ClaimApproval                   │
 * └──────────────────────┴─────────────────────────────────────────────┘
 *
 * DETERMINISM: Pure lookup table. Same event type → same entity.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { EventType, ReplayEvent } from '@/types/event';

// ── Guidewire Entity Mapping ─────────────────────────────────────────────
const GUIDEWIRE_ENTITY_MAP: Record<EventType, string> = {
  POLICY_CREATED:   'PolicyCenter.PolicyPeriod',
  POLICY_QUOTED:    'PolicyCenter.Quote',
  POLICY_BOUND:     'PolicyCenter.Bind',
  POLICY_ENDORSED:  'PolicyCenter.Endorsement',
  POLICY_CANCELLED: 'PolicyCenter.Cancellation',
  POLICY_REINSTATED: 'PolicyCenter.Reinstatement',
  CLAIM_REPORTED:   'ClaimCenter.Claim',
  CLAIM_APPROVED:   'ClaimCenter.ClaimApproval',
};

/**
 * Returns the Guidewire entity path for a given event type.
 *
 * @param eventType - Internal event type
 * @returns Guidewire entity string (e.g., "PolicyCenter.PolicyPeriod")
 */
export function getGuidewireEntity(eventType: EventType): string {
  return GUIDEWIRE_ENTITY_MAP[eventType] || `Unknown.${eventType}`;
}

/**
 * Enriches a ReplayEvent with its Guidewire entity mapping.
 * Returns a new event object — does NOT mutate the input.
 *
 * @param event - The event to enrich
 * @returns New event with guidewireEntity populated
 */
export function enrichWithGuidewireEntity(event: ReplayEvent): ReplayEvent {
  return {
    ...event,
    guidewireEntity: getGuidewireEntity(event.type),
  };
}

/**
 * Enriches an array of events with Guidewire entity mappings.
 * Returns new array — does NOT mutate inputs.
 *
 * @param events - Events to enrich
 * @returns New array of enriched events
 */
export function enrichEventsWithGuidewire(events: ReplayEvent[]): ReplayEvent[] {
  return events.map(enrichWithGuidewireEntity);
}
