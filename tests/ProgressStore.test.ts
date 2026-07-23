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

describe('ProgressStore star economy', () => {
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

  it('migrates the previous V2 save into the explicit V3 wallet', () => {
    const storage = new MemoryStorage();
    storage.setItem('ravenManorStateV2', JSON.stringify({
      stars: { 1: 3 },
      completed: { 1: true },
      completedRestorationTasks: { 'hall-1': true },
      storyStep: 2,
    }));

    const migrated = new ProgressStore(tasks, storage);

    expect(migrated.state.starBalance).toEqual({
      earned: 3,
      spent: 1,
      available: 2,
    });
    expect(storage.getItem('ravenManorStateV3')).not.toBeNull();
  });
});
