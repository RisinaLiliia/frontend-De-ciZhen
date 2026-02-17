// src/app/auth/role/page.tsx
'use client';

import Link from 'next/link';
import { AuthShell } from '@/features/auth/AuthShell';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export default function RolePage() {
  const t = useT();

  return (
    <AuthShell title={t(I18N_KEYS.auth.roleTitle)} subtitle={t(I18N_KEYS.auth.roleSubtitle)}>
      <div className="stack-md">
        <Link
          href="/requests"
          className="stack-sm rounded-lg border border-(--c-border) p-4 transition hover:border-(--c-primary)"
        >
          <h2 className="typo-h2">{t(I18N_KEYS.auth.roleClient)}</h2>
          <p className="typo-muted">
            {t(I18N_KEYS.authRole.clientDesc)}
          </p>
        </Link>

        <Link
          href="/requests?tab=new-orders"
          className="stack-sm rounded-lg border border-(--c-border) p-4 transition hover:border-(--c-primary)"
        >
          <h2 className="typo-2">{t(I18N_KEYS.auth.roleProvider)}</h2>
          <p className="typo-muted">
            {t(I18N_KEYS.authRole.providerDesc)}
          </p>
        </Link>
      </div>
    </AuthShell>
  );
}
