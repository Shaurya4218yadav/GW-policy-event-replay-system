import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');
const storeFilePath = path.join(dataDir, 'external-events.json');

interface ExternalEvent {
  id: string;
  entity: string;
  eventType: string;
  timestamp: string;
  receivedAt: string;
  source: string;
  payload?: Record<string, unknown>;
}

interface ExternalStore {
  events: ExternalEvent[];
  stats: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByEntity: Record<string, number>;
    lastEventTimestamp: string | null;
  };
}

const initialStore: ExternalStore = {
  events: [],
  stats: {
    totalEvents: 0,
    eventsByType: {},
    eventsByEntity: {},
    lastEventTimestamp: null,
  },
};

function ensureDataFile<T>(filePath: string, initialData: T): T {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

export const externalStore = ensureDataFile<ExternalStore>(storeFilePath, initialStore);

export function saveExternalStore() {
  fs.writeFileSync(storeFilePath, JSON.stringify(externalStore, null, 2), 'utf-8');
}

export function resetExternalStore() {
  externalStore.events = [];
  externalStore.stats = {
    totalEvents: 0,
    eventsByType: {},
    eventsByEntity: {},
    lastEventTimestamp: null,
  };
  saveExternalStore();
  return externalStore;
}
