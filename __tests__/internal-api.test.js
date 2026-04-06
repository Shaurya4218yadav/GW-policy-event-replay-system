/**
 * Internal API tests for the Guidewire event replay system.
 * These validate persistent policy and event updates plus simulation generation.
 */

describe('Internal API Endpoints', () => {
  const baseUrl = 'http://localhost:3000';

  test('should update and retrieve policy from /api/policy', async () => {
    const policyData = {
      id: 'POL-123',
      name: 'Test Policy',
      premium: 1300,
      coverageLimit: 65000,
      status: 'Active',
    };

    const postResponse = await fetch(`${baseUrl}/api/policy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policyData),
    });

    expect(postResponse.status).toBe(200);
    const updatedPolicy = await postResponse.json();
    expect(updatedPolicy.id).toBe(policyData.id);
    expect(updatedPolicy.premium).toBe(policyData.premium);

    const getResponse = await fetch(`${baseUrl}/api/policy`);
    expect(getResponse.status).toBe(200);
    const loadedPolicy = await getResponse.json();
    expect(loadedPolicy.name).toBe('Test Policy');
    expect(loadedPolicy.status).toBe('Active');
  });

  test('should append events and retrieve them from /api/events', async () => {
    const eventPayload = {
      id: 'evt-test-001',
      type: 'POLICY_QUOTED',
      payload: { premium: 2500 },
      timestamp: new Date().toISOString(),
    };

    const postResponse = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });

    expect(postResponse.status).toBe(200);
    const events = await postResponse.json();
    expect(Array.isArray(events)).toBe(true);
    expect(events.some((event) => event.id === eventPayload.id)).toBe(true);

    const getResponse = await fetch(`${baseUrl}/api/events`);
    const storedEvents = await getResponse.json();
    expect(storedEvents.some((event) => event.type === 'POLICY_QUOTED')).toBe(true);
  });

  test('should generate simulation events and persist them via /api/simulation', async () => {
    const response = await fetch(`${baseUrl}/api/simulation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'endorsement', currentPremium: 1000, currentCoverage: 50000 }),
    });

    expect(response.status).toBe(200);
    const generatedEvents = await response.json();
    expect(generatedEvents.length).toBeGreaterThan(0);
    expect(generatedEvents[0]).toHaveProperty('type');

    const eventsResponse = await fetch(`${baseUrl}/api/events`);
    const storedEvents = await eventsResponse.json();
    expect(storedEvents.length).toBeGreaterThanOrEqual(generatedEvents.length);
  });
});