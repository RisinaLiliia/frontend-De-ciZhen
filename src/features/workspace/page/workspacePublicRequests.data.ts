'use client';

import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type {
  WorkspaceRequestsResponseDto,
} from '@/lib/api/dto/workspace';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';

type WorkspaceSummaryItems = NonNullable<NonNullable<WorkspaceRequestsResponseDto['summary']>['items']>;

export type ResolvedWorkspacePublicRequestsData = {
  fallbackRequests: RequestResponseDto[];
  shouldUseFallbackList: boolean;
  requests: RequestResponseDto[];
  publicRequestsListItems: RequestResponseDto[];
  publicRequestsTotal: number;
  platformTotal: number;
  resolvedPage: number;
  resolvedLimit: number;
  resolvedTotalResults: number;
  summaryItems: NonNullable<WorkspaceRequestsResponseDto['summary']>['items'];
  decisionPanel: WorkspaceRequestsResponseDto['decisionPanel'];
  publicListPage: number;
  publicListLimit: number;
  publicListTotalPages: number;
};

export function filterPublicRequestsByState(
  requests: RequestResponseDto[],
  state: WorkspaceBranchProps['routeState']['activeRequestsState'],
) {
  if (state === 'all') return requests;
  if (state === 'attention') return requests.filter((request) => request.status === 'published');
  if (state === 'execution') return requests.filter((request) => request.status === 'matched');
  if (state === 'completed') return requests.filter((request) => request.status === 'closed');
  return requests;
}

export function buildFallbackSummaryItems(params: {
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

export function normalizeSummaryItems(params: {
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

  return summaryItems;
}

export function resolveWorkspacePublicRequestsData(params: {
  locale: WorkspaceBranchProps['locale'];
  activeRequestsState: WorkspaceBranchProps['routeState']['activeRequestsState'];
  hasMarketContract: boolean;
  marketResponse: WorkspaceRequestsResponseDto;
  marketRequests: RequestResponseDto[];
  publicRequestsItems?: RequestResponseDto[];
  publicRequestsTotalValue?: number;
  publicRequestsPage?: number;
  publicRequestsLimit?: number;
  filtersPage: number;
  filtersLimit: number;
  platformRequestsTotal?: number;
}) : ResolvedWorkspacePublicRequestsData {
  const {
    locale,
    activeRequestsState,
    hasMarketContract,
    marketResponse,
    marketRequests,
    publicRequestsItems,
    publicRequestsTotalValue,
    publicRequestsPage,
    publicRequestsLimit,
    filtersPage,
    filtersLimit,
    platformRequestsTotal,
  } = params;

  const fallbackRequests = publicRequestsItems ?? [];
  const shouldUseFallbackList = !hasMarketContract
    || (marketRequests.length === 0 && marketResponse.list.total > 0 && fallbackRequests.length > 0);
  const publicRequestsTotal = publicRequestsTotalValue ?? fallbackRequests.length;
  const requests = shouldUseFallbackList ? fallbackRequests : marketRequests;
  const publicRequestsListItems = shouldUseFallbackList
    ? filterPublicRequestsByState(publicRequestsItems ?? requests, activeRequestsState)
    : requests;
  const platformTotal = platformRequestsTotal
    ?? publicRequestsTotal
    ?? marketResponse.list.total;
  const resolvedPage = shouldUseFallbackList
    ? (publicRequestsPage ?? filtersPage)
    : (hasMarketContract ? marketResponse.list.page : (publicRequestsPage ?? filtersPage));
  const resolvedLimit = shouldUseFallbackList
    ? (publicRequestsLimit ?? filtersLimit)
    : (hasMarketContract ? marketResponse.list.limit : (publicRequestsLimit ?? filtersLimit));
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
    ? (publicRequestsPage ?? resolvedPage)
    : 1;
  const publicListLimit = activeRequestsState === 'all'
    ? (publicRequestsLimit ?? resolvedLimit)
    : Math.max(1, publicRequestsListItems.length || resolvedLimit);
  const publicListTotalPages = activeRequestsState === 'all'
    ? Math.max(1, Math.ceil(publicRequestsTotal / Math.max(1, publicListLimit)))
    : 1;
  const decisionPanel = hasMarketContract ? (marketResponse.decisionPanel ?? null) : null;

  return {
    fallbackRequests,
    shouldUseFallbackList,
    requests,
    publicRequestsListItems,
    publicRequestsTotal,
    platformTotal,
    resolvedPage,
    resolvedLimit,
    resolvedTotalResults,
    summaryItems,
    decisionPanel,
    publicListPage,
    publicListLimit,
    publicListTotalPages,
  };
}
