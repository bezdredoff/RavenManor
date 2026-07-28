import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  LocalizationManager,
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

const CYRILLIC = /[А-Яа-яЁёІіЎў]/;
const appSource = readFileSync(new URL('../src/ui/GameApp.ts', import.meta.url), 'utf8');

function collectStaticUiLiterals(source: string): string[] {
  const values = new Set<string>();

  for (const match of source.matchAll(/>([^<>{}\n]*[А-Яа-яЁёІіЎў][^<>{}\n]*)</g)) {
    const value = match[1].replace(/\s+/g, ' ').trim();
    if (value) values.add(value);
  }

  for (const match of source.matchAll(/(['"])([^'"\n]*[А-Яа-яЁёІіЎў][^'"\n]*)\1/g)) {
    const value = match[2].replace(/\s+/g, ' ').trim();
    if (!value || value.includes('<') || value.includes('>')) continue;
    values.add(value);
  }

  return [...values];
}

describe('GameApp localization coverage', () => {
  it('does not leave static Russian UI literals in the English interface', () => {
    const english = translated('en');
    const literals = collectStaticUiLiterals(appSource);

    expect(literals.length).toBeGreaterThan(100);
    for (const literal of literals) {
      expect(english.translate(literal), literal).not.toMatch(CYRILLIC);
    }
  });

  it('translates the full result, tutorial, guide, and settings copy', () => {
    const english = translated('en');
    const belarusian = translated('be');
    const phrases = [
      'Звёзды восстанавливают поместье, а ключевые ремонты открывают следующие уровни и механики.',
      'Следующий шаг',
      'В поместье',
      'Ходы закончились',
      'Можно повторить попытку или выбрать другой открытый уровень.',
      'Соберите три или больше одинаковых фишек. Линии из 4–5, формы T/L и квадраты 2×2 создают усиления.',
      'Они появятся прямо над полем и не будут останавливать игру. Обучение всегда можно включить снова в настройках.',
      'Усиление активируется, когда попадает в комбинацию. Поддерживаются также пары: ракета + ракета, ракета + руна, руна + руна и призма + обычная фишка.',
      'Бустеры не тратят ход. Их запасы сохраняются между уровнями и пополняются за задачи восстановления.',
      'Простая готическая тема в ре миноре и короткие игровые сигналы. Браузер включает звук после первого касания.',
    ];

    for (const phrase of phrases) {
      expect(english.translate(phrase), phrase).not.toBe(phrase);
      expect(english.translate(phrase), phrase).not.toMatch(CYRILLIC);
      expect(belarusian.translate(phrase), phrase).not.toBe(phrase);
    }
  });

  it('translates the dynamic level-card balance line without mixed language', () => {
    const english = translated('en');
    const belarusian = translated('be');

    expect(english.translate('24 ходов · 3★ при 5+ оставшихся'))
      .toBe('24 moves · 3★ with 5+ remaining');
    expect(belarusian.translate('24 ходов · 3★ при 5+ оставшихся'))
      .toBe('24 хадоў · 3★ пры 5+ засталося');
  });
});
