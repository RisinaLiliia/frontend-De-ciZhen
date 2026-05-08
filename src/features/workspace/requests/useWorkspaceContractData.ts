'use client';

import { useQuery } from '@tanstack/react-query';

import type { buildWorkspaceDataQueries } from '@/features/workspace/requests/workspaceData.queries';
import { resolveWorkspacePrivateOverviewState } from '@/features/workspace/requests/workspacePrivateState.model';

type WorkspaceDataQueries = ReturnType<typeof buildWorkspaceDataQueries>;

type Args = {
  workspaceDataQueries: WorkspaceDataQueries;
};

export function useWorkspaceContractData({ workspaceDataQueries }: Args) {
  const { data: publicOverview, isLoading, isError } = useQuery(workspaceDataQueries.publicOverview);
  const publicRequests = publicOverview?.requests;

  const {
    data: publicSummaryOverview,
    isLoading: isPublicSummaryLoading,
    isError: isPublicSummaryError,
  } = useQuery(workspaceDataQueries.publicSummary);
  const allRequestsSummary = publicSummaryOverview?.summary;
  const publicCityActivity = publicSummaryOverview?.cityActivity;

  const {
    data: workspacePrivateOverview,
    isLoading: isWorkspacePrivateOverviewLoading,
  } = useQuery(workspaceDataQueries.privateOverview);
  const {
    data: workspaceRequests,
    isLoading: isWorkspaceRequestsLoading,
    isError: isWorkspaceRequestsError,
  } = useQuery(workspaceDataQueries.workspaceRequests);

  return {
    publicRequests,
    isLoading,
    isError,
    allRequestsSummary,
    publicCityActivity,
    isPublicSummaryLoading,
    isPublicSummaryError,
    privateOverviewState: resolveWorkspacePrivateOverviewState(workspacePrivateOverview),
    isWorkspacePrivateOverviewLoading,
    isWorkspacePrivateRequestsFallbackLoading:
      !workspaceRequests && isWorkspacePrivateOverviewLoading,
    workspaceRequests,
    isWorkspaceRequestsLoading,
    isWorkspaceRequestsError,
  };
}
