// src/app/client/requests/page.tsx
'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { listMyRequests } from '@/lib/api/requests';
import { listMyClientOffers } from '@/lib/api/offers';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import Link from 'next/link';

export default function ClientRequestsPage() {
  const t = useT();
  const { data, isLoading } = useQuery({
    queryKey: ['client-requests'],
    queryFn: () => listMyRequests(),
  });

  const { data: offers } = useQuery({
    queryKey: ['client-offers'],
    queryFn: () => listMyClientOffers(),
  });

  const offersByRequest = React.useMemo(() => {
    const map = new Map<string, number>();
    (offers ?? []).forEach((r) => {
      map.set(r.requestId, (map.get(r.requestId) ?? 0) + 1);
    });
    return map;
  }, [offers]);

  const statusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return t(I18N_KEYS.client.statusPublished);
      case 'matched':
        return t(I18N_KEYS.client.statusMatched);
      case 'closed':
        return t(I18N_KEYS.client.statusClosed);
      case 'cancelled':
        return t(I18N_KEYS.client.statusCancelled);
      case 'draft':
        return t(I18N_KEYS.client.statusDraft);
      default:
        return status;
    }
  };

  return (
      <PageShell right={<AuthActions />} withSpacer={false}>
        <section className="text-center stack-sm">
          <h1 className="typo-h2">{t(I18N_KEYS.client.requestsTitle)}</h1>
          <p className="typo-muted">{t(I18N_KEYS.client.requestsSubtitle)}</p>
        </section>

          {isLoading ? <p className="typo-muted">{t(I18N_KEYS.common.refreshing)}</p> : null}

        <div className="stack-md">
          {(data ?? []).length === 0 && !isLoading ? (
            <p className="typo-muted text-center">{t(I18N_KEYS.client.requestsEmpty)}</p>
          ) : null}

            {(data ?? []).map((item) => {
              const offersCount = offersByRequest.get(item.id) ?? 0;
              return (
                <div key={item.id} className="card stack-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold">{item.serviceKey}</p>
                      <p className="typo-small">
                        {item.propertyType} · {item.area} m² · {item.cityId}
                      </p>
                      <p className="typo-small">
                        {new Date(item.preferredDate).toLocaleDateString()} ·{' '}
                        {item.isRecurring
                          ? t(I18N_KEYS.client.recurringLabel)
                          : t(I18N_KEYS.client.onceLabel)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="badge">{statusLabel(item.status)}</span>
                      <p className="typo-small">
                        {t(I18N_KEYS.client.responsesLabel)}: {offersCount}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/offers/${item.id}`} className="badge">
                      {t(I18N_KEYS.client.viewOffersCta)}
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      </PageShell>
  );
}
