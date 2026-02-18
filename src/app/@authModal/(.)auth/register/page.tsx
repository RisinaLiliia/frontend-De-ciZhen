'use client';

import * as React from 'react';
import { RegisterForm } from '@/features/auth/RegisterForm';
import { AuthRouteModal } from '@/features/auth/AuthRouteModal';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export default function RegisterModalRoute() {
  const t = useT();
  return (
    <AuthRouteModal
      title={t(I18N_KEYS.auth.registerTitle)}
      subtitle={t(I18N_KEYS.auth.registerSubtitle)}
      closeLabel={t(I18N_KEYS.auth.closeDialog)}
    >
      <React.Suspense fallback={null}>
        <RegisterForm />
      </React.Suspense>
    </AuthRouteModal>
  );
}
