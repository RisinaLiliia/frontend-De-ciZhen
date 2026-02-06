// src/components/ui/LanguageToggle.tsx
"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { IconButton } from "@/components/ui/IconButton";
import { IconGlobe } from "@/components/ui/icons/icons";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  const next = locale === "de" ? "en" : "de";

  return (
    <IconButton label="Language" onClick={() => setLocale(next)} className="h-9 w-9">
      <IconGlobe />
    </IconButton>
  );
}
