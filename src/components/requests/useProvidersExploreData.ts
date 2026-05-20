'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getWorkspaceProviders } from '@/lib/api/workspace';
import { workspaceQK } from '@/features/workspace/data';
import { ALL_OPTION_KEY } from '@/features/workspace/shared';
import { resolveWorkspaceRequestsPeriod, type WorkspaceViewerMode } from '@/features/workspace/state';
import {
  resolveRequestsListDensityForPageSize,
  type RequestsListDensity,
} from '@/lib/requests/pagination';

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
  const normalizedPeriod = resolveWorkspaceRequestsPeriod(period);
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

  const providerById = React.useMemo(
    () =>
      new Map(
        (contractData?.list.items ?? []).map((item) => [
          item.id,
          {
            id: item.id,
            userId: item.userId ?? undefined,
          },
        ]),
      ),
    [contractData],
  );

  const favoriteProviderIds = React.useMemo(
    () =>
      new Set(
        (contractData?.list.items ?? [])
          .filter((item) => item.isFavorite)
          .map((item) => item.id),
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
    providerCards: contractData?.list.items ?? [],
    totalProviderPages: contractData?.list.totalPages ?? 1,
    totalProvidersLabel: contractData?.list.totalLabel ?? '0',
    filteredProvidersCount: contractData?.list.totalCount ?? 0,
    emptyTitle: contractData?.list.emptyTitle ?? '',
    emptyHint: contractData?.list.emptyHint ?? '',
    providersListDensity,
  };
}
