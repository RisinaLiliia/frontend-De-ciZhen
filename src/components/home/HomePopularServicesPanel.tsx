import Image from 'next/image';
import Link from 'next/link';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { CategoryCounts } from '@/types/home';
import { CountBadge } from '@/components/ui/CountBadge';

type ServiceItem = {
  key: string;
  href: string;
  label: string;
  imageSrc: string;
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
        <Link href="/requests" prefetch={false} className="badge">
          {t(I18N_KEYS.homePublic.viewAll)}
        </Link>
      </div>
      <div className="service-grid mt-3">
        {services.map((service) => (
          <Link key={service.key} href={service.href} className="service-tile service-link">
            <span className="service-tile__image-wrap">
              <Image
                src={service.imageSrc}
                alt={service.label}
                className="service-tile__image"
                fill
                sizes="(max-width: 768px) 50vw, 220px"
              />
            </span>
            <CountBadge
              className="service-tile__badge"
              value={categoryCounts[service.key] ?? 0}
            />
            {service.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
