// src/lib/i18n/I18nProvider.tsx
"use client";

import * as React from "react";
import { getCurrentLocale, setCurrentLocale, type Locale } from "./t";

type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
};

const I18nContext = React.createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = "app.locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState<Locale>(getCurrentLocale());

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "de" || stored === "en") {
      setLocale(stored);
      return;
    }

    const browserLocale = navigator.language.toLowerCase();
    if (browserLocale.startsWith("de")) {
      setLocale("de");
    } else if (browserLocale.startsWith("en")) {
      setLocale("en");
    }
  }, []);

  React.useEffect(() => {
    setCurrentLocale(locale);
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const value = React.useMemo<I18nContextValue>(() => ({ locale, setLocale }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
