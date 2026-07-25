'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Bell, Menu, X } from 'lucide-react';

import {
  WorkspaceNavigationDock,
  type WorkspaceNavigationDockItem,
} from '@/components/layout/workspace-navigation';
import { IconChat, IconPlus, IconUser } from '@/components/ui/icons/icons';
import { resolveActiveWorkspaceNavigationSection } from '@/features/workspace/navigation/resolveActiveWorkspaceNavigationSection';
import { DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF } from '@/features/workspace/requests/workspaceRequestRoute.model';
import { WorkspaceHeaderAccountMenu } from '@/features/workspace/shell/WorkspaceHeaderAccountMenu';
import type { WorkspaceMobileNavigationProps } from '@/features/workspace/shell/WorkspaceShell.types';
import { WorkspaceSidebar } from '@/features/workspace/shell/WorkspaceSidebar';
import { useWorkspaceMobileSectionSheet } from '@/features/workspace/shell/useWorkspaceMobileSectionSheet';
import { resolveWorkspaceRouteCompatibility } from '@/features/workspace/navigation/workspaceRouteCompatibility';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';

const LOGIN_CHAT_URL = '/auth/login?next=%2Fchat';
const AUTH_PROFILE_FALLBACK_URL = '/workspace?section=profile';

function getMobileDockCopy(locale: string) {
  if (locale === 'en') {
    return {
      dashboard: 'Dashboard',
      create: 'Create',
      notifications: 'Alerts',
      profile: 'Profile',
      unavailable: 'Coming soon',
    };
  }

  return {
    dashboard: 'Dashboard',
    create: 'Anfrage',
    notifications: 'Hinweise',
    profile: 'Profil',
    unavailable: 'Bald verfugbar',
  };
}

export function WorkspaceMobileNavigation({
  mode,
  activePublicSection,
  activeWorkspaceTab,
  locale,
  preferredRequestsRole = null,
}: WorkspaceMobileNavigationProps) {
  const t = useT();
  const { open, setOpen, panelRef, closeButtonRef } = useWorkspaceMobileSectionSheet();
  const titleId = React.useId();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const authStatus = useAuthStatus();
  const copy = getMobileDockCopy(locale);
  const routeSignature = `${pathname}?${searchParams.toString()}`;
  const previousRouteRef = React.useRef(routeSignature);
  const routeCompatibility = resolveWorkspaceRouteCompatibility({
    searchParams,
    authStatus,
  });
  const activeSection = resolveActiveWorkspaceNavigationSection({
    routeSection: routeCompatibility.routeSection,
    activePublicSection,
    activeWorkspaceTab,
    requestsScope: routeCompatibility.canonicalSearchParams.get('scope'),
    requestsRole: routeCompatibility.canonicalSearchParams.get('role'),
    requestsState: routeCompatibility.canonicalSearchParams.get('state'),
  });
  const isAuthenticated = authStatus === 'authenticated';
  const chatHref = isAuthenticated ? '/workspace?section=chat' : LOGIN_CHAT_URL;
  const profileHref = isAuthenticated ? '/workspace?section=profile' : AUTH_PROFILE_FALLBACK_URL;
  const isCreateOverlayActive = searchParams.get('mode') === 'create'
    || searchParams.get('requestCreate') === '1';
  const dockItems: WorkspaceNavigationDockItem[] = [
    {
      key: 'dashboard',
      label: copy.dashboard,
      icon: <Menu size={18} strokeWidth={1.9} />,
      onClick: () => setOpen(true),
      active: open,
    },
    {
      key: 'chat',
      label: t(I18N_KEYS.requestsPage.navChat),
      icon: <IconChat />,
      href: chatHref,
      active: activeSection === 'chat',
    },
    {
      key: 'request-create',
      label: copy.create,
      icon: <IconPlus />,
      href: DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF,
      variant: 'primary' as const,
      active: activeSection === 'requests' && isCreateOverlayActive,
    },
    {
      key: 'notifications',
      label: copy.notifications,
      icon: <Bell size={18} strokeWidth={1.9} />,
      title: copy.unavailable,
    },
  ];

  if (isAuthenticated) {
    dockItems.push({
      key: 'profile-menu',
      label: copy.profile,
      icon: <IconUser />,
      active: activeSection === 'profile',
      render: (
        <WorkspaceHeaderAccountMenu
          triggerVariant="mobileDock"
          dockLabel={copy.profile}
          active={activeSection === 'profile'}
        />
      ),
    });
  } else {
    dockItems.push({
      key: 'profile',
      label: copy.profile,
      icon: <IconUser />,
      href: profileHref,
      active: activeSection === 'profile',
    });
  }

  React.useEffect(() => {
    if (previousRouteRef.current !== routeSignature && open) {
      setOpen(false);
    }
    previousRouteRef.current = routeSignature;
  }, [open, routeSignature, setOpen]);

  const drawerHeader = (
    <header className="workspace-navigation-drawer__header">
      <Link
        href="/"
        prefetch={false}
        className="workspace-navigation-drawer__brand brand"
        onClick={() => setOpen(false)}
      >
        <Image src="/logo.svg" alt="De’ciZhen" className="brand__logo" width={26} height={26} />
        <span id={titleId} className="brand__text truncate">De’ciZhen</span>
      </Link>
      <button
        ref={closeButtonRef}
        type="button"
        className="workspace-navigation-drawer__close"
        aria-label={t(I18N_KEYS.auth.closeDialog)}
        onClick={() => setOpen(false)}
      >
        <X aria-hidden="true" size={18} strokeWidth={1.9} />
      </button>
    </header>
  );

  if (mode === 'drawer') {
    return open ? (
      <div className="workspace-navigation-drawer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button
          type="button"
          className="workspace-navigation-drawer__backdrop"
          aria-label={t(I18N_KEYS.auth.closeDialog)}
          onClick={() => setOpen(false)}
        />
        <section ref={panelRef} className="workspace-navigation-drawer__surface">
          {drawerHeader}
          <WorkspaceSidebar
            t={t}
            locale={locale}
            activePublicSection={activePublicSection}
            activeWorkspaceTab={activeWorkspaceTab}
            preferredRequestsRole={preferredRequestsRole}
            variant="drawer"
            showBrand={false}
            onNavigate={() => setOpen(false)}
          />
        </section>
      </div>
    ) : null;
  }

  return (
    <>
      <WorkspaceNavigationDock items={dockItems} ariaLabel={t(I18N_KEYS.auth.navigationLabel)} />

      {open ? (
        <div className="workspace-navigation-drawer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button
            type="button"
            className="workspace-navigation-drawer__backdrop"
            aria-label={t(I18N_KEYS.auth.closeDialog)}
            onClick={() => setOpen(false)}
          />
          <section ref={panelRef} className="workspace-navigation-drawer__surface">
            {drawerHeader}
            <WorkspaceSidebar
              t={t}
              locale={locale}
              activePublicSection={activePublicSection}
              activeWorkspaceTab={activeWorkspaceTab}
              preferredRequestsRole={preferredRequestsRole}
              variant="drawer"
              showBrand={false}
              onNavigate={() => setOpen(false)}
            />
          </section>
        </div>
      ) : null}
    </>
  );
}
