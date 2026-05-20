'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { resolveActiveWorkspaceNavigationSection } from '@/features/workspace/navigation/resolveActiveWorkspaceNavigationSection';
import { resolveVisibleWorkspaceNavigationItems } from '@/features/workspace/navigation/workspaceNavigation.config';
import type { WorkspaceNavigationSection } from '@/features/workspace/navigation/workspaceNavigation.config';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceTab } from '@/features/workspace/state';
import { useAuthMe, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';

type WorkspaceSidebarProps = {
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  preferredRequestsRole?: 'customer' | 'provider' | null;
  activeNavigationSection?: WorkspaceNavigationSection | null;
};

export function WorkspaceSidebar({
  activePublicSection,
  activeWorkspaceTab,
  activeNavigationSection = null,
}: WorkspaceSidebarProps) {
  const searchParams = useSearchParams();
  const authStatus = useAuthStatus();
  const authUser = useAuthUser();
  const authMe = useAuthMe();
  const activeSection = activeNavigationSection ?? resolveActiveWorkspaceNavigationSection({
    sectionParam: searchParams.get('section'),
    activePublicSection,
    activeWorkspaceTab,
    requestsScope: searchParams.get('scope'),
    requestsRole: searchParams.get('role'),
    requestsState: searchParams.get('state'),
  });
  const visibleNavigationItems = resolveVisibleWorkspaceNavigationItems(authStatus === 'authenticated');
  const primaryItems = visibleNavigationItems.filter((item) => item.group === 'main');
  const supportItems = visibleNavigationItems.filter((item) => item.group === 'support');
  const profileName = authMe?.name?.trim() || authUser?.name?.trim() || null;
  const profileInitial = (profileName?.charAt(0) ?? 'D').toUpperCase();
  const profileRole = authUser?.role === 'provider' ? 'Provider' : 'Client';

  return (
    <aside className="workspace-sidebar" aria-label="Workspace navigation">
      <Link href="/" prefetch={false} className="workspace-sidebar__brand brand">
        <Image src="/logo.svg" alt="De’ciZhen" className="brand__logo" width={26} height={26} />
        <span className="brand__text truncate">De’ciZhen</span>
      </Link>

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
