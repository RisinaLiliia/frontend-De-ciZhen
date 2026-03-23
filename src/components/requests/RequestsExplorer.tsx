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
import type { RequestsExplorerProps } from '@/components/requests/requestsExplorer.types';

export type { RequestsExplorerProps } from '@/components/requests/requestsExplorer.types';

export function RequestsExplorer({
  t,
  locale,
  contentType = 'requests',
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

  const filters = useRequestsExplorerFilters({ t, locale });
  const sharedFilters = pickRequestsExplorerSharedFilters(filters);

  const providersData = useProvidersExploreData({
    locale,
    isAuthed,
    isProvidersView,
    cityId: filters.cityId,
    subcategoryKey: filters.subcategoryKey,
    categoryKey: filters.categoryKey,
    sortBy: filters.sortBy,
    page: filters.page,
    limit: filters.limit,
    setPage: filters.setPage,
    services: filters.services,
    cityOptions: filters.cityOptions,
    onListDensityChange,
  });
  const {
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

  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex({
    services: filters.services,
    categories: filters.categories,
    cities: filters.cities,
  });

  const nextPath = React.useMemo(
    () => buildRequestsExplorerNextPath(pathname, searchParams),
    [pathname, searchParams],
  );
  const {
    pendingFavoriteProviderIds,
    toggleProviderFavorite,
  } = useProviderFavoriteToggle({
    isAuthed,
    nextPath,
    router,
    t,
    qc,
    favoriteProviderLookup,
    providerById,
  });

  const providersContentProps = buildRequestsExplorerProvidersContentProps({
    t,
    locale,
    sharedFilters,
    providersData: {
      totalProvidersLabel,
      totalProviderPages,
      providersListDensity,
      setProvidersListDensity,
      isProvidersLoading,
      isProvidersError,
      filteredProvidersCount,
      pagedProviders,
      favoriteProviderIds,
      pendingFavoriteProviderIds,
      toggleProviderFavorite,
    },
    showFilterControls: showTopFilters,
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
    onListDensityChange,
    showTopFilters,
  });

  return (
    <RequestsExplorerView
      isProvidersView={isProvidersView}
      showBack={showBack}
      backHref={backHref}
      providersContent={<RequestsExplorerProvidersContent {...providersContentProps} />}
      requestsContent={<RequestsExplorerRequestsContent {...requestsContentProps} />}
    />
  );
}
