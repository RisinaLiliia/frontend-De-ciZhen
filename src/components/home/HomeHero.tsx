import { HeroSection } from '@/components/ui/HeroSection';
import Link from 'next/link';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { trackUXEvent } from '@/lib/analytics';

type HomeHeroProps = {
  t: (key: I18nKey) => string;
};

export function HomeHero({ t }: HomeHeroProps) {
  const heroTitle = t(I18N_KEYS.homePublic.title).replace(' in 2 Minuten', '\nin 2 Minuten');
  const ctas = [
    {
      href: '/requests',
      label: t(I18N_KEYS.homePublic.findSpecialist),
      variant: 'secondary' as const,
    },
    {
      href: '/requests',
      label: t(I18N_KEYS.homePublic.findJob),
      variant: 'primary' as const,
    },
  ];

  return (
    <>
      <HeroSection
        title={heroTitle}
        subtitle={t(I18N_KEYS.homePublic.subtitle)}
        mediaSrc="/Handwerker%20in%20einem%20modernen%20Wohnzimmer.jpg"
      />
      <div className="action-row sticky-action-row hero-dock-actions">
        {ctas.map((cta) => (
          <Link
            key={cta.href + cta.label}
            href={cta.href}
            className={cta.variant === 'primary' ? 'btn-primary btn-icon' : 'btn-secondary btn-icon'}
            onClick={() => trackUXEvent('home_hero_cta_click', { variant: 'current', cta: cta.variant })}
          >
            {cta.label}
          </Link>
        ))}
      </div>
    </>
  );
}
