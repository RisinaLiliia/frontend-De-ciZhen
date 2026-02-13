// src/components/layout/AuthActions.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuthLogout, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { IconButton } from '@/components/ui/IconButton';
import { IconLogin, IconLogout, IconUser, IconUserPlus } from '@/components/ui/icons/icons';
import { ModeSwitch } from '@/components/layout/ModeSwitch';

export function AuthActions() {
  const t = useT();
  const status = useAuthStatus();
  const user = useAuthUser();
  const logout = useAuthLogout();

  const onLogout = React.useCallback(async () => {
    await logout();
  }, [logout]);

  if (status === 'idle' || status === 'loading') return null;

  if (status === 'authenticated' && user) {
    const profileHref = user.role === 'provider' ? '/provider/profile' : '/client/profile';
    return (
      <div className="flex items-center gap-2">
        <ModeSwitch />
        <Link
          href={profileHref}
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
      <Link
        href="/auth/login"
        aria-label={t(I18N_KEYS.auth.loginCta)}
        className="icon-button h-10 w-10 inline-flex items-center justify-center rounded-md"
      >
        <IconLogin />
      </Link>
      <Link
        href="/auth/register"
        aria-label={t(I18N_KEYS.auth.registerCta)}
        className="icon-button h-10 w-10 inline-flex items-center justify-center rounded-md"
      >
        <IconUserPlus />
      </Link>
    </div>
  );
}
