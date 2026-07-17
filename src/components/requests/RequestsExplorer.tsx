'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { useRequestsExplorerFilters } from '@/components/requests/useRequestsExplorerFilters';
import { RequestsExplorerRequestsContent } from '@/components/requests/RequestsExplorerRequestsContent';
import { RequestsExplorerView } from '@/components/requests/RequestsExplorerView';
import { useRequestsExplorerRequestsData } from '@/components/requests/useRequestsExplorerRequestsData';
import {
  buildRequestsExplorerRequestsContentProps,
  pickRequestsExplorerSharedFilters,
} from '@/components/requests/requestsExplorer.model';
import { resolveRequestsPageSizeForDensity } from '@/lib/requests/pagination';
import type { RequestsExplorerProps } from '@/components/requests/requestsExplorer.types';

export type { RequestsExplorerProps } from '@/components/requests/requestsExplorer.types';

export function RequestsExplorer({
  t,
  locale,
  layoutVariant = 'default',
  backHref = '/',
  emptyCtaHref = '/workspace?section=requests',
  showBack = false,
  onListDensityChange,
  showTopFilters = true,
  initialPublicRequests,
  preferInitialPublicRequests = false,
}: RequestsExplorerProps) {
  const authStatus = useAuthStatus();
  const isAuthed = authStatus === 'authenticated';
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useRequestsExplorerFilters({ t, locale });
  const sharedFilters = pickRequestsExplorerSharedFilters(filters);
  const handleRequestsListDensityChange = React.useCallback(
    (value: 'single' | 'double') => {
      filters.setLimit(resolveRequestsPageSizeForDensity(value));
      onListDensityChange?.(value);
    },
    [filters, onListDensityChange],
  );

  const requestsData = useRequestsExplorerRequestsData({
    t,
    locale,
    isAuthed,
    filter: filters.filter,
    page: filters.page,
    limit: filters.limit,
    setPage: filters.setPage,
    searchParams,
    pathname,
    initialPublicRequests,
    preferInitialPublicRequests,
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
      showBack={showBack}
      backHref={backHref}
      content={<RequestsExplorerRequestsContent {...requestsContentProps} />}
    />
  );
}
