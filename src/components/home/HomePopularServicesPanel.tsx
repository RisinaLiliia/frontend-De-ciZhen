import Link from 'next/link';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { CategoryCounts } from '@/types/home';
import type { IconType } from '@/data/home';

type ServiceItem = {
  key: string;
  href: string;
  label: string;
  Icon: IconType;
};

type HomePopularServicesPanelProps = {
  t: (key: I18nKey) => string;
  services: ServiceItem[];
  categoryCounts: CategoryCounts;
};

export function HomePopularServicesPanel({
  t,
  services,
  categoryCounts,
}: HomePopularServicesPanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <p className="section-title">{t(I18N_KEYS.homePublic.popularTitle)}</p>
        <Link href="/services" className="badge">
          {t(I18N_KEYS.homePublic.viewAll)}
        </Link>
      </div>
      <div className="service-grid mt-3">
        {services.map((service) => (
          <Link key={service.key} href={service.href} className="service-tile service-link">
            <span className="service-tile__icon">
              <service.Icon className="h-4 w-4" />
              <span className="badge-pill">{categoryCounts[service.key]}</span>
            </span>
            {service.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
