// src/components/ui/LanguageToggle.tsx
"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  const next = locale === "de" ? "en" : "de";

  return (
    <button
      type="button"
      className="h-9 px-3 rounded-md border text-sm"
      onClick={() => setLocale(next)}
    >
      {locale.toUpperCase()}
    </button>
  );
}
