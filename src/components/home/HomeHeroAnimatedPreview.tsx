/* src/components/home/HomeHeroAnimatedPreview.tsx */
import { trackUXEvent } from '@/lib/analytics';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { HomeHeroShot } from './HomeHeroShot';
import { CreateRequestCard } from '@/components/requests/CreateRequestCard';

type HomeHeroAnimatedPreviewProps = {
  mode?: 'subtle' | 'showcase';
  t: (key: I18nKey) => string;
};

export function HomeHeroAnimatedPreview({ mode = 'subtle', t }: HomeHeroAnimatedPreviewProps) {
  const cardClassName = `hero-experiment hero-experiment--${mode}`.trim();

  return (
    <Card className={cardClassName} padding="none">
      <div className="hero-experiment__bg" aria-hidden="true" />
      <div className="hero-experiment__content">
        <Badge className="hero-experiment__preview-badge">{t(I18N_KEYS.homePublic.heroAnimatedBadge)}</Badge>
        <h2 className="hero-experiment__title">
          {t(I18N_KEYS.homePublic.title)}
        </h2>
        <p className="hero-experiment__subtitle">{t(I18N_KEYS.homePublic.subtitle)}</p>
        <div className="hero-experiment__actions">
          <CreateRequestCard
            href="/auth/login?next=%2Frequest%2Fnew"
            className="hero-experiment__create-card"
            variant="compact"
            title={t(I18N_KEYS.requestsPage.heroPrimaryCta)}
            subtitle={t(I18N_KEYS.homePublic.heroAnimatedCreateSubtitle)}
            onClick={() => trackUXEvent('home_hero_cta_click', { variant: 'animated', mode })}
          />
        </div>

        <ul className="hero-experiment__trust">
          <li>{t(I18N_KEYS.home.trust.rated)}</li>
          <li>{t(I18N_KEYS.home.trust.fast)}</li>
          <li>{t(I18N_KEYS.home.trust.local)}</li>
        </ul>
      </div>

      <div className="hero-experiment__visual" aria-hidden="true">
        <HomeHeroShot className="hero-shot" />
      </div>
    </Card>
  );
}
