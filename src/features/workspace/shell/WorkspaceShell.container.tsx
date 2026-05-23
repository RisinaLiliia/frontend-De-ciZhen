'use client';

import * as React from 'react';

import WorkspacePageClient from '@/features/workspace/WorkspacePageClient';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuthSnapshot } from '@/hooks/useAuthSnapshot';
import { type WorkspaceTab } from '@/features/workspace/state';
import { shouldAttemptRefreshOnBootstrap } from '@/lib/auth/session';
import { useWorkspaceShellLegacyRouting } from '@/features/workspace/shell/useWorkspaceShellLegacyRouting';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';

type WorkspaceShellProps = {
  forcedPublicSection?: PublicWorkspaceSection | null;
  forcedWorkspaceTab?: WorkspaceTab | null;
};

export function WorkspaceShell({
  forcedPublicSection = null,
  forcedWorkspaceTab = null,
}: WorkspaceShellProps = {}) {
  const auth = useAuthSnapshot();
  const [bootstrapRefreshIntent, setBootstrapRefreshIntent] = React.useState(true);

  const {
    activePublicSection,
    resolvedPublicSection,
    isGuestChatSection,
  } = useWorkspaceShellLegacyRouting({
    authStatus: auth.status,
    forcedPublicSection,
    forcedWorkspaceTab,
  });

  React.useEffect(() => {
    setBootstrapRefreshIntent(shouldAttemptRefreshOnBootstrap());
  }, []);

  const shouldBlockOnAuthBootstrap = React.useMemo(() => {
    if (auth.status !== 'idle' && auth.status !== 'loading') return false;
    return bootstrapRefreshIntent;
  }, [auth.status, bootstrapRefreshIntent]);

  if (shouldBlockOnAuthBootstrap || isGuestChatSection) {
    return <LoadingScreen />;
  }

  return (
    <WorkspacePageClient
      activePublicSection={resolvedPublicSection}
      activeWorkspaceTab={forcedWorkspaceTab}
    />
  );
}
