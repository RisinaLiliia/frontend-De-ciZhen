'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';

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
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';

const LOGIN_CHAT_URL = '/auth/login?next=%2Fchat';
const AUTH_PROFILE_FALLBACK_URL = '/profile';

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
  const activeSection = resolveActiveWorkspaceNavigationSection({
    sectionParam: searchParams.get('section'),
    activePublicSection,
    activeWorkspaceTab,
    requestsScope: searchParams.get('scope'),
    requestsRole: searchParams.get('role'),
    requestsState: searchParams.get('state'),
  });
  const isAuthenticated = authStatus === 'authenticated';
  const chatHref = isAuthenticated ? '/workspace?section=chat' : LOGIN_CHAT_URL;
  const profileHref = isAuthenticated ? '/workspace?section=profile' : AUTH_PROFILE_FALLBACK_URL;
  const isCreateOverlayActive = searchParams.get('requestCreate') === '1';
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
          <header className="workspace-navigation-drawer__header">
            <h2 id={titleId} className="workspace-navigation-drawer__title">{t(I18N_KEYS.auth.workspaceLabel)}</h2>
            <button
              ref={closeButtonRef}
              type="button"
              className="workspace-navigation-drawer__close"
              aria-label={t(I18N_KEYS.auth.closeDialog)}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>
          <WorkspaceSidebar
            t={t}
            locale={locale}
            activePublicSection={activePublicSection}
            activeWorkspaceTab={activeWorkspaceTab}
            preferredRequestsRole={preferredRequestsRole}
            variant="drawer"
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
            <header className="workspace-navigation-drawer__header">
              <h2 id={titleId} className="workspace-navigation-drawer__title">{t(I18N_KEYS.auth.workspaceLabel)}</h2>
              <button
                ref={closeButtonRef}
                type="button"
                className="workspace-navigation-drawer__close"
                aria-label={t(I18N_KEYS.auth.closeDialog)}
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </header>
            <WorkspaceSidebar
              t={t}
              locale={locale}
              activePublicSection={activePublicSection}
              activeWorkspaceTab={activeWorkspaceTab}
              preferredRequestsRole={preferredRequestsRole}
              variant="drawer"
              onNavigate={() => setOpen(false)}
            />
          </section>
        </div>
      ) : null}
    </>
  );
}
