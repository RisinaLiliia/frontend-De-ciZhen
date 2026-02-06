'use client';

import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export default function NotFound() {
  const t = useT();
  return (
    <PageShell title={t(I18N_KEYS.app.notFoundTitle)} showBack={false} withSpacer={true}>
      <div className="stack-sm">
        <p className="typo-muted">{t(I18N_KEYS.app.notFoundMessage)}</p>
        <Link href="/" className="btn-secondary w-fit px-6">
          {t(I18N_KEYS.app.notFoundCta)}
        </Link>
      </div>
    </PageShell>
  );
}
