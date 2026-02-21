import Link from 'next/link';
import { trackUXEvent } from '@/lib/analytics';

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
            href="/request/new"
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
        <svg viewBox="0 0 300 190" className="hero-shot">
          <line className="hero-shot__floor" x1="16" y1="152" x2="286" y2="152" />
          <path className="hero-shot__trace" d="M48 136 C 106 36, 192 20, 254 78" />

          <circle className="hero-shot__dribble-mark is-one" cx="52" cy="151" r="2.8" />
          <circle className="hero-shot__dribble-mark is-two" cx="74" cy="151" r="2.8" />

          <g className="hero-shot__hoop">
            <rect className="hero-shot__backboard" x="238" y="30" width="42" height="46" rx="4" />
            <rect className="hero-shot__backboard-inner" x="250" y="43" width="16" height="13" rx="2" />
            <path className="hero-shot__rim" d="M239 81 C 250 81, 268 81, 279 81" />
            <path className="hero-shot__net" d="M243 83 C 248 102, 270 102, 275 83" />
            <path className="hero-shot__net" d="M247 83 C 252 100, 265 100, 271 83" />
            <path className="hero-shot__net" d="M251 83 C 255 98, 261 98, 267 83" />
          </g>
          <g className="hero-shot__ball-wrap">
            <circle className="hero-shot__ball" cx="48" cy="134" r="11" />
            <path className="hero-shot__ball-line" d="M39 134 H57" />
            <path className="hero-shot__ball-line" d="M48 123 V145" />
            <path className="hero-shot__ball-line" d="M41 126 C 46 132, 46 136, 41 142" />
            <path className="hero-shot__ball-line" d="M55 126 C 50 132, 50 136, 55 142" />
          </g>

          <circle className="hero-shot__pulse" cx="279" cy="81" r="3.6" />
        </svg>
      </div>
    </section>
  );
}
