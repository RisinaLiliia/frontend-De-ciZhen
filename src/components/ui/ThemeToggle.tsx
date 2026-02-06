// src/components/ui/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useT } from "@/lib/i18n/useT";
import { I18N_KEYS } from "@/lib/i18n/keys";
import { IconButton } from "@/components/ui/IconButton";
import { IconMoon, IconSun } from "@/components/ui/icons/icons";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useT();
  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <IconButton
      label={t(I18N_KEYS.common.themeLabel)}
      onClick={() => setTheme(next)}
      className="h-9 w-9"
    >
      {resolvedTheme === "dark" ? <IconMoon /> : <IconSun />}
    </IconButton>
  );
}
