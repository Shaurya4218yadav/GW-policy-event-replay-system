/**
 * Integration Tests for External Events API
 * These tests validate the API endpoints that Guidewire will use for event streaming
 */

const BASE_URL = 'http://localhost:3000/api/external/events';

describe('External Events API', () => {
  beforeAll(async () => {
    // Reset events before running tests
    await fetch(BASE_URL, { method: 'DELETE' });
  });

  describe('POST /external/events', () => {
    test('should accept valid policy update event', async () => {
      const eventData = {
        entity: 'Policy',
        eventType: 'UPDATE',
        timestamp: new Date().toISOString(),
        entityId: 'POL-001',
        userId: 'test-user',
        changes: {
          premium: { oldValue: 1000, newValue: 1200 },
          status: { oldValue: 'Draft', newValue: 'Active' }
        }
      };

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      expect(response.status).toBe(200);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.eventId).toBeDefined();
      expect(result.message).toContain('Event received');
      expect(result.stats.totalEvents).toBe(1);
      expect(result.stats.eventsByType.UPDATE).toBe(1);
      expect(result.stats.eventsByEntity.Policy).toBe(1);
    });

    test('should accept valid claim event', async () => {
      const eventData = {
        entity: 'Claim',
        eventType: 'CREATE',
        timestamp: new Date().toISOString(),
        entityId: 'CLM-001',
        userId: 'test-user',
        changes: {
          status: { oldValue: null, newValue: 'Open' },
          amount: { oldValue: null, newValue: 5000 }
        }
      };

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      expect(response.status).toBe(200);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.stats.totalEvents).toBe(2);
      expect(result.stats.eventsByType.CREATE).toBe(1);
      expect(result.stats.eventsByEntity.Claim).toBe(1);
    });

    test('should reject event with missing required fields', async () => {
      const invalidEventData = {
        entity: 'Policy',
        // missing eventType and timestamp
        entityId: 'POL-001'
      };

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidEventData)
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toContain('Missing required fields');
    });

    test('should handle multiple events and update statistics', async () => {
      // Send multiple events
      const events = [
        {
          entity: 'Policy',
          eventType: 'ENDORSE',
          timestamp: new Date().toISOString(),
          entityId: 'POL-002',
          changes: { coverageLimit: { oldValue: 50000, newValue: 75000 } }
        },
        {
          entity: 'Claim',
          eventType: 'APPROVE',
          timestamp: new Date().toISOString(),
          entityId: 'CLM-002',
          changes: { status: { oldValue: 'Open', newValue: 'Approved' } }
        }
      ];

      for (const event of events) {
        await fetch(BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
      }

      // Check final statistics
      const statsResponse = await fetch(BASE_URL);
      const statsResult = await statsResponse.json();

      expect(statsResult.stats.totalEvents).toBe(4); // 2 from before + 2 new
      expect(statsResult.stats.eventsByType.ENDORSE).toBe(1);
      expect(statsResult.stats.eventsByType.APPROVE).toBe(1);
    });
  });

  describe('GET /external/events', () => {
    test('should return events and statistics', async () => {
      const response = await fetch(BASE_URL);
      expect(response.status).toBe(200);

      const result = await response.json();

      expect(result).toHaveProperty('events');
      expect(result).toHaveProperty('stats');
      expect(result).toHaveProperty('totalStored');

      expect(Array.isArray(result.events)).toBe(true);
      expect(result.stats).toHaveProperty('totalEvents');
      expect(result.stats).toHaveProperty('eventsByType');
      expect(result.stats).toHaveProperty('eventsByEntity');
    });

    test('should return last 50 events', async () => {
      const response = await fetch(BASE_URL);
      const result = await response.json();

      expect(result.events.length).toBeLessThanOrEqual(50);
    });
  });

  describe('DELETE /external/events', () => {
    test('should reset all events and statistics', async () => {
      const response = await fetch(BASE_URL, { method: 'DELETE' });
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.message).toContain('reset successfully');

      // Verify reset
      const statsResponse = await fetch(BASE_URL);
      const statsResult = await statsResponse.json();

      expect(statsResult.stats.totalEvents).toBe(0);
      expect(Object.keys(statsResult.stats.eventsByType)).toHaveLength(0);
      expect(Object.keys(statsResult.stats.eventsByEntity)).toHaveLength(0);
      expect(statsResult.events).toHaveLength(0);
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete policy lifecycle events', async () => {
      const policyEvents = [
        {
          entity: 'Policy',
          eventType: 'CREATE',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          entityId: 'POL-LIFECYCLE-001',
          changes: { status: { oldValue: null, newValue: 'Draft' } }
        },
        {
          entity: 'Policy',
          eventType: 'UPDATE',
          timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          entityId: 'POL-LIFECYCLE-001',
          changes: { premium: { oldValue: 0, newValue: 1000 } }
        },
        {
          entity: 'Policy',
          eventType: 'ENDORSE',
          timestamp: new Date().toISOString(), // now
          entityId: 'POL-LIFECYCLE-001',
          changes: { coverageLimit: { oldValue: 50000, newValue: 75000 } }
        }
      ];

      // Send all events
      for (const event of policyEvents) {
        await fetch(BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
      }

      // Verify final state
      const response = await fetch(BASE_URL);
      const result = await response.json();

      expect(result.stats.eventsByEntity.Policy).toBe(3);
      expect(result.stats.eventsByType.CREATE).toBe(1);
      expect(result.stats.eventsByType.UPDATE).toBe(1);
      expect(result.stats.eventsByType.ENDORSE).toBe(1);
    });
  });
});