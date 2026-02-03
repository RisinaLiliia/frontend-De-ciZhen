// src/lib/i18n/useT.ts
"use client";

import { useI18n } from "./I18nProvider";
import { t as translate } from "./t";
import type { I18nKey } from "./keys";

export function useT() {
  const { locale } = useI18n();
  return (key: I18nKey) => translate(key, locale);
}
