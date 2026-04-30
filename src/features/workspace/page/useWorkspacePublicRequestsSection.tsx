'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { RequestsExplorerRequestsContent } from '@/components/requests/RequestsExplorerRequestsContent';
import { useCatalogIndex } from '@/hooks/useCatalogIndex';
import { useWorkspaceData } from '@/features/workspace/requests';
import { RequestsPrivateActionRail } from '@/features/workspace/requests';
import {
  WorkspaceRequestsSummaryStrip,
  WorkspaceRequestsSummaryStripSkeleton,
} from '@/features/workspace/requests/components/WorkspaceRequestsSummaryStrip';
import { useWorkspacePublicFilters } from '@/features/workspace';
import { buildOffersByRequestMap } from '@/components/requests/requestsExplorer.model';
import {
  resolveRequestsListDensityForPageSize,
} from '@/lib/requests/pagination';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { useWorkspacePrivateInteractions } from '@/features/workspace/page/useWorkspacePrivateInteractions';
import {
  buildEmptyWorkspaceMarketRequestsResponse,
  mapWorkspaceRequestsResponseToPublicRequests,
} from '@/features/workspace/page/workspacePublicRequests.model';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { WorkspaceRequestsResponseDto } from '@/lib/api/dto/workspace';

type UseWorkspacePublicRequestsSectionParams = {
  branch: WorkspaceBranchProps;
};

type WorkspaceSummaryItems = NonNullable<NonNullable<WorkspaceRequestsResponseDto['summary']>['items']>;

