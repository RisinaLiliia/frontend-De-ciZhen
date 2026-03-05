'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import { useAuthSnapshot } from '@/hooks/useAuthSnapshot';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { useWorkspaceRouteState } from '@/features/workspace';
import {
  WORKSPACE_PATH,
  type WorkspaceBranchProps,
  WorkspacePrivateBranch,
  WorkspacePublicBranch,
} from '@/features/workspace/page/WorkspacePageBranches';
import {
  type PublicWorkspaceSection,
  type WorkspaceTab,
} from '@/features/workspace';

type WorkspacePageClientProps = {
  activePublicSection?: PublicWorkspaceSection | null;
  activeWorkspaceTab?: WorkspaceTab | null;
};

function WorkspacePageView({
  activePublicSection: forcedPublicSection,
  activeWorkspaceTab: forcedWorkspaceTab,
}: WorkspacePageClientProps) {
  const searchParams = useSearchParams();
  const t = useT();
  const { locale } = useI18n();
  const auth = useAuthSnapshot();
  const isAuthed = auth.status === 'authenticated';
  const isWorkspaceAuthed = isAuthed;
  const isPersonalized = isAuthed;

  const routeState = useWorkspaceRouteState({
    forcedPublicSection,
    forcedWorkspaceTab,
    searchParams,
    workspacePath: WORKSPACE_PATH,
    t,
  });

  const sharedProps: WorkspaceBranchProps = {
    t,
    locale,
    auth,
    isAuthed,
    isWorkspaceAuthed,
    isPersonalized,
    routeState,
  };

  if (routeState.isWorkspacePublicSection) {
    return <WorkspacePublicBranch {...sharedProps} />;
  }

  return <WorkspacePrivateBranch {...sharedProps} />;
}

export default function WorkspacePageClient(props: WorkspacePageClientProps) {
  return (
    <React.Suspense fallback={null}>
      <WorkspacePageView {...props} />
    </React.Suspense>
  );
}
