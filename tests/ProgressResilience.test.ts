import { describe, expect, it } from 'vitest';
import type { RestorationTaskDefinition } from '../src/data/restorationTasks';
import {
  ProgressStore,
  type ProgressStorage,
} from '../src/engine/ProgressStore';

class MemoryStorage implements ProgressStorage {
  readonly values = new Map<string, string>();

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

const tasks: RestorationTaskDefinition[] = [{
  id: 'hall-1',
  roomId: 'hall',
  title: 'First',
  description: 'First task',
  starCost: 1,
  order: 1,
}];

describe('ProgressStore resilience', () => {
  it('backs up malformed state and starts safely instead of crashing repeatedly', () => {
    const storage = new MemoryStorage();
    storage.setItem('ravenManorStateV4', '{broken');

    const store = new ProgressStore(tasks, storage);

    expect(store.state.completed).toEqual({});
    expect(store.recoveryNotice).toContain('Повреждённое сохранение');
    expect(storage.getItem('ravenManorCorruptSaveBackupV1')).toBe('{broken');
    expect(storage.getItem('ravenManorStateV4')).not.toBe('{broken');
  });

  it('exports and imports a versioned save envelope', () => {
    const source = new ProgressStore(tasks, new MemoryStorage());
    source.saveLevel(1, 3);
    source.completeRestorationTask('hall-1');
    source.markStoryViewed(1);

    const target = new ProgressStore(tasks, new MemoryStorage());
    target.importData(JSON.stringify(source.exportData('test-version')));

    expect(target.state.stars[1]).toBe(3);
    expect(target.state.completedRestorationTasks['hall-1']).toBe(true);
    expect(target.isStoryViewed(1)).toBe(true);
    expect(target.availableStars).toBe(2);
  });

  it('rejects unrelated JSON instead of silently replacing progress', () => {
    const store = new ProgressStore(tasks, new MemoryStorage());
    expect(() => store.importData('{"hello":"world"}')).toThrow(/не похож/);
  });
});
