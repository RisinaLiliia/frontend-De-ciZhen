'use client';

import { useQuery } from '@tanstack/react-query';

import type { buildWorkspaceDataQueries } from '@/features/workspace/data/workspaceData.queries';

type WorkspaceDataQueries = ReturnType<typeof buildWorkspaceDataQueries>;

type Args = {
  workspaceDataQueries: WorkspaceDataQueries;
};

export function useWorkspacePublicOverviewData({ workspaceDataQueries }: Args) {
  const {
    data: publicOverview,
    isLoading,
    isError,
  } = useQuery(workspaceDataQueries.publicOverview);

  return {
    overviewRequests: publicOverview?.requests,
    isLoading,
    isError,
  };
}
