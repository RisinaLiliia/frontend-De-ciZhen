'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { resolveActiveWorkspaceNavigationSection } from '@/features/workspace/navigation/resolveActiveWorkspaceNavigationSection';
import {
  resolveVisibleWorkspaceNavigationItems,
} from '@/features/workspace/navigation/workspaceNavigation.config';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import { useIsDesktop } from '@/features/workspace/shared';
import { WorkspaceHeaderUtilityBar } from '@/features/workspace/shell/WorkspaceHeaderUtilityBar';
import type { WorkspaceTab } from '@/features/workspace/state';
import { useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';
import { WORKSPACE_MOBILE_NAV_OPEN_EVENT } from '@/lib/workspaceMobileNavigation';

type WorkspaceTopBarProps = {
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  activeNavigationSection?: string | null;
};

export function WorkspaceTopBar({
  activePublicSection,
  activeWorkspaceTab,
  activeNavigationSection = null,
}: WorkspaceTopBarProps) {
  const t = useT();
  const searchParams = useSearchParams();
  const authStatus = useAuthStatus();
  const authUser = useAuthUser();
  const isDesktop = useIsDesktop();
  const activeSection = activeNavigationSection ?? resolveActiveWorkspaceNavigationSection({
    sectionParam: searchParams.get('section'),
    activePublicSection,
    activeWorkspaceTab,
    requestsScope: searchParams.get('scope'),
    requestsRole: searchParams.get('role'),
    requestsState: searchParams.get('state'),
  });
  const navigationItems = resolveVisibleWorkspaceNavigationItems({
    isAuthed: authStatus === 'authenticated',
    role: authUser?.role === 'provider' ? 'provider' : authUser?.role === 'client' ? 'client' : null,
  });
  const activeItem = navigationItems.find((item) => item.section === activeSection) ?? null;

  return (
    <header className="workspace-topbar" aria-label={t(I18N_KEYS.auth.workspaceLabel)}>
      <div className="workspace-topbar__identity">
        <button
          type="button"
          className="workspace-topbar__menu"
          aria-label={t(I18N_KEYS.auth.navigationLabel)}
          onClick={() => window.dispatchEvent(new Event(WORKSPACE_MOBILE_NAV_OPEN_EVENT))}
        >
          <Menu size={18} strokeWidth={1.9} />
        </button>

        <div className="workspace-topbar__copy">
          <span className="workspace-topbar__eyebrow">{t(I18N_KEYS.auth.workspaceLabel)}</span>
          <strong className="workspace-topbar__title">
            {activeItem?.label ?? t(I18N_KEYS.auth.workspaceLabel)}
          </strong>
        </div>
      </div>

      <WorkspaceHeaderUtilityBar compact={!isDesktop} className="workspace-topbar__utility" />
    </header>
  );
}
