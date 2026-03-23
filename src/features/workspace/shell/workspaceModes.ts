import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { WorkspaceTab } from '@/features/workspace/requests';

export type WorkspaceModeKey = 'overview' | 'requests' | 'providers' | 'analysis' | 'actions';

type ResolveActiveWorkspaceModeArgs = {
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  pathname?: string | null;
  sectionParam?: string | null;
  hasExplicitWorkspaceTab?: boolean;
};

export function resolveActiveWorkspaceMode({
  activePublicSection,
  activeWorkspaceTab,
  pathname,
  sectionParam,
  hasExplicitWorkspaceTab = false,
}: ResolveActiveWorkspaceModeArgs): WorkspaceModeKey {
  if (activePublicSection === 'requests') return 'requests';
  if (activePublicSection === 'providers') return 'providers';
  if (activePublicSection === 'stats' || activePublicSection === 'reviews') return 'analysis';
  if (activePublicSection === 'profile') return 'actions';

  const isWorkspaceRoot = pathname === '/workspace';
  if (isWorkspaceRoot && sectionParam === 'overview') {
    return 'overview';
  }
  if (activeWorkspaceTab === 'my-requests' && isWorkspaceRoot && !hasExplicitWorkspaceTab && !sectionParam) {
    return 'overview';
  }
  if (activeWorkspaceTab === 'my-requests') return 'requests';

  if (activeWorkspaceTab === 'my-offers' || activeWorkspaceTab === 'completed-jobs') return 'requests';
  if (activeWorkspaceTab === 'reviews') return 'analysis';
  if (activeWorkspaceTab === 'favorites' || activeWorkspaceTab === 'profile') return 'actions';
  return 'overview';
}

export function isWorkspaceOverviewMode(args: ResolveActiveWorkspaceModeArgs) {
  return resolveActiveWorkspaceMode(args) === 'overview';
}
