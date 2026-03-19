'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { PublicContent } from '@/features/workspace/requests';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { useProviderFavoriteToggle } from '@/hooks/useFavoriteToggles';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useRequestsExplorerFilters } from '@/components/requests/useRequestsExplorerFilters';
import { useProvidersExploreData } from '@/components/requests/useProvidersExploreData';
import { RequestsExplorerView } from '@/components/requests/RequestsExplorerView';
import { useRequestsExplorerRequestsData } from '@/components/requests/useRequestsExplorerRequestsData';
import { RequestsExplorerProvidersContent } from '@/components/requests/RequestsExplorerProvidersContent';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';

export type RequestsExplorerProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  contentType?: 'requests' | 'providers';
  backHref?: string;
  emptyCtaHref?: string;
  showBack?: boolean;
  onListDensityChange?: (value: 'single' | 'double') => void;
  showTopFilters?: boolean;
  initialPublicRequests?: PublicRequestsResponseDto;
  preferInitialPublicRequests?: boolean;
  initialPublicRequestsLoading?: boolean;
  initialPublicRequestsError?: boolean;
};

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
  const {
    cities,
    categories,
    services,
    isCategoriesLoading,
    isServicesLoading,
    sortOptions,
    categoryOptions,
    serviceOptions,
    cityOptions,
    categoryKey,
    subcategoryKey,
    cityId,
    sortBy,
    page,
    limit,
    filter,
    setPage,
    isPending,
    onCategoryChange,
    onSubcategoryChange,
    onCityChange,
    onSortChange,
    onReset,
    appliedFilterChips,
    formatDate,
    formatPrice,
  } = filters;

  const providersData = useProvidersExploreData({
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
    filter,
    page,
    limit,
    setPage,
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
    services,
    categories,
    cities,
  });

  const nextPath = React.useMemo(() => {
    const qs = searchParams?.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }, [pathname, searchParams]);
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

  const providersContent = (
    <RequestsExplorerProvidersContent
      t={t}
      locale={locale}
      categoryOptions={categoryOptions}
      serviceOptions={serviceOptions}
      cityOptions={cityOptions}
      sortOptions={sortOptions}
      categoryKey={categoryKey}
      subcategoryKey={subcategoryKey}
      cityId={cityId}
      sortBy={sortBy}
      totalProvidersLabel={totalProvidersLabel}
      page={page}
      totalProviderPages={totalProviderPages}
      isCategoriesLoading={isCategoriesLoading}
      isServicesLoading={isServicesLoading}
      isPending={isPending}
      appliedFilterChips={appliedFilterChips}
      onCategoryChange={onCategoryChange}
      onSubcategoryChange={onSubcategoryChange}
      onCityChange={onCityChange}
      onSortChange={onSortChange}
      onReset={onReset}
      onSetPage={setPage}
      providersListDensity={providersListDensity}
      onListDensityChange={setProvidersListDensity}
      isProvidersLoading={isProvidersLoading}
      isProvidersError={isProvidersError}
      filteredProvidersCount={filteredProvidersCount}
      pagedProviders={pagedProviders}
      favoriteProviderIds={favoriteProviderIds}
      pendingFavoriteProviderIds={pendingFavoriteProviderIds}
      onToggleProviderFavorite={toggleProviderFavorite}
      showFilterControls={showTopFilters}
    />
  );

  const requestsContent = (
    <PublicContent
      t={t}
      filtersProps={{
        t,
        locale,
        categoryOptions,
        serviceOptions,
        cityOptions,
        sortOptions,
        categoryKey,
        subcategoryKey,
        cityId,
        sortBy,
        totalResults: totalResultsLabel,
        isCategoriesLoading,
        isServicesLoading,
        isPending,
        appliedChips: appliedFilterChips,
        onCategoryChange,
        onSubcategoryChange,
        onCityChange,
        onSortChange,
        onReset,
      }}
      statusFilters={[]}
      activeStatusFilter="all"
      onStatusFilterChange={() => {}}
      isLoading={isLoading}
      isError={isError}
      requestsCount={requests.length}
      hasActivePublicFilter={appliedFilterChips.length > 0}
      emptyCtaHref={emptyCtaHref}
      requestsListProps={{
        t,
        locale,
        requests,
        isLoading,
        isError,
        serviceByKey,
        categoryByKey,
        cityById,
        formatDate,
        formatPrice,
        enableOfferActions: true,
        offersByRequest,
        favoriteRequestIds,
        pendingFavoriteRequestIds,
        onToggleFavorite: (requestId) => {
          void toggleRequestFavorite(requestId);
        },
        onSendOffer: openOfferSheet,
        onEditOffer: openOfferSheet,
        onWithdrawOffer,
        pendingOfferRequestId,
        showFavoriteButton: true,
      }}
      page={page}
      totalPages={totalPages}
      resultsLabel={t(I18N_KEYS.requestsPage.countLabel)}
      onPrevPage={() => setPage(Math.max(1, page - 1))}
      onNextPage={() => setPage(Math.min(totalPages, page + 1))}
      onListDensityChange={onListDensityChange}
      showFilterControls={showTopFilters}
    />
  );

  return (
    <RequestsExplorerView
      isProvidersView={isProvidersView}
      showBack={showBack}
      backHref={backHref}
      providersContent={providersContent}
      requestsContent={requestsContent}
    />
  );
}
