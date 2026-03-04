'use client';

import Link from 'next/link';
import { useConsent } from '@/lib/consent/ConsentProvider';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

const privacyHref = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL?.trim() || '/privacy-policy';
const cookieHref = process.env.NEXT_PUBLIC_COOKIE_NOTICE_URL?.trim() || '/cookie-notice';

export function ConsentManageFooter() {
  const t = useT();
  const { ready, decisionMade, openPreferences } = useConsent();

  if (!ready || !decisionMade) return null;

  return (
    <footer className="consent-manage-footer" role="contentinfo" aria-label={t(I18N_KEYS.consent.manageSettings)}>
      <div className="consent-manage-footer__inner">
        <div className="consent-manage-footer__links">
          <Link href={privacyHref} prefetch={false}>
            {t(I18N_KEYS.consent.privacyPolicy)}
          </Link>
          <span aria-hidden="true">·</span>
          <Link href={cookieHref} prefetch={false}>
            {t(I18N_KEYS.consent.cookieNotice)}
          </Link>
        </div>
        <button
          type="button"
          className="consent-manage-footer__button"
          onClick={openPreferences}
          aria-label={t(I18N_KEYS.consent.manageSettings)}
        >
          {t(I18N_KEYS.consent.manageSettings)}
        </button>
      </div>
    </footer>
  );
}
