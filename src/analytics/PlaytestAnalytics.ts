import { getSafeStorage } from '../platform/SafeStorage';
export type PlaytestOutcome = 'win' | 'loss';

export type PlaytestEvent = Readonly<{
  timestamp: string;
  type: string;
  data?: Readonly<Record<string, string | number | boolean | null>>;
}>;

export type LevelPlaytestStats = {
  attempts: number;
  wins: number;
  losses: number;
  hints: number;
  validMoves: number;
  invalidMoves: number;
  totalDurationMs: number;
  bestStars: number;
  lastOutcome?: PlaytestOutcome;
};

export type PlaytestAnalyticsState = {
  schemaVersion: 1;
  installId: string;
  createdAt: string;
  updatedAt: string;
  sessions: number;
  events: PlaytestEvent[];
  levels: Record<number, LevelPlaytestStats>;
};

export type AnalyticsStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type AnalyticsClock = Readonly<{ now: () => number }>;

const STORAGE_KEY = 'ravenManorPlaytestAnalyticsV1';
const MAX_EVENTS = 400;

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `rm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const emptyLevelStats = (): LevelPlaytestStats => ({
  attempts: 0,
  wins: 0,
  losses: 0,
  hints: 0,
  validMoves: 0,
  invalidMoves: 0,
  totalDurationMs: 0,
  bestStars: 0,
});

export class PlaytestAnalytics {
  private state: PlaytestAnalyticsState;
  private activeAttempt: { levelId: number; startedAt: number } | null = null;

  constructor(
    private readonly storage: AnalyticsStorage = getSafeStorage(),
    private readonly clock: AnalyticsClock = { now: () => Date.now() },
  ) {
    this.state = this.load();
    this.state.sessions += 1;
    this.record('session_started');
  }

  startLevel(levelId: number): void {
    if (this.activeAttempt) {
      const previous = this.activeAttempt;
      this.activeAttempt = null;
      this.record('level_abandoned', {
        levelId: previous.levelId,
        durationMs: Math.max(0, this.clock.now() - previous.startedAt),
        destination: 'restart-or-next-level',
      });
    }
    const stats = this.getLevelStats(levelId);
    stats.attempts += 1;
    this.activeAttempt = { levelId, startedAt: this.clock.now() };
    this.record('level_started', { levelId, attempt: stats.attempts });
  }

  recordMove(valid: boolean): void {
    if (!this.activeAttempt) return;
    const stats = this.getLevelStats(this.activeAttempt.levelId);
    if (valid) stats.validMoves += 1;
    else stats.invalidMoves += 1;
    this.record(valid ? 'valid_move' : 'invalid_move', { levelId: this.activeAttempt.levelId });
  }

  recordHint(): void {
    if (!this.activeAttempt) return;
    const stats = this.getLevelStats(this.activeAttempt.levelId);
    stats.hints += 1;
    this.record('hint_used', { levelId: this.activeAttempt.levelId });
  }

  finishLevel(outcome: PlaytestOutcome, stars: number, movesLeft: number): void {
    if (!this.activeAttempt) return;
    const { levelId, startedAt } = this.activeAttempt;
    const stats = this.getLevelStats(levelId);
    const durationMs = Math.max(0, this.clock.now() - startedAt);
    stats.totalDurationMs += durationMs;
    stats.lastOutcome = outcome;
    if (outcome === 'win') stats.wins += 1;
    else stats.losses += 1;
    stats.bestStars = Math.max(stats.bestStars, stars);
    this.activeAttempt = null;
    this.record(`level_${outcome}`, { levelId, stars, movesLeft, durationMs });
  }

  recordScreen(screen: string): void {
    if (screen !== 'game' && this.activeAttempt) {
      const { levelId, startedAt } = this.activeAttempt;
      const durationMs = Math.max(0, this.clock.now() - startedAt);
      this.activeAttempt = null;
      this.record('level_abandoned', { levelId, durationMs, destination: screen });
    }
    this.record('screen_viewed', { screen });
  }

  recordRestoration(taskId: string, roomId: string): void {
    this.record('restoration_completed', { taskId, roomId });
  }

  recordStory(levelId: number): void {
    this.record('story_viewed', { levelId });
  }

  recordAction(type: string, data?: PlaytestEvent['data']): void {
    this.record(type, data);
  }

  getSummary(): Readonly<{
    sessions: number;
    attempts: number;
    wins: number;
    losses: number;
    hints: number;
  }> {
    const levels = Object.values(this.state.levels);
    return {
      sessions: this.state.sessions,
      attempts: levels.reduce((sum, level) => sum + level.attempts, 0),
      wins: levels.reduce((sum, level) => sum + level.wins, 0),
      losses: levels.reduce((sum, level) => sum + level.losses, 0),
      hints: levels.reduce((sum, level) => sum + level.hints, 0),
    };
  }

  exportData(): PlaytestAnalyticsState {
    return JSON.parse(JSON.stringify(this.state)) as PlaytestAnalyticsState;
  }

  reset(): void {
    const now = new Date(this.clock.now()).toISOString();
    this.state = {
      schemaVersion: 1,
      installId: createId(),
      createdAt: now,
      updatedAt: now,
      sessions: 1,
      events: [],
      levels: {},
    };
    this.activeAttempt = null;
    this.record('analytics_reset');
  }

  private getLevelStats(levelId: number): LevelPlaytestStats {
    const existing = this.state.levels[levelId];
    if (existing) return existing;
    const created = emptyLevelStats();
    this.state.levels[levelId] = created;
    return created;
  }

  private record(type: string, data?: PlaytestEvent['data']): void {
    const timestamp = new Date(this.clock.now()).toISOString();
    this.state.updatedAt = timestamp;
    this.state.events.push({ timestamp, type, data });
    this.state.events = this.state.events.slice(-MAX_EVENTS);
    this.persist();
  }

  private load(): PlaytestAnalyticsState {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<PlaytestAnalyticsState>;
        if (parsed.schemaVersion === 1 && parsed.installId && parsed.levels && parsed.events) {
          return {
            schemaVersion: 1,
            installId: parsed.installId,
            createdAt: parsed.createdAt ?? new Date(this.clock.now()).toISOString(),
            updatedAt: parsed.updatedAt ?? new Date(this.clock.now()).toISOString(),
            sessions: Number.isFinite(parsed.sessions) ? Number(parsed.sessions) : 0,
            events: Array.isArray(parsed.events) ? parsed.events.slice(-MAX_EVENTS) : [],
            levels: parsed.levels,
          };
        }
      } catch {
        // Invalid analytics are disposable and do not affect game progress.
      }
    }
    const now = new Date(this.clock.now()).toISOString();
    return {
      schemaVersion: 1,
      installId: createId(),
      createdAt: now,
      updatedAt: now,
      sessions: 0,
      events: [],
      levels: {},
    };
  }

  private persist(): void {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Analytics must never interrupt gameplay.
    }
  }
}
