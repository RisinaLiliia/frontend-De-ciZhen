// src/app/client/page.tsx
'use client';

import * as React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { RequestForm } from '@/features/request/RequestForm';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import Link from 'next/link';

export default function ClientHome() {
  const t = useT();

  return (
    <PageShell right={<AuthActions />} withSpacer={false}>
      <div className="stack-lg">
        <section className="text-center stack-sm">
          <h1 className="typo-h1">{t(I18N_KEYS.home.title)}</h1>
          <p className="typo-muted">{t(I18N_KEYS.home.subtitle)}</p>
        </section>

        <div className="flex items-center justify-center gap-3">
          <Link href="/client/requests" className="badge">
            {t(I18N_KEYS.client.requestsTitle)}
          </Link>
          <Link href="/client/offers" className="badge">
            {t(I18N_KEYS.client.offersTitle)}
          </Link>
          <Link href="/client/contracts" className="badge">
            {t(I18N_KEYS.client.contractsTitle)}
          </Link>
        </div>

        <RequestForm />
      </div>
    </PageShell>
  );
}
