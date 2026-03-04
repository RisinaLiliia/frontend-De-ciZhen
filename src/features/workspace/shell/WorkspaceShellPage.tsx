'use client';

import { AuthActions } from '@/components/layout/AuthActions';
import { PageShell } from '@/components/layout/PageShell';
import { WorkspaceShell } from '@/features/workspace/shell/WorkspaceShell.container';
import type { WorkspaceTab } from '@/features/workspace/requests';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';

type WorkspaceShellPageProps = {
  forcedPublicSection?: PublicWorkspaceSection | null;
  forcedWorkspaceTab?: WorkspaceTab | null;
};

export function WorkspaceShellPage({
  forcedPublicSection = null,
  forcedWorkspaceTab = null,
}: WorkspaceShellPageProps = {}) {
  return (
    <PageShell
      right={<AuthActions />}
      showBack={false}
      topbarOverlay={true}
      mainClassName="pb-6 requests-screen"
      withSpacer={true}
    >
      <WorkspaceShell
        forcedPublicSection={forcedPublicSection}
        forcedWorkspaceTab={forcedWorkspaceTab}
      />
    </PageShell>
  );
}
