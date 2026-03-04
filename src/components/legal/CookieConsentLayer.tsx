'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useConsent } from '@/lib/consent/ConsentProvider';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

const privacyHref = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL?.trim() || '/privacy-policy';
const cookieHref = process.env.NEXT_PUBLIC_COOKIE_NOTICE_URL?.trim() || '/cookie-notice';

export function CookieConsentLayer() {
  const t = useT();
  const {
    ready,
    decisionMade,
    draft,
    isPreferencesOpen,
    openPreferences,
    closePreferences,
    setDraft,
    acceptAll,
    rejectOptional,
    savePreferences,
  } = useConsent();

  React.useEffect(() => {
    if (!isPreferencesOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePreferences();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closePreferences, isPreferencesOpen]);

  if (!ready) return null;

  return (
    <>
      {!decisionMade ? (
        <section
          className="cookie-consent-banner"
          role="dialog"
          aria-live="polite"
          aria-label={t(I18N_KEYS.consent.bannerTitle)}
        >
          <div className="cookie-consent-banner__body">
            <p className="cookie-consent-banner__eyebrow">GDPR / ePrivacy</p>
            <h2 className="cookie-consent-banner__title">{t(I18N_KEYS.consent.bannerTitle)}</h2>
            <p className="cookie-consent-banner__text">{t(I18N_KEYS.consent.bannerDescription)}</p>
            <p className="cookie-consent-banner__links">
              <Link href={privacyHref} prefetch={false}>
                {t(I18N_KEYS.consent.privacyPolicy)}
              </Link>
              <span aria-hidden="true">·</span>
              <Link href={cookieHref} prefetch={false}>
                {t(I18N_KEYS.consent.cookieNotice)}
              </Link>
            </p>
          </div>
          <div className="cookie-consent-banner__actions">
            <Button variant="secondary" fullWidth={false} className="cookie-consent-banner__action" onClick={rejectOptional}>
              {t(I18N_KEYS.consent.rejectOptional)}
            </Button>
            <Button variant="ghost" fullWidth={false} className="cookie-consent-banner__action" onClick={openPreferences}>
              {t(I18N_KEYS.consent.customize)}
            </Button>
            <Button variant="primary" fullWidth={false} className="cookie-consent-banner__action" onClick={acceptAll}>
              {t(I18N_KEYS.consent.acceptAll)}
            </Button>
          </div>
        </section>
      ) : null}

      {isPreferencesOpen ? (
        <div className="dc-modal cookie-consent-modal" role="dialog" aria-modal="true" aria-label={t(I18N_KEYS.consent.modalTitle)}>
          <button type="button" className="dc-modal__backdrop" onClick={closePreferences} aria-label={t(I18N_KEYS.auth.closeDialog)} />
          <div className="dc-modal__panel dc-modal__panel--compact cookie-consent-modal__panel">
            <header className="cookie-consent-modal__header">
              <p className="cookie-consent-modal__eyebrow">De&apos;ciZhen</p>
              <h2 className="cookie-consent-modal__title">{t(I18N_KEYS.consent.modalTitle)}</h2>
              <p className="cookie-consent-modal__text">{t(I18N_KEYS.consent.modalDescription)}</p>
            </header>

            <div className="cookie-consent-options">
              <article className="cookie-consent-option is-required">
                <div>
                  <h3>{t(I18N_KEYS.consent.requiredTitle)}</h3>
                  <p>{t(I18N_KEYS.consent.requiredDescription)}</p>
                </div>
                <span className="cookie-consent-option__badge">{t(I18N_KEYS.consent.alwaysActive)}</span>
              </article>

              <label className="cookie-consent-option">
                <div>
                  <h3>{t(I18N_KEYS.consent.analyticsTitle)}</h3>
                  <p>{t(I18N_KEYS.consent.analyticsDescription)}</p>
                </div>
                <input
                  type="checkbox"
                  checked={draft.analytics}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      analytics: event.target.checked,
                    })
                  }
                />
              </label>

              <label className="cookie-consent-option">
                <div>
                  <h3>{t(I18N_KEYS.consent.marketingTitle)}</h3>
                  <p>{t(I18N_KEYS.consent.marketingDescription)}</p>
                </div>
                <input
                  type="checkbox"
                  checked={draft.marketing}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      marketing: event.target.checked,
                    })
                  }
                />
              </label>
            </div>

            <footer className="cookie-consent-modal__actions">
              <Button variant="secondary" fullWidth={false} onClick={closePreferences}>
                {t(I18N_KEYS.consent.cancel)}
              </Button>
              <Button variant="primary" fullWidth={false} onClick={savePreferences}>
                {t(I18N_KEYS.consent.saveSelection)}
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
