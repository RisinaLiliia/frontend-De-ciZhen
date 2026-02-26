// src/components/layout/AuthActions.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthLogout, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { IconButton } from '@/components/ui/IconButton';
import { IconLogin, IconLogout, IconUserPlus } from '@/components/ui/icons/icons';
import { DEFAULT_PUBLIC_WORKSPACE_URL } from '@/features/auth/constants';

export function AuthActions() {
  const t = useT();
  const router = useRouter();
  const status = useAuthStatus();
  const user = useAuthUser();
  const logout = useAuthLogout();
  const openAuth = React.useCallback(
    (route: '/auth/login' | '/auth/register') => {
      router.push(route, { scroll: false });
    },
    [router],
  );

  const onLogout = React.useCallback(async () => {
    await logout();
    if (typeof window !== 'undefined') {
      window.location.assign(DEFAULT_PUBLIC_WORKSPACE_URL);
      return;
    }
    router.replace(DEFAULT_PUBLIC_WORKSPACE_URL);
  }, [logout, router]);

  if (status === 'idle' || status === 'loading') return null;

  if (status === 'authenticated' && user) {
    return (
      <div className="flex items-center gap-2">
        <IconButton label={t(I18N_KEYS.auth.logoutLabel)} onClick={onLogout} className="icon-button--topbar">
          <IconLogout />
        </IconButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <IconButton
        onClick={() => openAuth('/auth/login')}
        label={t(I18N_KEYS.auth.loginCta)}
        className="icon-button--topbar"
      >
        <IconLogin />
      </IconButton>
      <IconButton
        onClick={() => openAuth('/auth/register')}
        label={t(I18N_KEYS.auth.registerCta)}
        className="icon-button--topbar auth-actions__register"
      >
        <IconUserPlus />
      </IconButton>
    </div>
  );
}
