import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Policy } from "@/types/policy";
import { ReplayEvent } from "@/types/event";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../data");
const storeFilePath = path.join(dataDir, "store.json");

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

interface StoreShape {
  policy: Policy;
  events: ReplayEvent[];
}

function ensureDataFile<T>(filePath: string, defaultData: T): T {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf-8");
    return defaultData;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (error) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf-8");
    return defaultData;
  }
}

const defaultStore: StoreShape = {
  policy: initialPolicy,
  events: [initialEvent],
};

export const store = ensureDataFile<StoreShape>(storeFilePath, defaultStore);

export function saveStore() {
  fs.writeFileSync(storeFilePath, JSON.stringify(store, null, 2), "utf-8");
}

export function resetStore() {
  store.policy = { ...initialPolicy };
  store.events = [{ ...initialEvent, timestamp: new Date().toISOString() }];
  saveStore();
  return store;
}
