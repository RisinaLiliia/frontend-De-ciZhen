import type { ConsentChoice } from '@/lib/consent/types';
import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type Translate = (key: I18nKey) => string;

type ProfilePreferencesCardsProps = {
  t: Translate;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  effectiveTheme: string;
  setTheme: (theme: 'light' | 'dark') => void;
  favoritesTotal: number;
  consentChoice: ConsentChoice;
  openPreferences: () => void;
};

export function ProfilePreferencesCards({
  t,
  locale,
  setLocale,
  effectiveTheme,
  setTheme,
  favoritesTotal,
  consentChoice,
  openPreferences,
}: ProfilePreferencesCardsProps) {
  return (
    <>
      <article className="profile-settings__card stack-sm">
        <header className="profile-settings__card-head">
          <p className="text-sm font-semibold">{t(I18N_KEYS.client.profileThemeTitle)}</p>
          <p className="typo-small">{t(I18N_KEYS.client.profileThemeSubtitle)}</p>
        </header>
        <div className="profile-settings__choices">
          <button
            type="button"
            className={`profile-settings__choice ${effectiveTheme === 'light' ? 'is-active' : ''}`.trim()}
            onClick={() => setTheme('light')}
          >
            {t(I18N_KEYS.common.themeLight)}
          </button>
          <button
            type="button"
            className={`profile-settings__choice ${effectiveTheme === 'dark' ? 'is-active' : ''}`.trim()}
            onClick={() => setTheme('dark')}
          >
            {t(I18N_KEYS.common.themeDark)}
          </button>
        </div>
      </article>

      <article className="profile-settings__card stack-sm">
        <header className="profile-settings__card-head">
          <p className="text-sm font-semibold">{t(I18N_KEYS.client.profileLanguageTitle)}</p>
          <p className="typo-small">{t(I18N_KEYS.client.profileLanguageSubtitle)}</p>
        </header>
        <div className="profile-settings__choices">
          <button
            type="button"
            className={`profile-settings__choice ${locale === 'de' ? 'is-active' : ''}`.trim()}
            onClick={() => setLocale('de')}
          >
            {t(I18N_KEYS.common.languageGerman)}
          </button>
          <button
            type="button"
            className={`profile-settings__choice ${locale === 'en' ? 'is-active' : ''}`.trim()}
            onClick={() => setLocale('en')}
          >
            {t(I18N_KEYS.common.languageEnglish)}
          </button>
        </div>
        <div className="profile-settings__meta">
          <p className="typo-small">{t(I18N_KEYS.client.profileLanguageCurrentPrefix)}: {locale.toUpperCase()}</p>
          <p className="typo-small">{t(I18N_KEYS.client.profileFavoritesTotalPrefix)}: {favoritesTotal}</p>
        </div>
      </article>

      <article className="profile-settings__card stack-sm">
        <header className="profile-settings__card-head">
          <p className="text-sm font-semibold">{t(I18N_KEYS.client.profilePrivacyTitle)}</p>
          <p className="typo-small">{t(I18N_KEYS.client.profilePrivacySubtitle)}</p>
        </header>
        <div className="profile-settings__meta">
          <p className="typo-small">
            {t(I18N_KEYS.client.profileAnalyticsLabel)}: {consentChoice.analytics ? t(I18N_KEYS.client.profileEnabled) : t(I18N_KEYS.client.profileDisabled)}
          </p>
          <p className="typo-small">
            {t(I18N_KEYS.client.profileMarketingLabel)}: {consentChoice.marketing ? t(I18N_KEYS.client.profileEnabled) : t(I18N_KEYS.client.profileDisabled)}
          </p>
        </div>
        <div className="profile-settings__inline-actions">
          <button
            type="button"
            className="btn-secondary profile-settings__save-btn"
            onClick={openPreferences}
          >
            {t(I18N_KEYS.client.profileOpenCookieSettingsCta)}
          </button>
        </div>
      </article>
    </>
  );
}
