'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuthMe } from '@/hooks/useAuthSnapshot';
import { providerQK } from '@/features/providers/queries';
import { workspaceQK } from '@/features/workspace/data';
import { listFavorites } from '@/lib/api/favorites';
import { listPublicProviders } from '@/lib/api/providers';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { backfillOwnProviderAvatars } from '@/lib/providers/publicProvider';

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
  const authMe = useAuthMe();
  const favoriteProvidersQuery = useQuery({
    queryKey: workspaceQK.favoriteProviders(),
    enabled: enabled && isAuthed,
    queryFn: () => withStatusFallback(() => listFavorites('provider'), []),
    staleTime: PROVIDERS_STALE_TIME_MS,
    gcTime: PROVIDERS_GC_TIME_MS,
    refetchOnWindowFocus: false,
  });

  const providersQuery = useQuery({
    queryKey: providerQK.publicList(),
    enabled,
    queryFn: () => listPublicProviders(),
    staleTime: PROVIDERS_STALE_TIME_MS,
    gcTime: PROVIDERS_GC_TIME_MS,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const favoriteProviders = React.useMemo(
    () => backfillOwnProviderAvatars(favoriteProvidersQuery.data ?? [], authMe),
    [authMe, favoriteProvidersQuery.data],
  );
  const providers = React.useMemo(
    () => backfillOwnProviderAvatars(providersQuery.data ?? [], authMe),
    [authMe, providersQuery.data],
  );

  return {
    favoriteProviders,
    isFavoriteProvidersLoading: favoriteProvidersQuery.isLoading,
    providers,
    isProvidersLoading: providersQuery.isLoading,
    isProvidersError: providersQuery.isError,
  };
}
