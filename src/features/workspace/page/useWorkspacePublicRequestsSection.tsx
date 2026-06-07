'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildRequestsWorkspacePublicBody,
  RequestsWorkspaceBody,
  useWorkspaceData,
} from '@/features/workspace/requests';
import { WorkspaceRequestsAside } from '@/features/workspace/requests/components/WorkspaceRequestsAside';
import {
  buildWorkspaceRequestsSurfaceModel,
  buildWorkspaceRequestsViewModelFromResponse,
} from '@/features/workspace/requests/workspaceRequestsView.model';
import { useWorkspaceRequestUserInteractions } from '@/features/workspace/page/useWorkspaceRequestUserInteractions';
import { useWorkspacePublicFilters } from '@/features/workspace';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import type { ActiveDecisionState } from '@/features/workspace/requests/requestsDecision.model';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { resolveRequestsListDensityForPageSize } from '@/lib/requests/pagination';

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
    guestLoginHref,
    nextPath,
  } = routeState;

  const filters = useWorkspacePublicFilters({
    t,
    locale,
    shouldLoadCatalog: enabled,
    activePublicSection,
  });
  const {
    page: publicPage,
    setPage: setPublicPage,
  } = filters;

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
  const { contractData, requestUserStateData } = data;

  const marketResponse = contractData.workspaceRequests;
  const marketModel = React.useMemo(
    () => buildWorkspaceRequestsViewModelFromResponse(marketResponse),
    [marketResponse],
  );
  const marketListDensity = React.useMemo(
    () => resolveRequestsListDensityForPageSize(filters.limit),
    [filters.limit],
  );
  const marketTotalPages = React.useMemo(() => {
    if (!marketResponse) return 1;
    return Math.max(1, Math.ceil(marketResponse.list.total / Math.max(1, marketResponse.list.limit)));
  }, [marketResponse]);
  const decisionPanel = marketResponse?.decisionPanel ?? null;
  const marketDecisionState = React.useMemo<ActiveDecisionState>(
    () => ({
      mode: 'default',
      activeRequestId: null,
      completedInSession: 0,
    }),
    [],
  );
  const marketPagination = React.useMemo(() => {
    if (!marketResponse) return null;
    return {
      page: marketResponse.list.page,
      totalPages: marketTotalPages,
      onPageChange: setPublicPage,
    };
  }, [marketResponse, marketTotalPages, setPublicPage]);

  React.useEffect(() => {
    if (!marketResponse) return;
    if (publicPage <= marketTotalPages) return;
    setPublicPage(marketTotalPages);
  }, [marketResponse, marketTotalPages, publicPage, setPublicPage]);

  const favoriteRequestIds = React.useMemo(
    () => new Set(requestUserStateData.favoriteRequests.map((request) => request.id)),
    [requestUserStateData.favoriteRequests],
  );
  const favoriteRequestById = React.useMemo<ReadonlyMap<string, RequestResponseDto>>(
    () =>
      new Map(
        requestUserStateData.favoriteRequests.map((request) => [request.id, request] as const),
      ),
    [requestUserStateData.favoriteRequests],
  );
  const requestUserInteractions = useWorkspaceRequestUserInteractions({
    t,
    locale,
    isAuthed,
    nextPath,
    favoriteRequestIds,
    requestById: favoriteRequestById,
    favoriteProviderLookup: new Set(),
    providerById: new Map(),
  });

  const openMarketStats = React.useCallback(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('section', 'stats');
    nextParams.delete('state');
    router.replace(buildWorkspaceHref(pathname, nextParams), { scroll: false });
  }, [pathname, router, searchParams]);

  const openQueueItem = React.useCallback((requestId: string) => {
    router.push(`/requests/${requestId}`);
  }, [router]);

  if (!enabled) {
    return {
      publicMain: null,
      publicAside: null,
    };
  }

  const publicMain = (
    <div className="stack-md">
      <RequestsWorkspaceBody
        body={buildRequestsWorkspacePublicBody(buildWorkspaceRequestsSurfaceModel({
          variant: 'market',
          locale,
          isWorkspaceAuthed,
          guestLoginHref,
          listDensity: marketListDensity,
          pagination: marketPagination,
          favoriteState: {
            favoriteRequestIds,
            pendingFavoriteRequestIds: requestUserInteractions.pendingFavoriteRequestIds,
            onToggleRequestFavorite: requestUserInteractions.onToggleRequestFavorite,
          },
          model: marketModel,
          isLoading: contractData.isWorkspaceRequestsLoading,
          isError: contractData.isWorkspaceRequestsError,
          decisionState: marketDecisionState,
          decisionQueueIds: [],
          onEnterDecisionMode: openMarketStats,
          onOpenDecisionItem: openQueueItem,
          onExitDecisionMode: () => {},
          listContext: {
            onOpenRequest: (requestId) => openQueueItem(requestId),
            onSendOffer: (requestId) => openQueueItem(requestId),
            onEditOffer: (requestId) => openQueueItem(requestId),
          },
          emptyCtaHref: '/workspace?section=requests&scope=market',
          secondaryCtaHref: '/workspace?section=providers',
        }))}
      />
    </div>
  );

  const publicAside = (
    <WorkspaceRequestsAside
      locale={locale}
      variant="market"
      summaryItems={marketResponse?.summary.items}
      isSummaryLoading={contractData.isWorkspaceRequestsLoading}
      panel={decisionPanel}
      onStartDecisionMode={openMarketStats}
      onOpenQueueItem={openQueueItem}
    />
  );

  return {
    publicMain,
    publicAside,
  };
}
