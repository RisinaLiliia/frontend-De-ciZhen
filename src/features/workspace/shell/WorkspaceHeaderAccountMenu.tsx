'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, CircleHelp, CreditCard, Bell } from 'lucide-react';

import { Popover } from '@/components/ui/Popover';
import { IconChat, IconLogout, IconSettings, IconUser } from '@/components/ui/icons/icons';
import { DEFAULT_PUBLIC_WORKSPACE_URL } from '@/features/auth/constants';
import { useAuthLogout, useAuthMe, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';

function getAccountMenuCopy(locale: string) {
  if (locale === 'en') {
    return {
      roleClient: 'Client',
      roleProvider: 'Provider',
      roleAdmin: 'Admin',
      billing: 'Billing & plan',
      help: 'Help',
      notifications: 'Notifications',
      unavailable: 'Coming soon',
    };
  }

  return {
    roleClient: 'Auftraggeber',
    roleProvider: 'Anbieter',
    roleAdmin: 'Admin',
    billing: 'Abrechnung & Abo',
    help: 'Hilfe',
    notifications: 'Benachrichtigungen',
    unavailable: 'Bald verfügbar',
  };
}

export function WorkspaceHeaderAccountMenu({
  className,
  triggerVariant = 'topbar',
  dockLabel,
  active = false,
}: {
  className?: string;
  triggerVariant?: 'topbar' | 'mobileDock';
  dockLabel?: string;
  active?: boolean;
} = {}) {
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const authStatus = useAuthStatus();
  const authUser = useAuthUser();
  const authMe = useAuthMe();
  const logout = useAuthLogout();
  const [open, setOpen] = React.useState(false);
  const copy = getAccountMenuCopy(locale);

  const profileName = authMe?.name?.trim() || authUser?.name?.trim() || 'De’ciZhen User';
  const profileInitial = profileName.charAt(0).toUpperCase() || 'D';
  const profileRole =
    authUser?.role === 'provider'
      ? copy.roleProvider
      : authUser?.role === 'client'
        ? copy.roleClient
        : copy.roleAdmin;

  const onLogout = React.useCallback(async () => {
    setOpen(false);
    await logout();
    if (typeof window !== 'undefined') {
      window.location.assign(DEFAULT_PUBLIC_WORKSPACE_URL);
      return;
    }
    router.replace(DEFAULT_PUBLIC_WORKSPACE_URL);
  }, [logout, router]);

  if (authStatus !== 'authenticated') {
    return null;
  }

  const isMobileDockTrigger = triggerVariant === 'mobileDock';
  const trigger = isMobileDockTrigger ? (
    <span className={['workspace-mobile-dock__profile-trigger', active || open ? 'is-active' : ''].filter(Boolean).join(' ')}>
      <span className="workspace-account-menu__avatar workspace-account-menu__avatar--dock" aria-hidden="true">
        {profileInitial}
      </span>
      {dockLabel ? <span className="workspace-mobile-dock__label workspace-mobile-dock__profile-label">{dockLabel}</span> : null}
    </span>
  ) : (
    <span className="workspace-account-menu__trigger-surface">
      <span className="workspace-account-menu__avatar" aria-hidden="true">
        {profileInitial}
      </span>
      <ChevronDown size={16} strokeWidth={1.9} aria-hidden="true" />
    </span>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      className={[
        'workspace-account-menu',
        isMobileDockTrigger ? 'workspace-account-menu--mobile-dock' : '',
        className,
      ].filter(Boolean).join(' ')}
      trigger={trigger}
    >
      <div className="workspace-account-menu__panel">
        <div className="workspace-account-menu__summary">
          <div className="workspace-account-menu__avatar workspace-account-menu__avatar--large" aria-hidden="true">
            {profileInitial}
          </div>
          <div className="workspace-account-menu__summary-copy">
            <strong>{profileName}</strong>
            <span>{profileRole}</span>
          </div>
        </div>

        <nav className="workspace-account-menu__nav" aria-label={t(I18N_KEYS.auth.profileLabel)}>
          <Link href="/workspace?section=profile" className="workspace-account-menu__item" onClick={() => setOpen(false)}>
            <IconUser />
            <span>{t(I18N_KEYS.auth.profileLabel)}</span>
          </Link>
          <Link href="/workspace?section=settings" className="workspace-account-menu__item" onClick={() => setOpen(false)}>
            <IconSettings />
            <span>{t(I18N_KEYS.client.settingsTitle)}</span>
          </Link>
          <Link href="/workspace?section=settings#billing" className="workspace-account-menu__item" onClick={() => setOpen(false)}>
            <CreditCard size={16} strokeWidth={1.9} />
            <span>{copy.billing}</span>
          </Link>
          <Link href="/workspace?section=chat" className="workspace-account-menu__item" onClick={() => setOpen(false)}>
            <IconChat />
            <span>{t(I18N_KEYS.requestsPage.navChat)}</span>
          </Link>
          <Link href="/workspace?section=help" className="workspace-account-menu__item" onClick={() => setOpen(false)}>
            <CircleHelp size={16} strokeWidth={1.9} />
            <span>{copy.help}</span>
          </Link>
        </nav>

        <div className="workspace-account-menu__divider" />

        <button
          type="button"
          className="workspace-account-menu__item workspace-account-menu__item--danger"
          onClick={onLogout}
        >
          <IconLogout />
          <span>{t(I18N_KEYS.auth.logoutLabel)}</span>
        </button>
      </div>
    </Popover>
  );
}

export function WorkspaceHeaderNotificationsButton({ className }: { className?: string } = {}) {
  const { locale } = useI18n();
  const copy = getAccountMenuCopy(locale);

  return (
    <button
      type="button"
      className={['workspace-environment__utility-icon', className].filter(Boolean).join(' ')}
      aria-label={copy.notifications}
      title={copy.unavailable}
    >
      <Bell size={16} strokeWidth={1.9} aria-hidden="true" />
    </button>
  );
}
