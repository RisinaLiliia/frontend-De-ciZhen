'use client';

import { useQuery } from '@tanstack/react-query';

import type { buildWorkspaceDataQueries } from '@/features/workspace/data/workspaceData.queries';
import { resolveWorkspacePrivateOverviewState } from '@/features/workspace/state/workspacePrivateState.model';

type WorkspaceDataQueries = ReturnType<typeof buildWorkspaceDataQueries>;

type Args = {
  workspaceDataQueries: WorkspaceDataQueries;
};

export function useWorkspaceContractData({ workspaceDataQueries }: Args) {
  const {
    data: publicSummaryOverview,
    isLoading: isPublicSummaryLoading,
    isError: isPublicSummaryError,
  } = useQuery(workspaceDataQueries.publicSummary);
  const allRequestsSummary = publicSummaryOverview?.summary;
  const publicCityActivity = publicSummaryOverview?.cityActivity;

  const { data: workspacePrivateOverview } = useQuery(workspaceDataQueries.privateOverview);
  const {
    data: workspaceRequests,
    isLoading: isWorkspaceRequestsLoading,
    isError: isWorkspaceRequestsError,
  } = useQuery(workspaceDataQueries.workspaceRequests);

  return {
    allRequestsSummary,
    publicCityActivity,
    isPublicSummaryLoading,
    isPublicSummaryError,
    privateOverviewState: resolveWorkspacePrivateOverviewState(workspacePrivateOverview),
    workspaceRequests,
    isWorkspaceRequestsLoading,
    isWorkspaceRequestsError,
  };
}
