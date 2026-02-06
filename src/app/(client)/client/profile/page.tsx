// src/app/client/profile/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { useAuthUser } from '@/hooks/useAuthSnapshot';
import { listMyRequests } from '@/lib/api/requests';
import { listMyClientResponses } from '@/lib/api/responses';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export default function ClientProfilePage() {
  const t = useT();
  const user = useAuthUser();

  const { data: requests } = useQuery({
    queryKey: ['client-requests'],
    queryFn: () => listMyRequests(),
  });

  const { data: responses } = useQuery({
    queryKey: ['client-offers'],
    queryFn: () => listMyClientResponses(),
  });

  const responsesByRequest = React.useMemo(() => {
    const map = new Map<string, number>();
    (responses ?? []).forEach((r) => {
      map.set(r.requestId, (map.get(r.requestId) ?? 0) + 1);
    });
    return map;
  }, [responses]);

  return (
      <PageShell right={<AuthActions />} withSpacer={false}>
        <section className="card stack-sm">
          <h1 className="typo-h2">{t(I18N_KEYS.client.profileTitle)}</h1>
          <p className="typo-muted">{user?.name}</p>
          <p className="typo-small">{user?.email}</p>
        </section>

        <section className="card stack-sm">
          <h2 className="typo-h3">{t(I18N_KEYS.client.settingsTitle)}</h2>
          <div className="flex items-center justify-between">
            <span className="typo-small">{t(I18N_KEYS.common.themeLabel)}</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between">
            <span className="typo-small">{t(I18N_KEYS.auth.languageLabel)}</span>
            <LanguageToggle />
          </div>
        </section>

        <section className="card stack-sm">
          <div className="flex items-center justify-between">
            <h2 className="typo-h3">{t(I18N_KEYS.client.requestsTitle)}</h2>
            <Link href="/client/requests" className="typo-small">
              {t(I18N_KEYS.client.viewAll)}
            </Link>
          </div>
          <div className="stack-sm">
            {(requests ?? []).slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{item.serviceKey}</p>
                  <p className="typo-small">
                    {item.propertyType} · {item.area} m²
                  </p>
                </div>
                <div className="text-right">
                  <span className="badge">{item.status}</span>
                  <p className="typo-small">
                    {t(I18N_KEYS.client.responsesLabel)}: {responsesByRequest.get(item.id) ?? 0}
                  </p>
                </div>
              </div>
            ))}
            {(requests ?? []).length === 0 ? (
              <p className="typo-muted">{t(I18N_KEYS.client.requestsEmpty)}</p>
            ) : null}
          </div>
        </section>

        <section className="card stack-sm">
          <div className="flex items-center justify-between">
            <h2 className="typo-h3">{t(I18N_KEYS.client.offersTitle)}</h2>
            <Link href="/client/offers" className="typo-small">
              {t(I18N_KEYS.client.viewAll)}
            </Link>
          </div>
          <div className="stack-sm">
            {(responses ?? []).slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {item.providerDisplayName || t(I18N_KEYS.offers.unnamed)}
                  </p>
                  <p className="typo-small">{item.requestServiceKey || item.requestId}</p>
                </div>
                <span className="badge">{item.status}</span>
              </div>
            ))}
            {(responses ?? []).length === 0 ? (
              <p className="typo-muted">{t(I18N_KEYS.client.offersEmpty)}</p>
            ) : null}
          </div>
        </section>
      </PageShell>
  );
}
