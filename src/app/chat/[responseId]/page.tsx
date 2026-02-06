// src/app/chat/[responseId]/page.tsx
'use client';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { RequireAuth } from '@/lib/auth/RequireAuth';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export default function ChatPage() {
  const t = useT();

  return (
    <RequireAuth>
      <PageShell right={<AuthActions />} title={t(I18N_KEYS.chat.title)} withSpacer={true}>
        <div className="card stack-md">
          <p className="typo-muted">{t(I18N_KEYS.chat.placeholder)}</p>
        </div>
      </PageShell>
    </RequireAuth>
  );
}
