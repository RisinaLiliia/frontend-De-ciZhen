'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import {
  buildRequestsWorkspacePublicBody,
  RequestsWorkspaceBody,
  useWorkspaceData,
} from '@/features/workspace/requests';
import { RequestsPrivateActionRail } from '@/features/workspace/requests';
import { useWorkspacePublicFilters } from '@/features/workspace';
import {
  buildOffersByRequestMap,
  pickRequestsExplorerSharedFilters,
} from '@/components/requests/requestsExplorer.model';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { useWorkspaceRequestUserInteractions } from '@/features/workspace/page/useWorkspaceRequestUserInteractions';
import {
  buildWorkspacePublicRequestsAsideProps,
  buildWorkspacePublicRequestsListProps,
  buildWorkspacePublicRequestsSummaryStripProps,
} from '@/features/workspace/page/workspacePublicRequests.view-model';
import {
  resolveWorkspacePublicRequestsData,
} from '@/features/workspace/page/workspacePublicRequests.data';

type UseWorkspacePublicRequestsSectionParams = {
  branch: WorkspaceBranchProps;
  enabled?: boolean;
};

function buildWorkspaceHref(pathname: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function useWorkspacePublicRequestsSection({
  branch,
  enabled = true,
}: UseWorkspacePublicRequestsSectionParams) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    t,
    locale,
    isAuthed,
    isWorkspaceAuthed,
    routeState,
  } = branch;
  const {
    activePublicSection,
    activeWorkspaceTab,
    activeRequestsState,
    activeRequestsPeriod,
    activeRequestsSort,
    nextPath,
  } = routeState;

  const filters = useWorkspacePublicFilters({
    t,
    locale,
    shouldLoadCatalog: enabled,
    activePublicSection,
  });
  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex({
    services: filters.services,
    categories: filters.categories,
    cities: filters.cities,
  });

  const data = useWorkspaceData({
    enabled,
    includePrivateOverview: false,
    includePublicSummary: false,
    publicSummaryCityActivityLimit: 1,
    filter: {
      ...filters.filter,
      state: activeRequestsState,
      period: activeRequestsPeriod,
    },
    locale,
    isAuthed,
    isWorkspaceAuthed,
    isWorkspacePublicSection: true,
    shouldLoadPrivateData: true,
    activeWorkspaceTab,
    activePublicSection,
    requestsScope: 'market',
    activeRequestsRole: 'all',
    activeRequestsState,
    activeRequestsPeriod,
    activeRequestsSort: activeRequestsSort ?? filters.sortBy,
  });
  const { contractData, legacyPrivateData } = data;

  const marketResponse = contractData.workspaceRequests;
  const hasMarketContract = marketResponse != null;
  const {
    requests,
    publicRequestsListItems,
    summaryItems,
    decisionPanel,
    publicListPage,
    publicListLimit,
    publicListTotalPages,
    resolvedTotalResults,
  } = React.useMemo(
    () => resolveWorkspacePublicRequestsData({
      marketResponse,
      publicRequestsItems: contractData.publicRequests?.items,
      publicRequestsTotalValue: contractData.publicRequests?.total,
      publicRequestsPage: contractData.publicRequests?.page,
      publicRequestsLimit: contractData.publicRequests?.limit,
      filtersPage: filters.page,
      filtersLimit: filters.limit,
    }),
    [
      contractData.publicRequests?.items,
      contractData.publicRequests?.limit,
      contractData.publicRequests?.page,
      contractData.publicRequests?.total,
      filters.limit,
      filters.page,
      marketResponse,
    ],
  );
  const requestById = React.useMemo(
    () => new Map(requests.map((request) => [request.id, request])),
    [requests],
  );
  const favoriteRequestIds = React.useMemo(
    () => new Set((legacyPrivateData.favoriteRequests ?? []).map((request) => request.id)),
    [legacyPrivateData.favoriteRequests],
  );
  const interactions = useWorkspaceRequestUserInteractions({
    t,
    locale,
    isAuthed,
    nextPath,
    favoriteRequestIds,
    requestById,
    favoriteProviderLookup: new Set(),
    providerById: new Map(),
  });
  const offersByRequest = React.useMemo(
    () => buildOffersByRequestMap(legacyPrivateData.myOffers),
    [legacyPrivateData.myOffers],
  );

  const setRequestsState = React.useCallback((nextState: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('section', 'requests');
    nextParams.set('scope', 'market');
    nextParams.set('state', nextState);
    nextParams.set('page', '1');
    router.replace(buildWorkspaceHref(pathname, nextParams), { scroll: false });
  }, [pathname, router, searchParams]);

  const openMarketStats = React.useCallback(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('section', 'stats');
    nextParams.delete('state');
    router.replace(buildWorkspaceHref(pathname, nextParams), { scroll: false });
  }, [pathname, router, searchParams]);

  const openQueueItem = React.useCallback((requestId: string) => {
    router.push(`/requests/${requestId}`);
  }, [router]);

  const sharedFilters = React.useMemo(
    () => pickRequestsExplorerSharedFilters({
      categoryOptions: filters.categoryOptions,
      serviceOptions: filters.serviceOptions,
      cityOptions: filters.cityOptions,
      sortOptions: filters.sortOptions,
      categoryKey: filters.categoryKey,
      subcategoryKey: filters.subcategoryKey,
      cityId: filters.cityId,
      sortBy: filters.sortBy,
      page: publicListPage,
      limit: publicListLimit,
      isCategoriesLoading: filters.isCategoriesLoading,
      isServicesLoading: filters.isServicesLoading,
      isPending: filters.isFiltersPending,
      appliedFilterChips: filters.appliedFilterChips,
      onCategoryChange: filters.onCategoryChangeTracked,
      onSubcategoryChange: filters.onSubcategoryChangeTracked,
      onCityChange: filters.onCityChangeTracked,
      onSortChange: filters.onSortChangeTracked,
      onReset: filters.onResetTracked,
      setPage: filters.setPage,
    }),
    [
      filters.appliedFilterChips,
      filters.categoryKey,
      filters.categoryOptions,
      filters.cityId,
      filters.cityOptions,
      filters.isCategoriesLoading,
      filters.isFiltersPending,
      filters.isServicesLoading,
      filters.onCategoryChangeTracked,
      filters.onCityChangeTracked,
      filters.onResetTracked,
      filters.onSortChangeTracked,
      filters.onSubcategoryChangeTracked,
      filters.serviceOptions,
      filters.setPage,
      filters.sortBy,
      filters.sortOptions,
      filters.subcategoryKey,
      publicListLimit,
      publicListPage,
    ],
  );

  if (!enabled) {
    return {
      publicMain: null,
      publicAside: null,
    };
  }

  const publicMain = (
    <div className="stack-md">
      <RequestsWorkspaceBody
        body={buildRequestsWorkspacePublicBody(buildWorkspacePublicRequestsListProps({
          t,
          locale,
          emptyCtaHref: '/workspace?section=requests&scope=market',
          sharedFilters,
          requestsData: {
            totalResultsLabel: interactions.formatNumber.format(
              activeRequestsState === 'all' ? resolvedTotalResults : publicRequestsListItems.length,
            ),
            requests: publicRequestsListItems,
            isLoading: contractData.isLoading,
            isError: contractData.isError,
            offersByRequest,
            favoriteRequestIds,
            pendingFavoriteRequestIds: interactions.pendingFavoriteRequestIds,
            pendingOfferRequestId: interactions.pendingOfferRequestId,
            totalPages: publicListTotalPages,
            openOfferSheet: interactions.onOpenOfferSheet,
            onWithdrawOffer: interactions.onWithdrawOffer,
            toggleRequestFavorite: interactions.onToggleRequestFavorite,
          },
          catalogIndex: {
            serviceByKey,
            categoryByKey,
            cityById,
          },
          formatDate: interactions.formatDate,
          formatPrice: interactions.formatPrice,
          summaryStripProps: hasMarketContract
            ? buildWorkspacePublicRequestsSummaryStripProps({
              locale,
              items: summaryItems,
              onSelect: setRequestsState,
            })
            : undefined,
          isSummaryStripLoading: !hasMarketContract && contractData.isWorkspaceRequestsLoading,
        }))}
      />
    </div>
  );

  const publicAside = decisionPanel ? (
    <div className="stack-md">
      <RequestsPrivateActionRail
        {...buildWorkspacePublicRequestsAsideProps({
          locale,
          panel: decisionPanel,
          onStartDecisionMode: openMarketStats,
          onOpenQueueItem: openQueueItem,
        })}
      />
    </div>
  ) : null;

  return {
    publicMain,
    publicAside,
  };
}
