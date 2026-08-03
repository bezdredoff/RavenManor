import { describe, expect, it } from 'vitest';
import { LocalizationManager } from '../src/localization/Localization';
import type { StorageLike } from '../src/platform/SafeStorage';

class TestStorage implements StorageLike {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

describe('FEATURE-066 story control localization', () => {
  it('translates the new story control labels to English and Belarusian', () => {
    const english = new LocalizationManager(new TestStorage());
    english.setLocale('en');
    const belarusian = new LocalizationManager(new TestStorage());
    belarusian.setLocale('be');

    for (const phrase of [
      'История',
      'Авто',
      'Скоро',
      'История диалога пока недоступна',
      'Автоматическое продолжение пока недоступно',
      'Пропустить сцену',
      'Продолжить сцену',
      'Управление сюжетной сценой',
    ]) {
      expect(english.translate(phrase)).not.toBe(phrase);
      expect(belarusian.translate(phrase)).not.toBe(phrase);
    }
  });
});
