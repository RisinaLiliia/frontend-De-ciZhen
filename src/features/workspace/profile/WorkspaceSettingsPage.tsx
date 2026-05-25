'use client';

import { useTheme } from 'next-themes';

import { ProfilePreferencesCards } from '@/features/profile/ProfilePreferencesCards';
import { useConsent } from '@/lib/consent/ConsentProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export function WorkspaceSettingsPage() {
  const t = useT();
  const { locale, setLocale } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();
  const { choice: consentChoice, openPreferences } = useConsent();

  return (
    <section className="card profile-settings stack-md">
      <header className="profile-settings__header">
        <h2 className="typo-h3">{t(I18N_KEYS.client.profileSettingsTitle)}</h2>
        <p className="typo-small">{t(I18N_KEYS.client.profileSettingsSubtitle)}</p>
      </header>

      <div className="profile-settings__grid">
        <ProfilePreferencesCards
          t={t}
          locale={locale}
          setLocale={setLocale}
          effectiveTheme={resolvedTheme ?? 'light'}
          setTheme={setTheme}
          favoritesTotal={0}
          consentChoice={consentChoice}
          openPreferences={openPreferences}
        />
      </div>
    </section>
  );
}
