'use client';

import * as React from 'react';
import { LoginForm } from '@/features/auth/LoginForm';
import { AuthRouteModal } from '@/features/auth/AuthRouteModal';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export default function LoginModalRoute() {
  const t = useT();
  return (
    <AuthRouteModal
      title={t(I18N_KEYS.auth.loginTitle)}
      subtitle={t(I18N_KEYS.auth.loginSubtitle)}
      closeLabel={t(I18N_KEYS.auth.closeDialog)}
    >
      <React.Suspense fallback={null}>
        <LoginForm />
      </React.Suspense>
    </AuthRouteModal>
  );
}
