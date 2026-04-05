import { Policy } from "@/types/policy";
import { ReplayEvent } from "@/types/event";

// Simple in-memory storage for the demo.
// Note: This will reset whenever the Next.js dev server restarts.
const initialPolicy: Policy = {
  id: "POL-001",
  name: "Standard Auto",
  premium: 0,
  coverageLimit: 50000,
  status: "Draft",
};

const initialEvent: ReplayEvent = {
  id: "init-event-001",
  type: "POLICY_CREATED",
  payload: {
    name: "Standard Auto",
    premium: 0,
    coverageLimit: 50000,
    status: "Draft",
  },
  timestamp: new Date().toISOString(),
};

// Use global to handle HMR in development
declare global {
  var globalStore: {
    policy: Policy;
    events: ReplayEvent[];
  } | undefined;
}

if (!global.globalStore) {
  global.globalStore = {
    policy: initialPolicy,
    events: [initialEvent],
  };
}

export const store = global.globalStore;

export function resetStore() {
  global.globalStore = {
    policy: { ...initialPolicy },
    events: [{ ...initialEvent, timestamp: new Date().toISOString() }],
  };
  return global.globalStore;
}
