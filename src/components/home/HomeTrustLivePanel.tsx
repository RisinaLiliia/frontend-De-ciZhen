/* src/components/home/HomeTrustLivePanel.tsx */
import Link from 'next/link';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { HomeHeroShot } from './HomeHeroShot';

type HomeTrustLivePanelProps = {
  className?: string;
  t: (key: I18nKey) => string;
};

export function HomeTrustLivePanel({ className, t }: HomeTrustLivePanelProps) {
  return (
    <section className={`home-trust-live-panel home-trust-live-panel--hero ${className ?? ''}`.trim()}>
      <div className="home-trust-live-panel__glass" aria-hidden />

      <div className="home-trust-live-panel__heading">
        <p className="home-trust-live-panel__title">{t(I18N_KEYS.homePublic.trustPanelTitle)}</p>
        <p className="home-trust-live-panel__subtitle">{t(I18N_KEYS.homePublic.trustPanelSubtitle)}</p>
      </div>

      <HomeHeroShot className="hero-shot home-trust-live-panel__hero-shot" preserveAspectRatio="xMidYMid meet" variant="trust" />

      <Link href="/auth/login?next=%2Frequest%2Fnew" className="home-trust-live-panel__cta home-cta">
        {t(I18N_KEYS.homePublic.trustPanelCta)}
      </Link>
      <p className="home-trust-live-panel__cta-note">{t(I18N_KEYS.homePublic.trustPanelNote)}</p>
    </section>
  );
}
