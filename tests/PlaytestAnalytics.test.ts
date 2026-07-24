import { describe, expect, it } from 'vitest';
import {
  PlaytestAnalytics,
  type AnalyticsStorage,
} from '../src/analytics/PlaytestAnalytics';

class MemoryStorage implements AnalyticsStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('PlaytestAnalytics', () => {
  it('records level attempts, moves, hints, outcomes, and duration', () => {
    let now = 1_000;
    const analytics = new PlaytestAnalytics(new MemoryStorage(), { now: () => now });

    analytics.startLevel(3);
    analytics.recordMove(true);
    analytics.recordMove(false);
    analytics.recordHint();
    now = 6_000;
    analytics.finishLevel('win', 2, 5);

    expect(analytics.exportData().levels[3]).toMatchObject({
      attempts: 1,
      wins: 1,
      losses: 0,
      hints: 1,
      validMoves: 1,
      invalidMoves: 1,
      totalDurationMs: 5_000,
      bestStars: 2,
      lastOutcome: 'win',
    });
  });

  it('marks an unfinished attempt as abandoned when leaving gameplay', () => {
    let now = 10;
    const analytics = new PlaytestAnalytics(new MemoryStorage(), { now: () => now });
    analytics.startLevel(1);
    now = 510;
    analytics.recordScreen('levels');

    const events = analytics.exportData().events;
    expect(events.some((event) => event.type === 'level_abandoned')).toBe(true);
  });

  it('persists data locally and clears it without touching game progress', () => {
    const storage = new MemoryStorage();
    const first = new PlaytestAnalytics(storage, { now: () => 1_000 });
    first.startLevel(2);
    first.finishLevel('loss', 0, 0);

    const reloaded = new PlaytestAnalytics(storage, { now: () => 2_000 });
    expect(reloaded.getSummary().losses).toBe(1);

    reloaded.reset();
    expect(reloaded.getSummary()).toMatchObject({ attempts: 0, wins: 0, losses: 0, hints: 0 });
  });
});
