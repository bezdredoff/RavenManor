import { describe, expect, it } from 'vitest';
import { LocalizationManager } from '../src/localization/Localization';
import type { StorageLike } from '../src/platform/SafeStorage';

class TestStorage implements StorageLike {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

describe('level result localization', () => {
  it('translates the completed-level heading into English and Belarusian', () => {
    const manager = new LocalizationManager(new TestStorage());

    manager.setLocale('en');
    expect(manager.translate('Уровень пройден')).toBe('Level complete');

    manager.setLocale('be');
    expect(manager.translate('Уровень пройден')).toBe('Узровень пройдзены');
  });
});
