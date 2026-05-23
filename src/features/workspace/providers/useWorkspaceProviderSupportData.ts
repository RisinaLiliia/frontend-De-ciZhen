'use client';

import { useQuery } from '@tanstack/react-query';

import { listFavorites } from '@/lib/api/favorites';
import { listPublicProviders } from '@/lib/api/providers';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { workspaceQK } from '@/features/workspace/data';

const PROVIDERS_STALE_TIME_MS = 30_000;
const PROVIDERS_GC_TIME_MS = 5 * 60 * 1000;

type Args = {
  enabled?: boolean;
  isAuthed: boolean;
};

export function useWorkspaceProviderSupportData({
  enabled = true,
  isAuthed,
}: Args) {
  const favoriteProvidersQuery = useQuery({
    queryKey: workspaceQK.favoriteProviders(),
    enabled: enabled && isAuthed,
    queryFn: () => withStatusFallback(() => listFavorites('provider'), []),
    staleTime: PROVIDERS_STALE_TIME_MS,
    gcTime: PROVIDERS_GC_TIME_MS,
    refetchOnWindowFocus: false,
  });

  const providersQuery = useQuery({
    queryKey: workspaceQK.providersPublic(),
    enabled,
    queryFn: () => listPublicProviders(),
    staleTime: PROVIDERS_STALE_TIME_MS,
    gcTime: PROVIDERS_GC_TIME_MS,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    favoriteProviders: favoriteProvidersQuery.data ?? [],
    isFavoriteProvidersLoading: favoriteProvidersQuery.isLoading,
    providers: providersQuery.data ?? [],
    isProvidersLoading: providersQuery.isLoading,
    isProvidersError: providersQuery.isError,
  };
}
