/* src/components/home/HomeTrustLivePanel.tsx */
import Link from 'next/link';
import { HomeHeroShot } from './HomeHeroShot';

type HomeTrustLivePanelProps = {
  className?: string;
};

export function HomeTrustLivePanel({ className }: HomeTrustLivePanelProps) {
  return (
    <section className={`home-trust-live-panel home-trust-live-panel--hero ${className ?? ''}`.trim()}>
      <div className="home-trust-live-panel__glass" aria-hidden />

      <div className="home-trust-live-panel__heading">
        <p className="home-trust-live-panel__title">Triff die richtige Entscheidung.</p>
        <p className="home-trust-live-panel__subtitle">Wir helfen dir dabei.</p>
      </div>

      <HomeHeroShot className="hero-shot home-trust-live-panel__hero-shot" preserveAspectRatio="xMidYMid meet" variant="trust" />

      <Link href="/auth/login?next=%2Frequest%2Fnew" className="home-trust-live-panel__cta home-cta">
        Jetzt starten
      </Link>
      <p className="home-trust-live-panel__cta-note">Als Nächstes: Anmeldung oder Registrierung</p>
    </section>
  );
}
