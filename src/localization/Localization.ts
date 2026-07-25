import { getSafeStorage, type StorageLike } from '../platform/SafeStorage';
import { CONTENT_TRANSLATIONS } from './contentTranslations';
import { STORY_TRANSLATIONS } from './storyTranslations';
import { UI_TRANSLATIONS } from './uiTranslations';

export const SUPPORTED_LOCALES = ['ru', 'en', 'be'] as const;
export type AppLocale = typeof SUPPORTED_LOCALES[number];

export type TranslationEntry = Readonly<{
  ru: string;
  en: string;
  be: string;
}>;

export const LOCALE_STORAGE_KEY = 'ravenManorLocaleV1';

export const LOCALE_OPTIONS: readonly Readonly<{
  code: AppLocale;
  nativeName: string;
}>[] = [
  { code: 'ru', nativeName: 'Русский' },
  { code: 'en', nativeName: 'English' },
  { code: 'be', nativeName: 'Беларуская' },
];

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && SUPPORTED_LOCALES.includes(value as AppLocale);
}

export function normalizeLocale(value: unknown): AppLocale {
  return isAppLocale(value) ? value : 'ru';
}

const entries: readonly TranslationEntry[] = [
  ...UI_TRANSLATIONS,
  ...CONTENT_TRANSLATIONS,
  ...STORY_TRANSLATIONS,
];

function createLocaleMap(locale: Exclude<AppLocale, 'ru'>): ReadonlyMap<string, string> {
  return new Map(entries.map((entry) => [entry.ru, entry[locale]]));
}

const EN_TRANSLATIONS = createLocaleMap('en');
const BE_TRANSLATIONS = createLocaleMap('be');

const replaceableEntries = [...entries]
  .filter((entry) => entry.ru.length >= 3)
  .sort((left, right) => right.ru.length - left.ru.length);

export class LocalizationManager {
  private currentLocale: AppLocale;

  constructor(private readonly storage: StorageLike = getSafeStorage()) {
    this.currentLocale = this.load();
    this.applyDocumentLanguage();
  }

  get locale(): AppLocale {
    return this.currentLocale;
  }

  setLocale(locale: AppLocale): void {
    this.currentLocale = normalizeLocale(locale);
    try {
      this.storage.setItem(LOCALE_STORAGE_KEY, this.currentLocale);
    } catch {
      // Language preference is non-critical and can remain in memory.
    }
    this.applyDocumentLanguage();
  }

  translate(value: string): string {
    if (this.currentLocale === 'ru' || value.length === 0) return value;
    const translations = this.currentLocale === 'en' ? EN_TRANSLATIONS : BE_TRANSLATIONS;
    const exact = translations.get(value);
    if (exact !== undefined) return exact;

    let result = value;
    for (const entry of replaceableEntries) {
      if (!result.includes(entry.ru)) continue;
      result = result.split(entry.ru).join(entry[this.currentLocale]);
    }
    return result;
  }

  translateElement(root: ParentNode): void {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

    for (const node of textNodes) {
      if (node.parentElement?.closest('[data-no-translate]')) continue;
      const original = node.nodeValue ?? '';
      const leading = original.match(/^\s*/)?.[0] ?? '';
      const trailing = original.match(/\s*$/)?.[0] ?? '';
      const core = original.slice(leading.length, original.length - trailing.length);
      if (!core) continue;
      node.nodeValue = `${leading}${this.translate(core)}${trailing}`;
    }

    root.querySelectorAll<HTMLElement>('[aria-label], [title], [placeholder]').forEach((element) => {
      if (element.closest('[data-no-translate]')) return;
      for (const attribute of ['aria-label', 'title', 'placeholder'] as const) {
        const value = element.getAttribute(attribute);
        if (value) element.setAttribute(attribute, this.translate(value));
      }
    });
  }

  private load(): AppLocale {
    try {
      return normalizeLocale(this.storage.getItem(LOCALE_STORAGE_KEY));
    } catch {
      return 'ru';
    }
  }

  private applyDocumentLanguage(): void {
    if (typeof document !== 'undefined') document.documentElement.lang = this.currentLocale;
  }
}
