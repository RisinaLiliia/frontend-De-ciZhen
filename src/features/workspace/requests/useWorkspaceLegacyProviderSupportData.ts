'use client';

import { useQuery } from '@tanstack/react-query';

import type { buildWorkspaceDataQueries } from '@/features/workspace/requests/workspaceData.queries';

type WorkspaceDataQueries = ReturnType<typeof buildWorkspaceDataQueries>;

type Args = {
  workspaceDataQueries: WorkspaceDataQueries;
};

export function useWorkspaceLegacyProviderSupportData({ workspaceDataQueries }: Args) {
  const { data: favoriteProviders = [], isLoading: isFavoriteProvidersLoading } = useQuery(
    workspaceDataQueries.favoriteProviders,
  );

  const {
    data: providers = [],
    isLoading: isProvidersLoading,
    isError: isProvidersError,
  } = useQuery(workspaceDataQueries.providers);

  return {
    favoriteProviders,
    isFavoriteProvidersLoading,
    providers,
    isProvidersLoading,
    isProvidersError,
  };
}
