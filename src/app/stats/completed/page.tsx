// src/app/stats/completed/page.tsx
'use client';

import { PageShell } from '@/components/layout/PageShell';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export default function CompletedStatsPage() {
  const t = useT();
  return (
    <PageShell title={t(I18N_KEYS.pages.statsCompletedTitle)} withSpacer={true}>
      <section className="card stack-md text-center">
        <h2 className="typo-h2">{t(I18N_KEYS.pages.statsCompletedHeadline)}</h2>
        <p className="typo-muted">{t(I18N_KEYS.pages.statsCompletedBody)}</p>
        <p className="typo-small">{t(I18N_KEYS.pages.statsCompletedFooter)}</p>
      </section>
    </PageShell>
  );
}
