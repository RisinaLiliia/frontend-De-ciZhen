import Link from 'next/link';
import { trackUXEvent } from '@/lib/analytics';
import { HomeHeroShot } from './HomeHeroShot';

type HomeHeroAnimatedPreviewProps = {
  mode?: 'subtle' | 'showcase';
};

export function HomeHeroAnimatedPreview({ mode = 'subtle' }: HomeHeroAnimatedPreviewProps) {
  const sectionClassName = `panel hero-experiment hero-experiment--${mode}`.trim();

  return (
    <section className={sectionClassName}>
      <div className="hero-experiment__bg" aria-hidden="true" />
      <div className="hero-experiment__content">
        <span className="hero-experiment__preview-badge">Preview</span>
        <h2 className="hero-experiment__title">
          Lösung für deine Haushaltsaufgaben
          <br />
          in 2 Minuten
        </h2>
        <p className="hero-experiment__subtitle">Schnell. Zuverlässig. Einfach.</p>
        <div className="hero-experiment__actions">
          <Link
            href="/auth/login?next=%2Frequest%2Fnew"
            className="request-create-card hero-experiment__create-card"
            onClick={() => trackUXEvent('home_hero_cta_click', { variant: 'animated', mode })}
          >
            <div className="request-create-card__body">
              <p className="request-create-card__title">Anfrage erstellen</p>
              <p className="request-create-card__subtitle">Kostenlos · mehrere Angebote</p>
            </div>
            <div className="request-create-card__media" aria-hidden="true">
              <span className="request-create-card__plus">+</span>
            </div>
          </Link>
        </div>

        <ul className="hero-experiment__trust">
          <li>Verifizierte Anbieter</li>
          <li>Ab 1€ starten</li>
          <li>Sicher bezahlen</li>
        </ul>
      </div>

      <div className="hero-experiment__visual" aria-hidden="true">
        <HomeHeroShot className="hero-shot" />
      </div>
    </section>
  );
}
