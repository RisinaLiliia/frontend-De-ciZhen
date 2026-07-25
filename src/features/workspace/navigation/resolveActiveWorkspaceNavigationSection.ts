'use client';

import type { WorkspaceNavigationSection } from '@/features/workspace/navigation/workspaceNavigation.config';
import type {
  PublicWorkspaceSection,
  WorkspaceSection,
} from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceTab } from '@/features/workspace/state';

type ResolveActiveWorkspaceNavigationSectionArgs = {
  routeSection: WorkspaceSection | null;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  requestsScope: string | null;
  requestsRole: string | null;
  requestsState: string | null;
};

export function resolveActiveWorkspaceNavigationSection({
  routeSection,
  activePublicSection,
  activeWorkspaceTab,
  requestsScope,
  requestsRole,
  requestsState,
}: ResolveActiveWorkspaceNavigationSectionArgs): WorkspaceNavigationSection {
  if (activePublicSection === 'overview') return 'overview';
  if (routeSection === 'overview') return 'overview';

  if (activePublicSection === 'requests') {
    if (requestsScope === 'my' && requestsRole === 'provider') return 'offers';
    if (requestsScope === 'my' && requestsState === 'execution') return 'contracts';
    return 'requests';
  }

  if (
    activePublicSection === 'providers'
    || activePublicSection === 'reviews'
    || activePublicSection === 'stats'
    || activePublicSection === 'chat'
    || activePublicSection === 'profile'
    || activePublicSection === 'settings'
    || activePublicSection === 'help'
  ) {
    return activePublicSection === 'reviews' ? 'stats' : activePublicSection;
  }

  if (activePublicSection === 'actions') {
    return 'profile';
  }

  if (activePublicSection === 'privacy' || activePublicSection === 'cookies') {
    return 'help';
  }

  if (activeWorkspaceTab === 'my-offers') return 'offers';
  if (activeWorkspaceTab === 'completed-jobs') return 'contracts';
  if (activeWorkspaceTab === 'reviews') return 'stats';
  if (activeWorkspaceTab === 'profile') return 'profile';

  return 'overview';
}
