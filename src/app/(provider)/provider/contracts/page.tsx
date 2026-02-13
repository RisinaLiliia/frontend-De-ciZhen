// src/app/provider/contracts/page.tsx
'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { listMyContracts } from '@/lib/api/contracts';

export default function ProviderContractsPage() {
  const t = useT();

  const { data, isLoading } = useQuery({
    queryKey: ['provider-contracts'],
    queryFn: () => listMyContracts({ role: 'provider' }),
  });

  return (
    <PageShell right={<AuthActions />} withSpacer={false}>
      <section className="text-center stack-sm">
        <h1 className="typo-h2">{t(I18N_KEYS.provider.contractsTitle)}</h1>
      </section>

      {isLoading ? <p className="typo-muted">{t(I18N_KEYS.common.refreshing)}</p> : null}

      <div className="stack-md">
        {(data ?? []).length === 0 && !isLoading ? (
          <p className="typo-muted text-center">{t(I18N_KEYS.provider.contractsEmpty)}</p>
        ) : null}

        {(data ?? []).map((item) => (
          <div key={item.id} className="card stack-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{t(I18N_KEYS.contracts.title)}</p>
                <p className="typo-small">{item.requestId}</p>
              </div>
              <span className="badge capitalize">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
