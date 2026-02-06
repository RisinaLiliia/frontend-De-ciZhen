import Link from 'next/link';
import { IconBriefcase, IconUser } from '@/components/ui/Icons';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

type HomeHeroProps = {
  t: (key: I18nKey) => string;
};

export function HomeHero({ t }: HomeHeroProps) {
  return (
    <>
      <section className="text-center stack-sm">
        <h2 className="typo-h2">{t(I18N_KEYS.homePublic.title)}</h2>
        <p className="typo-muted">{t(I18N_KEYS.homePublic.subtitle)}</p>
      </section>

      <section>
        <div className="action-row">
          <Link href="/providers" className="btn-secondary btn-icon">
            <IconUser className="h-4 w-4" />
            {t(I18N_KEYS.homePublic.findSpecialist)}
          </Link>
          <Link href="/provider/requests" className="btn-primary btn-icon">
            <IconBriefcase className="h-4 w-4" />
            {t(I18N_KEYS.homePublic.findJob)}
          </Link>
        </div>
      </section>
    </>
  );
}
