// src/components/ui/LanguageToggle.tsx
'use client';

import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { IconButton } from '@/components/ui/IconButton';
import { IconGlobe } from '@/components/ui/icons/icons';

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  const t = useT();
  const next = locale === 'de' ? 'en' : 'de';

  return (
    <IconButton label={t(I18N_KEYS.auth.languageLabel)} onClick={() => setLocale(next)} className="h-9 w-9">
      <IconGlobe />
    </IconButton>
  );
}
