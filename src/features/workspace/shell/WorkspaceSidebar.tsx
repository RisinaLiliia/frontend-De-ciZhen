'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { resolveActiveWorkspaceNavigationSection } from '@/features/workspace/navigation/resolveActiveWorkspaceNavigationSection';
import { resolveVisibleWorkspaceNavigationItems } from '@/features/workspace/navigation/workspaceNavigation.config';
import type { WorkspaceSidebarProps } from '@/features/workspace/shell/WorkspaceShell.types';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { WORKSPACE_MOBILE_NAV_OPEN_EVENT } from '@/lib/workspaceMobileNavigation';
import { useAuthMe, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';

export function WorkspaceSidebar(props: WorkspaceSidebarProps) {
  const {
    activePublicSection,
    activeWorkspaceTab,
    activeNavigationSection = null,
    className,
    onNavigate,
    showBrand = true,
    t,
    variant = 'static',
  } = props;
  const searchParams = useSearchParams();
  const authStatus = useAuthStatus();
  const authUser = useAuthUser();
  const authMe = useAuthMe();
  const activeSection =
    activeNavigationSection ??
    resolveActiveWorkspaceNavigationSection({
      sectionParam: searchParams.get('section'),
      activePublicSection,
      activeWorkspaceTab,
      requestsScope: searchParams.get('scope'),
      requestsRole: searchParams.get('role'),
      requestsState: searchParams.get('state'),
    });
  const visibleNavigationItems = resolveVisibleWorkspaceNavigationItems({
    isAuthed: authStatus === 'authenticated',
    role:
      authUser?.role === 'provider' ? 'provider' : authUser?.role === 'client' ? 'client' : null,
  });
  const primaryItems = visibleNavigationItems.filter((item) => item.group === 'main');
  const supportItems = visibleNavigationItems.filter((item) => item.group === 'support');
  const profileName = authMe?.name?.trim() || authUser?.name?.trim() || null;
  const profileInitial = (profileName?.charAt(0) ?? 'D').toUpperCase();
  const profileRole = authUser?.role === 'provider' ? 'Provider' : 'Client';
  const rootClassName = [
    'workspace-sidebar',
    variant === 'compact' ? 'workspace-sidebar--compact' : '',
    variant === 'drawer' ? 'workspace-sidebar--drawer' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={rootClassName} aria-label="Workspace navigation">
      {showBrand ? (
        variant === 'compact' ? (
          <button
            type="button"
            className="workspace-sidebar__brand workspace-sidebar__brand-toggle brand"
            aria-label={t(I18N_KEYS.auth.navigationLabel)}
            title="De’ciZhen"
            onClick={() => window.dispatchEvent(new Event(WORKSPACE_MOBILE_NAV_OPEN_EVENT))}
          >
            <Image src="/logo.svg" alt="" className="brand__logo" width={26} height={26} />
            <span className="brand__text truncate">De’ciZhen</span>
          </button>
        ) : (
          <Link
            href="/"
            prefetch={false}
            className="workspace-sidebar__brand brand"
            onClick={onNavigate}
          >
            <Image src="/logo.svg" alt="De’ciZhen" className="brand__logo" width={26} height={26} />
            <span className="brand__text truncate">De’ciZhen</span>
          </Link>
        )
      ) : null}

      <nav className="workspace-sidebar__nav" aria-label="Main workspace navigation">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.section === activeSection;

          return (
            <Link
              key={item.section}
              href={item.href}
              className={
                isActive
                  ? 'workspace-sidebar__item workspace-sidebar__item--active'
                  : 'workspace-sidebar__item'
              }
              title={variant === 'compact' ? item.label : undefined}
              aria-label={variant === 'compact' ? item.label : undefined}
              onClick={onNavigate}
            >
              <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
              {'badge' in item ? (
                <span className="workspace-sidebar__badge">{item.badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="workspace-sidebar__footer">
        {supportItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.section === activeSection;

          return (
            <Link
              key={item.section}
              href={item.href}
              className={
                isActive
                  ? 'workspace-sidebar__item workspace-sidebar__item--active'
                  : 'workspace-sidebar__item'
              }
              title={variant === 'compact' ? item.label : undefined}
              aria-label={variant === 'compact' ? item.label : undefined}
              onClick={onNavigate}
            >
              <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {authStatus === 'authenticated' ? (
          <div className="workspace-sidebar__account">
            <div className="workspace-sidebar__user">
              <div className="workspace-sidebar__avatar">{profileInitial}</div>
              <div>
                <strong>{profileName ?? 'De’ciZhen User'}</strong>
                <span>{profileRole}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
