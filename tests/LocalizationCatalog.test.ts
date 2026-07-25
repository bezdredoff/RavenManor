import { describe, expect, it } from 'vitest';
import { CONTENT_TRANSLATIONS } from '../src/localization/contentTranslations';
import { STORY_TRANSLATIONS } from '../src/localization/storyTranslations';
import { UI_TRANSLATIONS } from '../src/localization/uiTranslations';

const catalog = [...UI_TRANSLATIONS, ...CONTENT_TRANSLATIONS, ...STORY_TRANSLATIONS];

describe('localization catalog quality', () => {
  it('contains a complete multilingual first-chapter catalog', () => {
    expect(catalog.length).toBeGreaterThan(450);
    for (const entry of catalog) {
      expect(entry.ru.trim().length).toBeGreaterThan(0);
      expect(entry.en.trim().length).toBeGreaterThan(0);
      expect(entry.be.trim().length).toBeGreaterThan(0);
      expect(entry.en).not.toMatch(/[А-Яа-яЁёІіЎў]/);
    }
  });

  it('does not assign conflicting translations to the same Russian source', () => {
    const known = new Map<string, { en: string; be: string }>();
    for (const entry of catalog) {
      const previous = known.get(entry.ru);
      if (previous) {
        expect(entry.en).toBe(previous.en);
        expect(entry.be).toBe(previous.be);
      } else {
        known.set(entry.ru, { en: entry.en, be: entry.be });
      }
    }
  });
});
