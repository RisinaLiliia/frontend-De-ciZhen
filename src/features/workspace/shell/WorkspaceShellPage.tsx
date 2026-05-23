'use client';

import { WorkspaceShell } from '@/features/workspace/shell/WorkspaceShell.container';
import type { WorkspaceTab } from '@/features/workspace/state';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';

type WorkspaceShellPageProps = {
  forcedPublicSection?: PublicWorkspaceSection | null;
  forcedWorkspaceTab?: WorkspaceTab | null;
};

export function WorkspaceShellPage({
  forcedPublicSection = null,
  forcedWorkspaceTab = null,
}: WorkspaceShellPageProps = {}) {
  return (
    <div className="workspace-route-shell">
      <WorkspaceShell
        forcedPublicSection={forcedPublicSection}
        forcedWorkspaceTab={forcedWorkspaceTab}
      />
    </div>
  );
}
