// src/components/ui/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useT } from "@/lib/i18n/useT";
import { I18N_KEYS } from "@/lib/i18n/keys";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useT();
  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="h-9 px-3 rounded-md border text-sm"
      onClick={() => setTheme(next)}
      aria-label={t(I18N_KEYS.common.themeLabel)}
    >
      {resolvedTheme === "dark"
        ? t(I18N_KEYS.common.themeDark)
        : t(I18N_KEYS.common.themeLight)}
    </button>
  );
}
