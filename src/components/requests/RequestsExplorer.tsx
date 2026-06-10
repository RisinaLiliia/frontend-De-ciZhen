'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { useProviderFavoriteToggle } from '@/hooks/useFavoriteToggles';
import { useRequestsExplorerFilters } from '@/components/requests/useRequestsExplorerFilters';
import { useProvidersExploreData } from '@/components/requests/useProvidersExploreData';
import { RequestsExplorerRequestsContent } from '@/components/requests/RequestsExplorerRequestsContent';
import { RequestsExplorerView } from '@/components/requests/RequestsExplorerView';
import { useRequestsExplorerRequestsData } from '@/components/requests/useRequestsExplorerRequestsData';
import { RequestsExplorerProvidersContent } from '@/components/requests/RequestsExplorerProvidersContent';
import {
  buildRequestsExplorerNextPath,
  buildRequestsExplorerProvidersContentProps,
  buildRequestsExplorerRequestsContentProps,
  pickRequestsExplorerSharedFilters,
} from '@/components/requests/requestsExplorer.model';
import { buildWorkspaceProviderDetailHref } from '@/features/workspace/providers/workspaceProviderRoute.model';
import { resolveWorkspaceViewerMode } from '@/features/workspace/state';
import { resolveRequestsPageSizeForDensity } from '@/lib/requests/pagination';
import type { RequestsExplorerProps } from '@/components/requests/requestsExplorer.types';

export type { RequestsExplorerProps } from '@/components/requests/requestsExplorer.types';

export function RequestsExplorer({
  t,
  locale,
  layoutVariant = 'default',
  contentType = 'requests',
  providerLinkMode = 'standalone',
  backHref = '/',
  emptyCtaHref = '/workspace?section=requests',
  showBack = false,
  onListDensityChange,
  showTopFilters = true,
  initialPublicRequests,
  preferInitialPublicRequests = false,
  initialPublicRequestsLoading = false,
  initialPublicRequestsError = false,
}: RequestsExplorerProps) {
  const authStatus = useAuthStatus();
  const isAuthed = authStatus === 'authenticated';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const isProvidersView = contentType === 'providers';
  const viewerMode = resolveWorkspaceViewerMode(searchParams.get('viewerMode'));
  const period = searchParams.get('period') ?? searchParams.get('range');

  const filters = useRequestsExplorerFilters({ t, locale });
  const sharedFilters = pickRequestsExplorerSharedFilters(filters);
  const handleRequestsListDensityChange = React.useCallback(
    (value: 'single' | 'double') => {
      filters.setLimit(resolveRequestsPageSizeForDensity(value));
      onListDensityChange?.(value);
    },
    [filters, onListDensityChange],
  );

  const providersData = useProvidersExploreData({
    isProvidersView,
    cityId: filters.cityId,
    subcategoryKey: filters.subcategoryKey,
    categoryKey: filters.categoryKey,
    sortBy: filters.sortBy,
    page: filters.page,
    limit: filters.limit,
    setPage: filters.setPage,
    period,
    viewerMode,
  });
  const {
    isProvidersLoading,
    isProvidersError,
    providerById,
    favoriteProviderIds,
    providerCards,
    totalProviderPages,
    totalProvidersLabel,
    filteredProvidersCount,
    emptyTitle,
    emptyHint,
    providersListDensity,
  } = providersData;

  const requestsData = useRequestsExplorerRequestsData({
    t,
    locale,
    isAuthed,
    isProvidersView,
    filter: filters.filter,
    page: filters.page,
    limit: filters.limit,
    setPage: filters.setPage,
    searchParams,
    pathname,
    initialPublicRequests,
    preferInitialPublicRequests,
    initialPublicRequestsLoading,
    initialPublicRequestsError,
  });
  const {
    isLoading,
    isError,
    requests,
    offersByRequest,
    favoriteRequestIds,
    pendingFavoriteRequestIds,
    pendingOfferRequestId,
    totalPages,
    totalResultsLabel,
    openOfferSheet,
    onWithdrawOffer,
    toggleRequestFavorite,
  } = requestsData;

  const handleProvidersListDensityChange = React.useCallback(
    (value: 'single' | 'double') => {
      handleRequestsListDensityChange(value);
    },
    [handleRequestsListDensityChange],
  );

  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex({
    services: filters.services,
    categories: filters.categories,
    cities: filters.cities,
  });

  const nextPath = React.useMemo(
    () => buildRequestsExplorerNextPath(pathname, searchParams),
    [pathname, searchParams],
  );
  const { pendingFavoriteProviderIds, toggleProviderFavorite } = useProviderFavoriteToggle({
    isAuthed,
    nextPath,
    router,
    t,
    qc,
    favoriteProviderIds,
    providerById,
  });
  const providerProfileHrefResolver = React.useMemo(
    () =>
      providerLinkMode === 'workspace' && isProvidersView
        ? (providerId: string) =>
            buildWorkspaceProviderDetailHref({
              currentSearch: searchParams,
              providerId,
            })
        : undefined,
    [isProvidersView, providerLinkMode, searchParams],
  );
  const providerReviewsHrefResolver = React.useMemo(
    () =>
      providerProfileHrefResolver
        ? (providerId: string) => `${providerProfileHrefResolver(providerId)}#reviews`
        : undefined,
    [providerProfileHrefResolver],
  );

  const providersContentProps = buildRequestsExplorerProvidersContentProps({
    t,
    locale,
    sharedFilters,
    providersData: {
      totalProvidersLabel,
      totalProviderPages,
      emptyTitle,
      emptyHint,
      providersListDensity,
      isProvidersLoading,
      isProvidersError,
      filteredProvidersCount,
      providerCards,
      favoriteProviderIds,
      pendingFavoriteProviderIds,
      toggleProviderFavorite,
      providerProfileHrefResolver,
      providerReviewsHrefResolver,
    },
    showFilterControls: showTopFilters,
    onListDensityChange: handleProvidersListDensityChange,
  });

  const requestsContentProps = buildRequestsExplorerRequestsContentProps({
    t,
    locale,
    emptyCtaHref,
    sharedFilters,
    requestsData: {
      totalResultsLabel,
      requests,
      isLoading,
      isError,
      offersByRequest,
      favoriteRequestIds,
      pendingFavoriteRequestIds,
      pendingOfferRequestId,
      totalPages,
      openOfferSheet,
      onWithdrawOffer,
      toggleRequestFavorite,
    },
    catalogIndex: {
      serviceByKey,
      categoryByKey,
      cityById,
    },
    formatDate: filters.formatDate,
    formatPrice: filters.formatPrice,
    onListDensityChange: handleRequestsListDensityChange,
    showTopFilters,
  });

  return (
    <RequestsExplorerView
      layoutVariant={layoutVariant}
      isProvidersView={isProvidersView}
      showBack={showBack}
      backHref={backHref}
      providersContent={<RequestsExplorerProvidersContent {...providersContentProps} />}
      requestsContent={<RequestsExplorerRequestsContent {...requestsContentProps} />}
    />
  );
}
