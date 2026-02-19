'use client';

import * as React from 'react';
import { ResetPasswordForm } from '@/features/auth/ResetPasswordForm';
import { AuthRouteModal } from '@/features/auth/AuthRouteModal';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export default function ResetPasswordModalRoute() {
  const t = useT();
  return (
    <AuthRouteModal
      title={t(I18N_KEYS.auth.resetPasswordTitle)}
      subtitle={t(I18N_KEYS.auth.resetPasswordSubtitle)}
      closeLabel={t(I18N_KEYS.auth.closeDialog)}
    >
      <React.Suspense fallback={null}>
        <ResetPasswordForm />
      </React.Suspense>
    </AuthRouteModal>
  );
}
