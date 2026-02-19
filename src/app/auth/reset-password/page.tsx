'use client';

import * as React from 'react';
import { AuthShell } from '@/features/auth/AuthShell';
import { ResetPasswordForm } from '@/features/auth/ResetPasswordForm';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export default function ResetPasswordPage() {
  const t = useT();
  return (
    <AuthShell
      title={t(I18N_KEYS.auth.resetPasswordTitle)}
      subtitle={t(I18N_KEYS.auth.resetPasswordSubtitle)}
    >
      <React.Suspense fallback={null}>
        <ResetPasswordForm />
      </React.Suspense>
    </AuthShell>
  );
}
