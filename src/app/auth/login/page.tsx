// src/app/auth/login/page.tsx
'use client';
import * as React from 'react';
import { AuthShell } from '@/features/auth/AuthShell';
import { LoginForm } from '@/features/auth/LoginForm';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export default function LoginPage() {
  const t = useT();
  return (
    <AuthShell
      title={t(I18N_KEYS.auth.loginTitle)}
      subtitle={t(I18N_KEYS.auth.loginSubtitle)}
    >
      <React.Suspense fallback={null}>
        <LoginForm />
      </React.Suspense>
    </AuthShell>
  );
}
