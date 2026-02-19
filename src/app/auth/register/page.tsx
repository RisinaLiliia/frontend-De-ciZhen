// src/app/auth/register/page.tsx
'use client';

import * as React from 'react';
import { AuthShell } from '@/features/auth/AuthShell';
import { RegisterForm } from '@/features/auth/RegisterForm';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export default function RegisterPage() {
  const t = useT();
  return (
    <AuthShell
      title={t(I18N_KEYS.auth.registerTitle)}
      subtitle={t(I18N_KEYS.auth.registerSubtitle)}
    >
      <React.Suspense fallback={null}>
        <RegisterForm />
      </React.Suspense>
    </AuthShell>
  );
}
