import { describe, expect, it } from 'vitest';
import type { RestorationTaskDefinition } from '../src/data/restorationTasks';
import { ProgressStore, type ProgressStorage } from '../src/engine/ProgressStore';

class MemoryStorage implements ProgressStorage {
  readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

const tasks: RestorationTaskDefinition[] = [{
  id: 'hall-clear',
  roomId: 'hall',
  title: 'Clear',
  description: 'Clear debris',
  starCost: 1,
  order: 1,
  rewards: [{ kind: 'hammer', amount: 2 }],
  unlocks: [{
    type: 'booster',
    booster: 'hammer',
    title: 'Hammer',
    description: 'Unlock hammer',
  }],
}];

describe('booster inventory', () => {
  it('awards restoration boosters once and persists consumption', () => {
    const storage = new MemoryStorage();
    const store = new ProgressStore(tasks, storage);
    store.saveLevel(1, 3);

    expect(store.completeRestorationTask('hall-clear')).toBe(true);
    expect(store.getBoosterCount('hammer')).toBe(2);
    expect(store.completeRestorationTask('hall-clear')).toBe(false);
    expect(store.getBoosterCount('hammer')).toBe(2);

    expect(store.useBooster('hammer')).toBe(true);
    expect(store.getBoosterCount('hammer')).toBe(1);
    expect(new ProgressStore(tasks, storage).getBoosterCount('hammer')).toBe(1);
  });

  it('does not spend an unavailable booster', () => {
    const store = new ProgressStore(tasks, new MemoryStorage());
    expect(store.useBooster('shuffle')).toBe(false);
    expect(store.getBoosterCount('shuffle')).toBe(0);
  });

  it('retroactively grants rewards when migrating a save without booster data', () => {
    const storage = new MemoryStorage();
    storage.setItem('ravenManorStateV4', JSON.stringify({
      stars: { 1: 3 },
      completed: { 1: true },
      completedRestorationTasks: { 'hall-clear': true },
      starBalance: { earned: 3, spent: 1, available: 2 },
      tutorial: { preference: 'skipped', step: 2 },
      storyStep: 0,
      viewedStoryScenes: {},
    }));

    const store = new ProgressStore(tasks, storage);
    expect(store.getBoosterCount('hammer')).toBe(2);
  });
});
