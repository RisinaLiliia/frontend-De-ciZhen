'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Menu } from 'lucide-react';

import { resolveActiveWorkspaceNavigationSection } from '@/features/workspace/navigation/resolveActiveWorkspaceNavigationSection';
import { resolveVisibleWorkspaceNavigationItems } from '@/features/workspace/navigation/workspaceNavigation.config';
import type { WorkspaceBottomNavProps } from '@/features/workspace/shell/WorkspaceShell.types';
import { WorkspaceSidebar } from '@/features/workspace/shell/WorkspaceSidebar';
import { useWorkspaceMobileSectionSheet } from '@/features/workspace/shell/useWorkspaceMobileSectionSheet';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';
import { useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';

export function WorkspaceBottomNav({
  mode,
  activePublicSection,
  activeWorkspaceTab,
  locale,
  preferredRequestsRole = null,
}: WorkspaceBottomNavProps) {
  const t = useT();
  const { open, setOpen, panelRef, closeButtonRef } = useWorkspaceMobileSectionSheet();
  const titleId = React.useId();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const authStatus = useAuthStatus();
  const authUser = useAuthUser();
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
  const visibleNavigationItems = resolveVisibleWorkspaceNavigationItems({
    isAuthed: authStatus === 'authenticated',
    role: authUser?.role === 'provider' ? 'provider' : authUser?.role === 'client' ? 'client' : null,
  });
  const preferredSections = ['overview', 'requests', 'stats', 'profile'] as const;
  const dockItems = preferredSections
    .map((section) => visibleNavigationItems.find((item) => item.section === section))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

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
      <nav className="workspace-bottom-nav" aria-label={t(I18N_KEYS.auth.navigationLabel)}>
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.section === activeSection;

          return (
            <Link
              key={item.section}
              href={item.href}
              className={['workspace-bottom-nav__item', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
            >
              <span className="workspace-bottom-nav__icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.9} />
              </span>
              <span className="workspace-bottom-nav__label">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className={['workspace-bottom-nav__item', open ? 'is-active' : ''].filter(Boolean).join(' ')}
          aria-label={t(I18N_KEYS.auth.navigationLabel)}
          onClick={() => setOpen(true)}
        >
          <span className="workspace-bottom-nav__icon" aria-hidden="true">
            <Menu size={18} strokeWidth={1.9} />
          </span>
          <span className="workspace-bottom-nav__label">Mehr</span>
        </button>
      </nav>

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
