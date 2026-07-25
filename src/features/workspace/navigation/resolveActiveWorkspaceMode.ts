import type {
  PublicWorkspaceSection,
  WorkspaceSection,
} from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceTab } from '@/features/workspace/state';

export type WorkspaceModeKey = 'overview' | 'requests' | 'providers' | 'analysis' | 'profile' | 'chat';

type ResolveActiveWorkspaceModeArgs = {
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  pathname?: string | null;
  routeSection?: WorkspaceSection | null;
  hasExplicitWorkspaceTab?: boolean;
};

export function resolveActiveWorkspaceMode({
  activePublicSection,
  activeWorkspaceTab,
  pathname,
  routeSection,
  hasExplicitWorkspaceTab = false,
}: ResolveActiveWorkspaceModeArgs): WorkspaceModeKey {
  if (activePublicSection === 'requests') return 'requests';
  if (activePublicSection === 'providers') return 'providers';
  if (activePublicSection === 'reviews') return 'analysis';
  if (activePublicSection === 'stats') return 'analysis';
  if (activePublicSection === 'actions') return 'profile';
  if (activePublicSection === 'profile') return 'profile';
  if (activePublicSection === 'chat') return 'chat';

  const isWorkspaceRoot = pathname === '/workspace';
  if (isWorkspaceRoot && routeSection === 'overview') {
    return 'overview';
  }
  if (activeWorkspaceTab === 'my-requests' && isWorkspaceRoot && !hasExplicitWorkspaceTab && !routeSection) {
    return 'overview';
  }
  if (activeWorkspaceTab === 'my-requests') return 'requests';

  if (activeWorkspaceTab === 'my-offers' || activeWorkspaceTab === 'completed-jobs') return 'requests';
  if (activeWorkspaceTab === 'reviews') return 'analysis';
  if (activeWorkspaceTab === 'favorites' || activeWorkspaceTab === 'profile') return 'profile';
  return 'overview';
}

export function isWorkspaceOverviewMode(args: ResolveActiveWorkspaceModeArgs) {
  return resolveActiveWorkspaceMode(args) === 'overview';
}
