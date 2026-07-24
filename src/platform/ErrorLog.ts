import { getSafeStorage } from './SafeStorage';
export type ErrorLogEntry = Readonly<{
  timestamp: string;
  source: 'window-error' | 'unhandled-rejection' | 'application';
  message: string;
  stack?: string;
}>;

export type ErrorLogStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const STORAGE_KEY = 'ravenManorErrorLogV1';
const MAX_ENTRIES = 50;

const safeMessage = (value: unknown): string => {
  if (value instanceof Error) return value.message;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const safeStack = (value: unknown): string | undefined => (
  value instanceof Error && value.stack ? value.stack : undefined
);

export class ErrorLog {
  private entries: ErrorLogEntry[];

  constructor(private readonly storage: ErrorLogStorage = getSafeStorage()) {
    this.entries = this.load();
  }

  record(source: ErrorLogEntry['source'], error: unknown): void {
    this.entries.push({
      timestamp: new Date().toISOString(),
      source,
      message: safeMessage(error),
      stack: safeStack(error),
    });
    this.entries = this.entries.slice(-MAX_ENTRIES);
    this.persist();
  }

  getEntries(): readonly ErrorLogEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
    this.storage.removeItem(STORAGE_KEY);
  }

  private load(): ErrorLogEntry[] {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(-MAX_ENTRIES) : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch {
      // Error logging must never break gameplay when storage is unavailable.
    }
  }
}

export const installGlobalErrorHandlers = (log: ErrorLog): void => {
  window.addEventListener('error', (event) => {
    log.record('window-error', event.error ?? event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    log.record('unhandled-rejection', event.reason);
  });
};
