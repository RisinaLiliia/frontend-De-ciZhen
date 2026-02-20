import { HeroSection } from '@/components/ui/HeroSection';
import Link from 'next/link';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

type HomeHeroProps = {
  t: (key: I18nKey) => string;
};

export function HomeHero({ t }: HomeHeroProps) {
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
        title={t(I18N_KEYS.homePublic.title)}
        subtitle={t(I18N_KEYS.homePublic.subtitle)}
        mediaSrc="/Handwerker%20in%20einem%20modernen%20Wohnzimmer.jpg"
      />
      <div className="action-row sticky-action-row hero-dock-actions">
        {ctas.map((cta) => (
          <Link
            key={cta.href + cta.label}
            href={cta.href}
            className={cta.variant === 'primary' ? 'btn-primary btn-icon' : 'btn-secondary btn-icon'}
          >
            {cta.label}
          </Link>
        ))}
      </div>
    </>
  );
}
