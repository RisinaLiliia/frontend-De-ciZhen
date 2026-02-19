'use client';

import * as React from 'react';
import { ForgotPasswordForm } from '@/features/auth/ForgotPasswordForm';
import { AuthRouteModal } from '@/features/auth/AuthRouteModal';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export default function ForgotPasswordModalRoute() {
  const t = useT();
  return (
    <AuthRouteModal
      title={t(I18N_KEYS.auth.forgotPasswordTitle)}
      subtitle={t(I18N_KEYS.auth.forgotPasswordSubtitle)}
      closeLabel={t(I18N_KEYS.auth.closeDialog)}
    >
      <React.Suspense fallback={null}>
        <ForgotPasswordForm />
      </React.Suspense>
    </AuthRouteModal>
  );
}

