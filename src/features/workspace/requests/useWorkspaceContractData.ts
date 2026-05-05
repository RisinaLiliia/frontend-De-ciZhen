'use client';

import { useQuery } from '@tanstack/react-query';

import type { buildWorkspaceDataQueries } from '@/features/workspace/requests/workspaceData.queries';

type WorkspaceDataQueries = ReturnType<typeof buildWorkspaceDataQueries>;

type Args = {
  workspaceDataQueries: WorkspaceDataQueries;
  includePrivateOverview?: boolean;
  includePublicSummary?: boolean;
};

export function useWorkspaceContractData({
  workspaceDataQueries,
  includePrivateOverview = true,
  includePublicSummary = true,
}: Args) {
  const { data: publicOverview, isLoading, isError } = useQuery(workspaceDataQueries.publicOverview);
  const publicRequests = publicOverview?.requests;

  const {
    data: publicSummaryOverview,
    isLoading: isPublicSummaryLoading,
    isError: isPublicSummaryError,
  } = useQuery({
    ...workspaceDataQueries.publicSummary,
    enabled: workspaceDataQueries.publicSummary.enabled && includePublicSummary,
    queryFn: includePublicSummary
      ? workspaceDataQueries.publicSummary.queryFn
      : async () => null,
  });
  const allRequestsSummary = publicSummaryOverview?.summary;
  const publicCityActivity = publicSummaryOverview?.cityActivity;

  const {
    data: workspacePrivateOverview,
    isLoading: isWorkspacePrivateOverviewLoading,
  } = useQuery({
    ...workspaceDataQueries.privateOverview,
    enabled: workspaceDataQueries.privateOverview.enabled && includePrivateOverview,
    queryFn: includePrivateOverview
      ? workspaceDataQueries.privateOverview.queryFn
      : async () => null,
  });
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
    workspacePrivateOverview,
    isWorkspacePrivateOverviewLoading,
    workspaceRequests,
    isWorkspaceRequestsLoading,
    isWorkspaceRequestsError,
  };
}
