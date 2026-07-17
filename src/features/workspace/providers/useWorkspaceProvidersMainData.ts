'use client';

import * as React from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';

import { providerQK } from '@/features/providers/queries';
import { workspaceQK } from '@/features/workspace/data';
import type { WorkspaceViewerMode } from '@/features/workspace/state';
import { getWorkspaceProviders } from '@/lib/api/workspace';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { WorkspaceRequestsPeriodDto } from '@/lib/api/dto/workspace';
import { getPublicProviderById } from '@/lib/api/providers';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import {
  backfillProviderCardAvatarsFromCandidates,
  hasUsableProviderAvatarUrl,
  resolveWorkspaceProviderItemIdentity,
} from '@/lib/providers/publicProvider';
import { resolveRequestsListDensityForPageSize, type RequestsListDensity } from '@/lib/requests/pagination';
import { useAuthMe } from '@/hooks/useAuthSnapshot';
import { ALL_OPTION_KEY } from '@/features/workspace/shared';

type UseWorkspaceProvidersMainDataArgs = {
  cityId: string;
  subcategoryKey: string;
  categoryKey: string;
  sortBy: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  period: WorkspaceRequestsPeriodDto | null;
  viewerMode: WorkspaceViewerMode;
};

export function useWorkspaceProvidersMainData({
  cityId,
  subcategoryKey,
  categoryKey,
  sortBy,
  page,
  limit,
  setPage,
  period,
  viewerMode,
}: UseWorkspaceProvidersMainDataArgs) {
  const authMe = useAuthMe();
  const ownProviderProfileId = authMe?.providerProfile?.id?.trim() || null;
  const normalizedPeriod = period ?? undefined;

  const {
    data: contractData,
    isLoading,
    isError,
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
    enabled: Boolean(ownProviderProfileId),
    queryFn: () => withStatusFallback(() => getPublicProviderById(ownProviderProfileId!), null, [404]),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const publicProviderDetailResults = useQueries({
    queries: missingAvatarProviderIds.map((providerId) => ({
      queryKey: providerQK.publicById(providerId),
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
    () => backfillProviderCardAvatarsFromCandidates(contractData?.list.items ?? [], publicProviderDetailCandidates),
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
    [contractData?.list.items],
  );

  const favoriteProviderIds = React.useMemo(
    () =>
      new Set(
        (contractData?.list.items ?? [])
          .filter((item) => item.isFavorite)
          .map((item) => resolveWorkspaceProviderItemIdentity(item).id)
          .filter(Boolean),
      ),
    [contractData?.list.items],
  );

  React.useEffect(() => {
    const resolvedPage = contractData?.list.page;
    if (!resolvedPage || resolvedPage === page) return;
    setPage(resolvedPage);
  }, [contractData?.list.page, page, setPage]);

  const listDensity = React.useMemo<RequestsListDensity>(
    () => resolveRequestsListDensityForPageSize(limit),
    [limit],
  );

  return {
    isLoading,
    isError,
    providerById,
    favoriteProviderIds,
    providerCards,
    totalPages: contractData?.list.totalPages ?? 1,
    totalLabel: contractData?.list.totalLabel ?? '0',
    totalCount: contractData?.list.totalCount ?? 0,
    emptyTitle: contractData?.list.emptyTitle ?? '',
    emptyHint: contractData?.list.emptyHint ?? '',
    listDensity,
  };
}
