import { HeroSection } from '@/components/ui/HeroSection';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

type HomeHeroProps = {
  t: (key: I18nKey) => string;
};

export function HomeHero({ t }: HomeHeroProps) {
  return (
    <HeroSection
      title={t(I18N_KEYS.homePublic.title)}
      subtitle={t(I18N_KEYS.homePublic.subtitle)}
      ctas={[
        {
          href: '/providers',
          label: t(I18N_KEYS.homePublic.findSpecialist),
          variant: 'secondary',
        },
        {
          href: '/requests',
          label: t(I18N_KEYS.homePublic.findJob),
          variant: 'primary',
        },
      ]}
      mediaSrc="/Handwerker%20in%20einem%20modernen%20Wohnzimmer.jpg"
    />
  );
}
