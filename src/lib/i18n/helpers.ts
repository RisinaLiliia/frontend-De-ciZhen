// src/lib/i18n/helpers.ts
import type { Locale } from "./t";

export type I18nMap = Partial<Record<Locale, string>> & Record<string, string>;

export function pickI18n(map: I18nMap, locale: Locale, fallbackLocale: Locale = "de"): string {
  return map[locale] ?? map[fallbackLocale] ?? "";
}
