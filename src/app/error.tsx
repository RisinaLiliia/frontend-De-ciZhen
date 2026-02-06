'use client';

import * as React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell title={t(I18N_KEYS.app.errorTitle)} showBack={false} withSpacer={true}>
      <div className="stack-sm">
        <p className="typo-muted">{t(I18N_KEYS.app.errorMessage)}</p>
        <Button type="button" onClick={reset}>
          {t(I18N_KEYS.app.errorRetry)}
        </Button>
      </div>
    </PageShell>
  );
}
