// src/app/provider/requests/page.tsx
'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { Button } from '@/components/ui/Button';
import { listPublicRequests } from '@/lib/api/requests';
import { respondToRequest } from '@/lib/api/responses';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useCities, useServices } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function ProviderRequestsPage() {
  const t = useT();
  const { locale } = useI18n();
  const { data: cities } = useCities('DE');
  const { data: services } = useServices();

  const { data, isLoading } = useQuery({
    queryKey: ['provider-requests'],
    queryFn: () => listPublicRequests(),
  });
  const items = React.useMemo(
    () => (Array.isArray(data) ? data : data?.items ?? []),
    [data],
  );

  const onRespond = async (requestId: string) => {
    try {
      await respondToRequest({ requestId });
      toast.success(t(I18N_KEYS.provider.responded));
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  };

  return (
      <PageShell right={<AuthActions />} withSpacer={false}>
        <section className="text-center stack-sm">
          <h1 className="typo-h2">{t(I18N_KEYS.provider.feedTitle)}</h1>
          <p className="typo-muted">{t(I18N_KEYS.provider.feedSubtitle)}</p>
        </section>

          {isLoading ? <p className="typo-muted">{t(I18N_KEYS.common.refreshing)}</p> : null}

        <div className="stack-md">
          {items.length === 0 && !isLoading ? (
            <p className="typo-muted text-center">{t(I18N_KEYS.provider.feedEmpty)}</p>
          ) : null}

            {items.map((item) => {
              const city = cities?.find((c) => c.id === item.cityId);
              const service = services?.find((s) => s.key === item.serviceKey);
              const cityLabel = city ? pickI18n(city.i18n, locale) : item.cityId;
              const serviceLabel = service ? pickI18n(service.i18n, locale) : item.serviceKey;
              return (
                <div key={item.id} className="card stack-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold">{serviceLabel}</p>
                    <p className="typo-small">
                      {item.propertyType} · {item.area} m² · {cityLabel}
                    </p>
                    <p className="typo-small">{new Date(item.preferredDate).toLocaleDateString()}</p>
                  </div>
                  <span className="typo-small">{item.status}</span>
                </div>

                <Button type="button" onClick={() => onRespond(item.id)}>
                  {t(I18N_KEYS.provider.respondCta)}
                </Button>
              </div>
            );
            })}
        </div>
      </PageShell>
  );
}
