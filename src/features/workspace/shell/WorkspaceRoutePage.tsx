'use client';

import { WorkspaceRouteShell } from '@/features/workspace/shell/WorkspaceRouteShell';
import type { WorkspaceTab } from '@/features/workspace/state';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';

type WorkspaceRoutePageProps = {
  forcedPublicSection?: PublicWorkspaceSection | null;
  forcedWorkspaceTab?: WorkspaceTab | null;
};

export function WorkspaceRoutePage({
  forcedPublicSection = null,
  forcedWorkspaceTab = null,
}: WorkspaceRoutePageProps = {}) {
  return (
    <div className="workspace-route-shell">
      <WorkspaceRouteShell
        forcedPublicSection={forcedPublicSection}
        forcedWorkspaceTab={forcedWorkspaceTab}
      />
    </div>
  );
}
