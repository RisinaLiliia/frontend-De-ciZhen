// src/lib/i18n/t.ts
import { de, type DeDictionary } from './de';
import { en } from './en';
import type { I18nKey } from './keys';

export type Locale = 'de' | 'en';

type Dictionary = DeDictionary;

const dictionaries: Record<Locale, Dictionary> = {
  de,
  en,
};

let currentLocale: Locale = 'de';

export function setCurrentLocale(locale: Locale) {
  currentLocale = locale;
}

export function getCurrentLocale(): Locale {
  return currentLocale;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function t<K extends I18nKey>(path: K, locale: Locale = currentLocale): string {
  const parts = String(path).split('.');
  let cur: unknown = dictionaries[locale] as Dictionary;

  for (const p of parts) {
    if (!isRecord(cur)) {
      return String(path);
    }
    cur = cur[p];
  }

  return typeof cur === 'string' ? cur : String(path);
}
