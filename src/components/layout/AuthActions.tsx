// src/components/layout/AuthActions.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthLogout, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { IconButton } from '@/components/ui/IconButton';
import { IconChat, IconLogin, IconLogout, IconUser, IconUserPlus } from '@/components/ui/icons/icons';
import { DEFAULT_PUBLIC_REQUESTS_URL } from '@/features/auth/constants';

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
      window.location.assign(DEFAULT_PUBLIC_REQUESTS_URL);
      return;
    }
    router.replace(DEFAULT_PUBLIC_REQUESTS_URL);
  }, [logout, router]);

  if (status === 'idle' || status === 'loading') return null;

  if (status === 'authenticated' && user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/chat"
          aria-label={t(I18N_KEYS.requestsPage.navChat)}
          className="icon-button h-10 w-10 inline-flex items-center justify-center rounded-md"
        >
          <IconChat />
        </Link>
        <Link
          href="/profile/workspace"
          aria-label={t(I18N_KEYS.auth.profileLabel)}
          className="icon-button h-10 w-10 inline-flex items-center justify-center rounded-md"
        >
          <IconUser />
        </Link>
        <IconButton label={t(I18N_KEYS.auth.logoutLabel)} onClick={onLogout}>
          <IconLogout />
        </IconButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => openAuth('/auth/login')}
        aria-label={t(I18N_KEYS.auth.loginCta)}
        className="icon-button h-10 w-10 inline-flex items-center justify-center rounded-md"
      >
        <IconLogin />
      </button>
      <button
        type="button"
        onClick={() => openAuth('/auth/register')}
        aria-label={t(I18N_KEYS.auth.registerCta)}
        className="icon-button auth-actions__register h-10 w-10 inline-flex items-center justify-center rounded-md"
      >
        <IconUserPlus />
      </button>
    </div>
  );
}
