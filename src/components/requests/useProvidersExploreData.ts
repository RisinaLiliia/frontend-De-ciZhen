'use client';

import * as React from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';

import { providerQK } from '@/features/providers/queries';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import { getPublicProviderById } from '@/lib/api/providers';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { getWorkspaceProviders } from '@/lib/api/workspace';
import { workspaceQK } from '@/features/workspace/data';
import { ALL_OPTION_KEY } from '@/features/workspace/shared';
import { useAuthMe } from '@/hooks/useAuthSnapshot';
import {
  resolveWorkspaceRequestsPeriod,
  type WorkspaceViewerMode,
} from '@/features/workspace/state';
import {
  resolveRequestsListDensityForPageSize,
  type RequestsListDensity,
} from '@/lib/requests/pagination';
import {
  backfillProviderCardAvatarsFromCandidates,
  hasUsableProviderAvatarUrl,
  resolveWorkspaceProviderItemIdentity,
} from '@/lib/providers/publicProvider';

type Args = {
  isProvidersView: boolean;
  cityId: string;
  subcategoryKey: string;
  categoryKey: string;
  sortBy: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  period: string | null;
  viewerMode: WorkspaceViewerMode;
};

export function useProvidersExploreData({
  isProvidersView,
  cityId,
  subcategoryKey,
  categoryKey,
  sortBy,
  page,
  limit,
  setPage,
  period,
  viewerMode,
}: Args) {
  const authMe = useAuthMe();
  const normalizedPeriod = resolveWorkspaceRequestsPeriod(period);
  const ownProviderProfileId = authMe?.providerProfile?.id?.trim() || null;
  const {
    data: contractData,
    isLoading: isProvidersLoading,
    isError: isProvidersError,
  } = useQuery({
    queryKey: workspaceQK.workspaceProvidersMain({
      cityId: cityId === ALL_OPTION_KEY ? undefined : cityId,
      categoryKey: categoryKey === ALL_OPTION_KEY ? undefined : categoryKey,
      subcategoryKey: subcategoryKey === ALL_OPTION_KEY ? undefined : subcategoryKey,
      period: normalizedPeriod,
      viewerMode,
      sort: sortBy,
      page,
      limit,
    }),
    enabled: isProvidersView,
    queryFn: () =>
      getWorkspaceProviders({
        cityId: cityId === ALL_OPTION_KEY ? null : cityId,
        categoryKey: categoryKey === ALL_OPTION_KEY ? null : categoryKey,
        subcategoryKey: subcategoryKey === ALL_OPTION_KEY ? null : subcategoryKey,
        sort: sortBy as 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc',
        page,
        limit,
        period: normalizedPeriod,
        viewerMode,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const missingAvatarProviderIds = React.useMemo(
    () =>
      Array.from(
        new Set(
          (contractData?.list.items ?? [])
            .filter((item) => !hasUsableProviderAvatarUrl(item.card.avatarUrl))
            .map((item) => resolveWorkspaceProviderItemIdentity(item).id)
            .filter(Boolean),
        ),
      ),
    [contractData?.list.items],
  );
  const ownProviderDetailQuery = useQuery({
    queryKey: providerQK.publicById(ownProviderProfileId),
    enabled: isProvidersView && Boolean(ownProviderProfileId),
    queryFn: () =>
      withStatusFallback(() => getPublicProviderById(ownProviderProfileId!), null, [404]),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const publicProviderDetailResults = useQueries({
    queries: missingAvatarProviderIds.map((providerId) => ({
      queryKey: providerQK.publicById(providerId),
      enabled: isProvidersView,
      queryFn: () => withStatusFallback(() => getPublicProviderById(providerId), null, [404]),
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: false,
    })),
  });
  const publicProviderDetailCandidates = React.useMemo(
    () =>
      [
        ownProviderDetailQuery.data,
        ...publicProviderDetailResults.map((result) => result.data),
      ].filter((item): item is ProviderPublicDto => Boolean(item)),
    [ownProviderDetailQuery.data, publicProviderDetailResults],
  );
  const providerCards = React.useMemo(
    () =>
      backfillProviderCardAvatarsFromCandidates(
        contractData?.list.items ?? [],
        publicProviderDetailCandidates,
      ),
    [contractData?.list.items, publicProviderDetailCandidates],
  );

  const providerById = React.useMemo(
    () =>
      new Map(
        (contractData?.list.items ?? []).map((item) => {
          const identity = resolveWorkspaceProviderItemIdentity(item);
          return [identity.id, identity];
        }),
      ),
    [contractData],
  );

  const favoriteProviderIds = React.useMemo(
    () =>
      new Set(
        (contractData?.list.items ?? [])
          .filter((item) => item.isFavorite)
          .map((item) => resolveWorkspaceProviderItemIdentity(item).id)
          .filter(Boolean),
      ),
    [contractData],
  );

  React.useEffect(() => {
    if (!isProvidersView) return;
    const resolvedPage = contractData?.list.page;
    if (!resolvedPage || resolvedPage === page) return;
    setPage(resolvedPage);
  }, [contractData, isProvidersView, page, setPage]);

  const providersListDensity = React.useMemo<RequestsListDensity>(
    () => resolveRequestsListDensityForPageSize(limit),
    [limit],
  );

  return {
    isProvidersLoading,
    providerById,
    favoriteProviderIds,
    isProvidersError,
    providerCards,
    totalProviderPages: contractData?.list.totalPages ?? 1,
    totalProvidersLabel: contractData?.list.totalLabel ?? '0',
    filteredProvidersCount: contractData?.list.totalCount ?? 0,
    emptyTitle: contractData?.list.emptyTitle ?? '',
    emptyHint: contractData?.list.emptyHint ?? '',
    providersListDensity,
  };
}
