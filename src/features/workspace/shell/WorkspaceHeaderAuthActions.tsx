'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { IconButton } from '@/components/ui/IconButton';
import { IconLogin, IconUserPlus } from '@/components/ui/icons/icons';
import { DEFAULT_PUBLIC_WORKSPACE_URL } from '@/features/auth/constants';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';

function getHeaderGuestRegisterCta(locale: string) {
  return locale === 'en' ? 'Start free' : 'Kostenlos starten';
}

export function WorkspaceHeaderAuthActions({
  className,
  variant = 'icons',
}: {
  className?: string;
  variant?: 'icons' | 'buttons';
} = {}) {
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const authStatus = useAuthStatus();

  const currentHref = React.useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const openAuth = React.useCallback(
    (route: '/auth/login' | '/auth/register') => {
      const next = currentHref.startsWith('/') ? currentHref : DEFAULT_PUBLIC_WORKSPACE_URL;
      router.push(`${route}?next=${encodeURIComponent(next)}`, { scroll: false });
    },
    [currentHref, router],
  );

  if (authStatus !== 'unauthenticated') {
    return null;
  }

  if (variant === 'buttons') {
    return (
      <div className={['workspace-environment__auth-actions', className].filter(Boolean).join(' ')}>
        <button
          type="button"
          className="workspace-environment__text-action"
          onClick={() => openAuth('/auth/login')}
        >
          {t(I18N_KEYS.auth.loginCta)}
        </button>
        <button
          type="button"
          className="workspace-environment__primary-cta workspace-environment__primary-cta--auth"
          onClick={() => openAuth('/auth/register')}
        >
          <span>{getHeaderGuestRegisterCta(locale)}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={['workspace-environment__auth-actions', className].filter(Boolean).join(' ')}>
      <IconButton
        label={t('auth.loginCta')}
        className="icon-button--topbar workspace-environment__auth-button"
        onClick={() => openAuth('/auth/login')}
      >
        <IconLogin />
      </IconButton>
      <IconButton
        label={t('auth.registerCta')}
        className="icon-button--topbar workspace-environment__auth-button workspace-environment__auth-button--primary"
        onClick={() => openAuth('/auth/register')}
      >
        <IconUserPlus />
      </IconButton>
    </div>
  );
}