function buildWorkspaceHref(pathname: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function filterPublicRequestsByState(
  requests: RequestResponseDto[],
  state: WorkspaceBranchProps['routeState']['activeRequestsState'],
) {
  if (state === 'all') return requests;
  if (state === 'attention') return requests.filter((request) => request.status === 'published');
  if (state === 'execution') return requests.filter((request) => request.status === 'matched');
  if (state === 'completed') return requests.filter((request) => request.status === 'closed');
  return requests;
}

function buildFallbackSummaryItems(params: {
  locale: WorkspaceBranchProps['locale'];
  state: WorkspaceBranchProps['routeState']['activeRequestsState'];
  requests: RequestResponseDto[];
  total: number;
}): NonNullable<WorkspaceRequestsResponseDto['summary']>['items'] {
  const { locale, state, requests, total } = params;
  const isDe = locale === 'de';
  const activeCount = requests.filter((request) => request.status === 'published').length;
  const executionCount = requests.filter((request) => request.status === 'matched').length;
  const completedCount = requests.filter((request) => request.status === 'closed').length;

  return [
    {
      key: 'all',
      label: isDe ? 'Alle' : 'All',
      value: total,
      isHighlighted: state === 'all',
    },
    {
      key: 'attention',
      label: isDe ? 'Aktiv' : 'Active',
      value: activeCount,
      isHighlighted: state === 'attention',
    },
    {
      key: 'execution',
      label: isDe ? 'In Ausführung' : 'In execution',
      value: executionCount,
      isHighlighted: state === 'execution',
    },
    {
      key: 'completed',
      label: isDe ? 'Abgeschlossen' : 'Completed',
      value: completedCount,
      isHighlighted: state === 'completed',
    },
  ];
}

function normalizeSummaryItems(params: {
  locale: WorkspaceBranchProps['locale'];
  state: WorkspaceBranchProps['routeState']['activeRequestsState'];
  summaryItems: WorkspaceSummaryItems;
  platformTotal: number;
  fallbackRequests: RequestResponseDto[];
}) {
  const { summaryItems, platformTotal, locale, state, fallbackRequests } = params;
  if (!summaryItems || summaryItems.length === 0) {
    return buildFallbackSummaryItems({
      locale,
      state,
      requests: fallbackRequests,
      total: platformTotal,
    });
  }

  return summaryItems.map((item) => (
    item.key === 'all'
      ? {
        ...item,
        value: platformTotal,
      }
      : item
  ));
}

export function useWorkspacePublicRequestsSection({
  branch,
}: UseWorkspacePublicRequestsSectionParams) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    t,
    locale,
    auth,
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
    shouldLoadCatalog: true,
    activePublicSection,
  });
  const { serviceByKey, categoryByKey, cityById } = useCatalogIndex({
    services: filters.services,
    categories: filters.categories,
    cities: filters.cities,
  });

  const data = useWorkspaceData({
    filter: filters.filter,
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

  const marketResponse = React.useMemo(
    () => data.workspaceRequests ?? buildEmptyWorkspaceMarketRequestsResponse({
      locale,
      state: activeRequestsState,
      period: activeRequestsPeriod,
      sort: activeRequestsSort ?? filters.sortBy,
      page: filters.page,
      limit: filters.limit,
    }),
    [
      activeRequestsPeriod,
      activeRequestsSort,
      activeRequestsState,
      data.workspaceRequests,
      filters.limit,
      filters.page,
      filters.sortBy,
      locale,
    ],
  );
  const hasMarketContract = data.workspaceRequests != null;
  const marketRequests = React.useMemo(
    () => mapWorkspaceRequestsResponseToPublicRequests(marketResponse),
    [marketResponse],
  );
  const publicRequestsItems = data.publicRequests?.items;
  const fallbackRequests = React.useMemo(
    () => publicRequestsItems ?? [],
    [publicRequestsItems],
  );
  const shouldUseFallbackList = !hasMarketContract
    || (marketRequests.length === 0 && marketResponse.list.total > 0 && fallbackRequests.length > 0);
  const publicRequestsTotal = data.publicRequests?.total ?? fallbackRequests.length;
  const requests = React.useMemo(
    () => (shouldUseFallbackList ? fallbackRequests : marketRequests),
    [fallbackRequests, marketRequests, shouldUseFallbackList],
  );
  const publicRequestsListItems = React.useMemo(
    () => filterPublicRequestsByState(publicRequestsItems ?? requests, activeRequestsState),
    [activeRequestsState, publicRequestsItems, requests],
  );
  const requestById = React.useMemo(
    () => new Map(requests.map((request) => [request.id, request])),
    [requests],
  );
  const favoriteRequestIds = React.useMemo(
    () => new Set((data.favoriteRequests ?? []).map((request) => request.id)),
    [data.favoriteRequests],
  );
  const interactions = useWorkspacePrivateInteractions({
    t,
    locale,
    isAuthed,
    isWorkspaceAuthed,
    authUserId: auth.user?.id,
    activeWorkspaceTab,
    nextPath,
    platformRequestsTotal: data.allRequestsSummary?.totalPublishedRequests ?? marketResponse.list.total,
    myOffers: data.myOffers,
    favoriteRequestIds,
    requestById,
    favoriteProviderLookup: new Set(),
    providerById: new Map(),
  });
  const offersByRequest = React.useMemo(
    () => buildOffersByRequestMap(data.myOffers),
    [data.myOffers],
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

  const platformTotal = data.allRequestsSummary?.totalPublishedRequests
    ?? publicRequestsTotal
    ?? marketResponse.list.total;
  const resolvedPage = shouldUseFallbackList
    ? (data.publicRequests?.page ?? filters.page)
    : (hasMarketContract ? marketResponse.list.page : (data.publicRequests?.page ?? filters.page));
  const resolvedLimit = shouldUseFallbackList
    ? (data.publicRequests?.limit ?? filters.limit)
    : (hasMarketContract ? marketResponse.list.limit : (data.publicRequests?.limit ?? filters.limit));
  const resolvedTotalResults = shouldUseFallbackList
    ? publicRequestsTotal
    : (hasMarketContract ? marketResponse.list.total : publicRequestsTotal);
  const summaryItems = normalizeSummaryItems({
    locale,
    state: activeRequestsState,
    summaryItems: hasMarketContract ? (marketResponse.summary?.items ?? []) : [],
    platformTotal,
    fallbackRequests,
  }) ?? buildFallbackSummaryItems({
      locale,
      state: activeRequestsState,
      requests: fallbackRequests,
      total: platformTotal,
    });
  const publicListPage = activeRequestsState === 'all'
    ? (data.publicRequests?.page ?? resolvedPage)
    : 1;
  const publicListLimit = activeRequestsState === 'all'
    ? (data.publicRequests?.limit ?? resolvedLimit)
    : Math.max(1, publicRequestsListItems.length || resolvedLimit);
  const publicListTotalPages = activeRequestsState === 'all'
    ? Math.max(1, Math.ceil(publicRequestsTotal / Math.max(1, publicListLimit)))
    : 1;
  const publicListDensity = resolveRequestsListDensityForPageSize(filters.limit);

  const publicMain = (
    <div className="stack-md">
      {hasMarketContract && data.isWorkspaceRequestsLoading ? (
        <WorkspaceRequestsSummaryStripSkeleton />
      ) : (
        <WorkspaceRequestsSummaryStrip
          locale={locale}
          items={summaryItems}
          onSelect={setRequestsState}
          variant="market"
        />
      )}
      <RequestsExplorerRequestsContent
        t={t}
        locale={locale}
        emptyCtaHref="/workspace?section=requests&scope=market"
        showTopFilters={false}
        showResultsSummary={false}
        categoryOptions={filters.categoryOptions}
        serviceOptions={filters.serviceOptions}
        cityOptions={filters.cityOptions}
        sortOptions={filters.sortOptions}
        categoryKey={filters.categoryKey}
        subcategoryKey={filters.subcategoryKey}
        cityId={filters.cityId}
        sortBy={filters.sortBy}
        totalResultsLabel={interactions.formatNumber.format(
          activeRequestsState === 'all' ? resolvedTotalResults : publicRequestsListItems.length,
        )}
        isCategoriesLoading={filters.isCategoriesLoading}
        isServicesLoading={filters.isServicesLoading}
        isPending={filters.isFiltersPending}
        appliedFilterChips={filters.appliedFilterChips}
        onCategoryChange={filters.onCategoryChangeTracked}
        onSubcategoryChange={filters.onSubcategoryChangeTracked}
        onCityChange={filters.onCityChangeTracked}
        onSortChange={filters.onSortChangeTracked}
        onReset={filters.onResetTracked}
        requests={publicRequestsListItems}
        isLoading={data.isLoading}
        isError={data.isError}
        offersByRequest={offersByRequest}
        favoriteRequestIds={favoriteRequestIds}
        pendingFavoriteRequestIds={interactions.pendingFavoriteRequestIds}
        pendingOfferRequestId={interactions.pendingOfferRequestId}
        totalPages={publicListTotalPages}
        openOfferSheet={interactions.onOpenOfferSheet}
        onWithdrawOffer={interactions.onWithdrawOffer}
        toggleRequestFavorite={interactions.onToggleRequestFavorite}
        serviceByKey={serviceByKey}
        categoryByKey={categoryByKey}
        cityById={cityById}
        formatDate={interactions.formatDate}
        formatPrice={interactions.formatPrice}
        page={publicListPage}
        limit={publicListLimit}
        setPage={filters.setPage}
        listDensity={publicListDensity}
      />
    </div>
  );

  const publicAside = marketResponse.decisionPanel ? (
    <div className="stack-md">
      <RequestsPrivateActionRail
        locale={locale}
        panel={marketResponse.decisionPanel}
        mode="default"
        activeRequestId={null}
        onStartDecisionMode={openMarketStats}
        onOpenQueueItem={openQueueItem}
        variant="market"
      />
    </div>
  ) : null;

  return {
    publicMain,
    publicAside,
  };
}
