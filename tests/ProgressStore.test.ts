import { describe, expect, it } from 'vitest';
import type { RestorationTaskDefinition } from '../src/data/restorationTasks';
import {
  ProgressStore,
  type ProgressStorage,
} from '../src/engine/ProgressStore';

class MemoryStorage implements ProgressStorage {
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

const tasks: RestorationTaskDefinition[] = [
  {
    id: 'hall-1',
    roomId: 'hall',
    title: 'First',
    description: 'First task',
    starCost: 1,
    order: 1,
  },
];

describe('ProgressStore', () => {
  it('awards only the improvement over the previous best result', () => {
    const store = new ProgressStore(tasks, new MemoryStorage());

    expect(store.saveLevel(1, 1)).toBe(1);
    expect(store.saveLevel(1, 3)).toBe(2);
    expect(store.saveLevel(1, 2)).toBe(0);
    expect(store.state.stars[1]).toBe(3);
    expect(store.earnedStars).toBe(3);
    expect(store.availableStars).toBe(3);
  });

  it('spends a restoration cost once and persists the explicit balance', () => {
    const storage = new MemoryStorage();
    const store = new ProgressStore(tasks, storage);

    store.saveLevel(1, 3);
    expect(store.completeRestorationTask('hall-1')).toBe(true);
    expect(store.completeRestorationTask('hall-1')).toBe(false);
    expect(store.spentStars).toBe(1);
    expect(store.availableStars).toBe(2);

    const reloaded = new ProgressStore(tasks, storage);
    expect(reloaded.state.completedRestorationTasks['hall-1']).toBe(true);
    expect(reloaded.state.starBalance).toEqual({
      earned: 3,
      spent: 1,
      available: 2,
    });
  });

  it('persists tutorial choices and tutorial progress', () => {
    const storage = new MemoryStorage();
    const store = new ProgressStore(tasks, storage);

    store.startTutorial();
    store.advanceTutorial();

    const reloaded = new ProgressStore(tasks, storage);
    expect(reloaded.state.tutorial).toEqual({ preference: 'enabled', step: 1 });

    reloaded.advanceTutorial();
    expect(reloaded.state.tutorial).toEqual({ preference: 'completed', step: 2 });
  });

  it('lets the player skip and later restart the tutorial', () => {
    const store = new ProgressStore(tasks, new MemoryStorage());

    store.skipTutorial();
    expect(store.state.tutorial.preference).toBe('skipped');

    store.restartTutorial();
    expect(store.state.tutorial).toEqual({ preference: 'enabled', step: 0 });
  });

  it('migrates a V3 save and does not interrupt a player with existing progress', () => {
    const storage = new MemoryStorage();
    storage.setItem('ravenManorStateV3', JSON.stringify({
      stars: { 1: 3 },
      completed: { 1: true },
      completedRestorationTasks: { 'hall-1': true },
      starBalance: { earned: 3, spent: 1, available: 2 },
      storyStep: 2,
    }));

    const migrated = new ProgressStore(tasks, storage);

    expect(migrated.state.starBalance).toEqual({
      earned: 3,
      spent: 1,
      available: 2,
    });
    expect(migrated.state.tutorial).toEqual({ preference: 'skipped', step: 2 });
    expect(storage.getItem('ravenManorStateV4')).not.toBeNull();
  });

  it('keeps the tutorial undecided when migrating an untouched V3 save', () => {
    const storage = new MemoryStorage();
    storage.setItem('ravenManorStateV3', JSON.stringify({
      stars: {},
      completed: {},
      completedRestorationTasks: {},
      starBalance: { earned: 0, spent: 0, available: 0 },
      storyStep: 0,
    }));

    const migrated = new ProgressStore(tasks, storage);
    expect(migrated.state.tutorial).toEqual({ preference: 'undecided', step: 0 });
  });
});
