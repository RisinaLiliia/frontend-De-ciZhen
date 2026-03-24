'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { listPublicProviders } from '@/lib/api/providers';
import { buildProviderFavoriteLookup, listFavorites } from '@/lib/api/favorites';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import {
  buildProvidersExploreCollection,
  formatProvidersTotalLabel,
} from '@/components/requests/providersExplore.model';
import { ALL_OPTION_KEY } from '@/features/workspace/requests';
import type { FilterOption } from '@/components/requests/requestsFilters.types';
import type { Locale } from '@/lib/i18n/t';
import {
  resolveRequestsListDensityForPageSize,
  type RequestsListDensity,
} from '@/lib/requests/pagination';

type Args = {
  locale: Locale;
  isAuthed: boolean;
  isProvidersView: boolean;
  cityId: string;
  subcategoryKey: string;
  categoryKey: string;
  sortBy: string;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  services: Array<{ key: string; categoryKey: string }>;
  cityOptions: FilterOption[];
  onListDensityChange?: (value: RequestsListDensity) => void;
};

export function useProvidersExploreData({
  locale,
  isAuthed,
  isProvidersView,
  cityId,
  subcategoryKey,
  categoryKey,
  sortBy,
  page,
  limit,
  setPage,
  services,
  cityOptions,
  onListDensityChange,
}: Args) {
  const {
    data: providers = [],
    isLoading: isProvidersLoading,
    isError: isProvidersError,
  } = useQuery({
    queryKey: ['requests-explorer-providers', cityId, subcategoryKey],
    enabled: isProvidersView,
    queryFn: () =>
      listPublicProviders({
        cityId: cityId === ALL_OPTION_KEY ? undefined : cityId,
        serviceKey: subcategoryKey === ALL_OPTION_KEY ? undefined : subcategoryKey,
      }),
  });

  const { data: favoriteProviders = [] } = useQuery({
    queryKey: ['favorite-providers'],
    enabled: isProvidersView && isAuthed,
    queryFn: () => withStatusFallback(() => listFavorites('provider'), [], [401, 403]),
  });

  const favoriteProviderLookup = React.useMemo(
    () => buildProviderFavoriteLookup(favoriteProviders),
    [favoriteProviders],
  );

  const {
    providerById,
    favoriteProviderIds,
    pagedProviders,
    totalProviderPages,
    filteredProvidersCount,
  } = React.useMemo(
    () =>
      buildProvidersExploreCollection({
        providers,
        favoriteProviderLookup,
        categoryKey,
        subcategoryKey,
        cityId,
        services,
        cityOptions,
        sortBy,
        page,
        limit,
      }),
    [
      categoryKey,
      cityId,
      cityOptions,
      favoriteProviderLookup,
      limit,
      page,
      providers,
      services,
      sortBy,
      subcategoryKey,
    ],
  );

  const totalProvidersLabel = React.useMemo(
    () => formatProvidersTotalLabel(locale, filteredProvidersCount),
    [filteredProvidersCount, locale],
  );

  React.useEffect(() => {
    if (!isProvidersView) return;
    if (page <= totalProviderPages) return;
    setPage(totalProviderPages);
  }, [isProvidersView, page, setPage, totalProviderPages]);

  const [providersListDensity, setProvidersListDensity] = React.useState<RequestsListDensity>(
    resolveRequestsListDensityForPageSize(limit),
  );

  React.useEffect(() => {
    const nextDensity = resolveRequestsListDensityForPageSize(limit);
    if (nextDensity !== providersListDensity) {
      setProvidersListDensity(nextDensity);
    }
  }, [limit, providersListDensity]);

  React.useEffect(() => {
    if (!isProvidersView) return;
    onListDensityChange?.(providersListDensity);
  }, [isProvidersView, onListDensityChange, providersListDensity]);

  return {
    isProvidersLoading,
    isProvidersError,
    providerById,
    favoriteProviderLookup,
    favoriteProviderIds,
    pagedProviders,
    totalProviderPages,
    totalProvidersLabel,
    filteredProvidersCount,
    providersListDensity,
    setProvidersListDensity,
  };
}
