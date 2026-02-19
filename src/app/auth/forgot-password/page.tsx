'use client';

import * as React from 'react';
import { AuthShell } from '@/features/auth/AuthShell';
import { ForgotPasswordForm } from '@/features/auth/ForgotPasswordForm';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export default function ForgotPasswordPage() {
  const t = useT();
  return (
    <AuthShell
      title={t(I18N_KEYS.auth.forgotPasswordTitle)}
      subtitle={t(I18N_KEYS.auth.forgotPasswordSubtitle)}
    >
      <React.Suspense fallback={null}>
        <ForgotPasswordForm />
      </React.Suspense>
    </AuthShell>
  );
}

