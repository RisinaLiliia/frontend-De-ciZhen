'use client';

import { useQuery } from '@tanstack/react-query';

import type { buildWorkspaceDataQueries } from '@/features/workspace/requests/workspaceData.queries';

type WorkspaceDataQueries = ReturnType<typeof buildWorkspaceDataQueries>;

type Args = {
  workspaceDataQueries: WorkspaceDataQueries;
};

export function useWorkspaceLegacyRequestSupportData({ workspaceDataQueries }: Args) {
  const { data: favoriteRequests = [], isLoading: isFavoriteRequestsLoading } = useQuery(
    workspaceDataQueries.favoriteRequests,
  );

  const { data: myReviews = [], isLoading: isMyReviewsLoading } = useQuery(workspaceDataQueries.myReviews);
  const { data: myRequests = [], isLoading: isMyRequestsLoading } = useQuery(workspaceDataQueries.myRequests);

  const { data: myProviderContracts = [], isLoading: isProviderContractsLoading } = useQuery(
    workspaceDataQueries.myProviderContracts,
  );

  const { data: myClientContracts = [], isLoading: isClientContractsLoading } = useQuery(
    workspaceDataQueries.myClientContracts,
  );

  return {
    favoriteRequests,
    isFavoriteRequestsLoading,
    myReviews,
    isMyReviewsLoading,
    myRequests,
    isMyRequestsLoading,
    myProviderContracts,
    isProviderContractsLoading,
    myClientContracts,
    isClientContractsLoading,
  };
}
