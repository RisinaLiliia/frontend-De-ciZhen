// src/app/(provider)/provider/page.tsx
'use client';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export default function ProviderHome() {
  const t = useT();
  return (
      <PageShell right={<AuthActions />} mainClassName="py-10" withSpacer={true}>
        <section className="card stack-sm text-center">
          <h1 className="typo-h2">{t(I18N_KEYS.provider.title)}</h1>
          <p className="typo-muted">{t(I18N_KEYS.provider.subtitle)}</p>
        </section>
      </PageShell>
  );
}
