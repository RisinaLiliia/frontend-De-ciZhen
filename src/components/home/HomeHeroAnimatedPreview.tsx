/* src/components/home/HomeHeroAnimatedPreview.tsx */
import { trackUXEvent } from '@/lib/analytics';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { HomeHeroShot } from './HomeHeroShot';
import { CreateRequestCard } from '@/components/requests/CreateRequestCard';

type HomeHeroAnimatedPreviewProps = {
  mode?: 'subtle' | 'showcase';
};

export function HomeHeroAnimatedPreview({ mode = 'subtle' }: HomeHeroAnimatedPreviewProps) {
  const cardClassName = `hero-experiment hero-experiment--${mode}`.trim();

  return (
    <Card className={cardClassName} padding="none">
      <div className="hero-experiment__bg" aria-hidden="true" />
      <div className="hero-experiment__content">
        <Badge className="hero-experiment__preview-badge">Preview</Badge>
        <h2 className="hero-experiment__title">
          Lösung für deine Haushaltsaufgaben
          <br />
          in 2 Minuten
        </h2>
        <p className="hero-experiment__subtitle">Schnell. Zuverlässig. Einfach.</p>
        <div className="hero-experiment__actions">
          <CreateRequestCard
            href="/auth/login?next=%2Frequest%2Fnew"
            className="hero-experiment__create-card"
            variant="compact"
            title="Anfrage erstellen"
            subtitle="Kostenlos · mehrere Angebote"
            onClick={() => trackUXEvent('home_hero_cta_click', { variant: 'animated', mode })}
          />
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
    </Card>
  );
}
