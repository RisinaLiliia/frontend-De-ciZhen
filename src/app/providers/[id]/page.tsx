// src/app/providers/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { listPublicProviders } from '@/lib/api/providers';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export default function ProviderPublicProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const t = useT();

  const { data, isLoading } = useQuery({
    queryKey: ['provider', id],
    queryFn: async () => {
      const list = await listPublicProviders();
      return list.find((p) => p.id === id) ?? null;
    },
    enabled: Boolean(id),
  });

  return (
    <PageShell right={<AuthActions />} withSpacer={true}>
      <section className="card stack-sm">
          {isLoading ? <p className="typo-muted">{t(I18N_KEYS.common.refreshing)}</p> : null}
          {!isLoading && !data ? (
            <p className="typo-muted">{t(I18N_KEYS.provider.notFound)}</p>
          ) : null}
          {data ? (
            <>
              <h1 className="typo-h2">{data.displayName || t(I18N_KEYS.provider.unnamed)}</h1>
              <p className="typo-muted">
                {t(I18N_KEYS.provider.rating)}: {data.ratingAvg} ·{' '}
                {t(I18N_KEYS.provider.jobs)}: {data.completedJobs}
              </p>
              <p className="typo-small">
                {t(I18N_KEYS.provider.basePrice)}:{' '}
                {data.basePrice ? `€ ${data.basePrice}` : '—'}
              </p>
            </>
          ) : null}
      </section>
    </PageShell>
  );
}
