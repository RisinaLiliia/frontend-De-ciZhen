'use client';

import type { WorkspaceNavigationSection } from '@/features/workspace/navigation/workspaceNavigation.config';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceTab } from '@/features/workspace/state';

type ResolveActiveWorkspaceNavigationSectionArgs = {
  sectionParam: string | null;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  requestsScope: string | null;
  requestsRole: string | null;
  requestsState: string | null;
};

export function resolveActiveWorkspaceNavigationSection({
  sectionParam,
  activePublicSection,
  activeWorkspaceTab,
  requestsScope,
  requestsRole,
  requestsState,
}: ResolveActiveWorkspaceNavigationSectionArgs): WorkspaceNavigationSection {
  if (sectionParam === 'overview') return 'overview';

  if (activePublicSection === 'requests') {
    if (requestsScope === 'my' && requestsRole === 'provider') return 'offers';
    if (requestsScope === 'my' && requestsState === 'execution') return 'contracts';
    return 'requests';
  }

  if (
    activePublicSection === 'providers'
    || activePublicSection === 'stats'
    || activePublicSection === 'chat'
    || activePublicSection === 'profile'
    || activePublicSection === 'settings'
    || activePublicSection === 'help'
  ) {
    return activePublicSection;
  }

  if (activeWorkspaceTab === 'my-offers') return 'offers';
  if (activeWorkspaceTab === 'completed-jobs') return 'contracts';
  if (activeWorkspaceTab === 'reviews') return 'stats';
  if (activeWorkspaceTab === 'profile') return 'profile';

  return 'overview';
}
