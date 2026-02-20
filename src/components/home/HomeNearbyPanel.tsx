'use client';

import * as React from 'react';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import { useGeoRegion } from '@/hooks/useGeoRegion';
import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import { listPublicRequests } from '@/lib/api/requests';
import { RequestsList } from '@/components/requests/RequestsList';
import type { RequestResponseDto } from '@/lib/api/dto/requests';

type HomeNearbyPanelProps = {
  t: (key: I18nKey) => string;
};


export function HomeNearbyPanel({ t }: HomeNearbyPanelProps) {
  const { locale } = useI18n();
  const region = useGeoRegion();
  const { data: cities = [] } = useCities('DE');
  const { data: categories = [] } = useServiceCategories();
  const { data: services = [] } = useServices();

  const cityId = React.useMemo(() => {
    if (!region) return undefined;
    const target = region.trim().toLowerCase();
    const match = cities.find((city) =>
      Object.values(city.i18n ?? {}).some((name) => name.trim().toLowerCase() === target),
    );
    return match?.id;
  }, [cities, region]);

  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex({
    services,
    categories,
    cities,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['home-nearby-requests', cityId],
    queryFn: () =>
      listPublicRequests({
        cityId,
        sort: 'date_desc',
        limit: 3,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });



  const requests: RequestResponseDto[] = data?.items ?? [];
  const formatDate = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
        day: '2-digit',
        month: 'short',
      }),
    [locale],
  );
  const formatPrice = React.useMemo(
    () =>
      new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    [locale],
  );
  return (
    <section className="panel">
      <div className="panel-header">
        <div className="section-heading">
          <p className="section-title">{t(I18N_KEYS.homePublic.nearby)}</p>
          <p className="section-subtitle">{t(I18N_KEYS.homePublic.nearbySubtitle)}</p>
        </div>
      </div>
      <div className="nearby-list">
        <RequestsList
          t={t}
          locale={locale}
          requests={requests}
          isLoading={isLoading}
          isError={isError}
          serviceByKey={serviceByKey}
          categoryByKey={categoryByKey}
          cityById={cityById}
          formatDate={formatDate}
          formatPrice={formatPrice}
        />
      </div>

      <div className="mt-3 flex justify-center">
        <MoreDotsLink href="/requests" label={t(I18N_KEYS.homePublic.nearbyCta)} />
      </div>
    </section>
  );
}
