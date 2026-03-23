'use client';

import type { useWorkspacePublicState } from '@/features/workspace/requests';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import type { buildWorkspacePublicExploreWithSeed, resolveWorkspacePublicBranchSnapshot } from '@/features/workspace/page/workspacePublicBranch.model';

type WorkspacePublicStateResult = ReturnType<typeof useWorkspacePublicState>;
type WorkspacePublicSnapshotResult = ReturnType<typeof resolveWorkspacePublicBranchSnapshot>;
type WorkspacePublicExploreWithSeedResult = ReturnType<typeof buildWorkspacePublicExploreWithSeed>;

type ResolveWorkspacePublicDataFlowResultArgs = {
  routeState: Pick<
    WorkspaceBranchProps['routeState'],
    | 'activePublicSection'
    | 'activeWorkspaceTab'
  >;
  snapshot: WorkspacePublicSnapshotResult;
  localeTag: string;
  exploreWithSeed: WorkspacePublicExploreWithSeedResult;
  isSummaryLoading: boolean;
  isSummaryError: boolean;
  publicState: WorkspacePublicStateResult;
};

export function resolveWorkspacePublicDataFlowResult({
  routeState,
  snapshot,
  localeTag,
  exploreWithSeed,
  isSummaryLoading,
  isSummaryError,
  publicState,
}: ResolveWorkspacePublicDataFlowResultArgs) {
  return {
    activePublicSection: routeState.activePublicSection,
    activeWorkspaceTab: routeState.activeWorkspaceTab,
    platformRequestsTotal: snapshot.platformRequestsTotal,
    localeTag,
    exploreWithSeed,
    cityActivity: snapshot.cityActivity,
    platformSummary: snapshot.platformSummary,
    isSummaryLoading,
    isSummaryError,
    ...publicState,
  };
}
