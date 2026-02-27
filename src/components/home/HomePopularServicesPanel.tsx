/* src/components/home/HomePopularServicesPanel.tsx */
import Image from 'next/image';
import Link from 'next/link';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { CategoryCounts } from '@/types/home';
import { CountBadge } from '@/components/ui/CountBadge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

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
  viewAllHref?: string;
};

export function HomePopularServicesPanel({
  t,
  services,
  categoryCounts,
  viewAllHref = '/workspace?section=orders',
}: HomePopularServicesPanelProps) {
  return (
    <Card className="home-popular-panel">
      <CardHeader className="home-panel-header">
        <div className="home-panel-heading">
          <CardTitle className="home-panel-title">{t(I18N_KEYS.homePublic.popularTitle)}</CardTitle>
          <p className="home-panel-subtitle">{t(I18N_KEYS.homePublic.popularSubtitle)}</p>
        </div>
        <Link href={viewAllHref} prefetch={false} className="home-popular__cta home-cta">
          {t(I18N_KEYS.homePublic.viewAll)}
        </Link>
      </CardHeader>
      <div className="home-popular-services__grid mt-3">
        {services.map((service) => (
          <Link key={service.key} href={service.href} className="home-popular-services__tile home-popular-services__link">
            <span className="home-popular-services__image-wrap">
              <Image
                src={service.imageSrc}
                alt=""
                className="home-popular-services__image"
                fill
                sizes="(max-width: 768px) 46vw, 205px"
                quality={60}
              />
            </span>
            <CountBadge
              className="home-popular-services__badge"
              value={categoryCounts[service.key] ?? 0}
            />
            <span className="home-popular-services__label">{service.label}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
