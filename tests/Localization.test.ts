import { describe, expect, it } from 'vitest';
import { levels, rooms } from '../src/data/gameData';
import { restorationTasks } from '../src/data/restorationTasks';
import { storyScenes } from '../src/data/storyScenes';
import {
  LocalizationManager,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
  type AppLocale,
} from '../src/localization/Localization';
import type { StorageLike } from '../src/platform/SafeStorage';

class TestStorage implements StorageLike {
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

const translated = (locale: AppLocale): LocalizationManager => {
  const manager = new LocalizationManager(new TestStorage());
  manager.setLocale(locale);
  return manager;
};

describe('application localization', () => {
  it('uses Russian as the safe default and persists an explicit choice', () => {
    const storage = new TestStorage();
    storage.setItem(LOCALE_STORAGE_KEY, 'invalid');
    const manager = new LocalizationManager(storage);
    expect(manager.locale).toBe('ru');
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('be')).toBe('be');

    manager.setLocale('en');
    expect(storage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
    expect(new LocalizationManager(storage).locale).toBe('en');
  });

  it('translates interface fragments and dynamic messages', () => {
    const english = translated('en');
    const belarusian = translated('be');

    expect(english.translate('Настройки')).toBe('Settings');
    expect(belarusian.translate('Настройки')).toBe('Налады');
    expect(english.translate('Доступно звёзд: 4. Показать подробный баланс'))
      .toBe('Available stars: 4. Show detailed balance');
    expect(english.translate('Найдена версия 0.8.1. Перезапускаю приложение…'))
      .toContain('Restarting the app');
  });

  it('contains English and Belarusian content for the full first chapter', () => {
    for (const locale of ['en', 'be'] as const) {
      const manager = translated(locale);
      for (const level of levels) expect(manager.translate(level.title)).not.toBe(level.title);
      for (const room of rooms) {
        expect(manager.translate(room.title)).not.toBe(room.title);
        expect(manager.translate(room.description)).not.toBe(room.description);
      }
      for (const task of restorationTasks) {
        expect(manager.translate(task.title)).not.toBe(task.title);
        expect(manager.translate(task.description)).not.toBe(task.description);
      }
      for (const scene of storyScenes) {
        expect(manager.translate(scene.title)).not.toBe(scene.title);
        expect(manager.translate(scene.summary)).not.toBe(scene.summary);
        for (const beat of scene.beats) expect(manager.translate(beat.text)).not.toBe(beat.text);
      }
    }
  });
});
