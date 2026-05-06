'use client';

import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type {
  WorkspaceRequestsResponseDto,
} from '@/lib/api/dto/workspace';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';

type WorkspaceSummaryItems = NonNullable<NonNullable<WorkspaceRequestsResponseDto['summary']>['items']>;

export type ResolvedWorkspacePublicRequestsData = {
  requests: RequestResponseDto[];
  publicRequestsListItems: RequestResponseDto[];
  publicRequestsTotal: number;
  platformTotal: number;
  resolvedTotalResults: number;
  summaryItems: NonNullable<WorkspaceRequestsResponseDto['summary']>['items'];
  decisionPanel: WorkspaceRequestsResponseDto['decisionPanel'];
  publicListPage: number;
  publicListLimit: number;
  publicListTotalPages: number;
};

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
    publicRequestsItems,
    publicRequestsTotalValue,
    publicRequestsPage,
    publicRequestsLimit,
    filtersPage,
    filtersLimit,
    platformRequestsTotal,
  } = params;

  const requests = publicRequestsItems ?? [];
  const publicRequestsTotal = publicRequestsTotalValue ?? requests.length;
  const publicRequestsListItems = requests;
  const platformTotal = platformRequestsTotal
    ?? publicRequestsTotal
    ?? marketResponse.list.total;
  const resolvedTotalResults = publicRequestsTotal;
  const summaryItems = normalizeSummaryItems({
    locale,
    state: activeRequestsState,
    summaryItems: hasMarketContract ? (marketResponse.summary?.items ?? []) : [],
    platformTotal,
    fallbackRequests: requests,
  }) ?? buildFallbackSummaryItems({
      locale,
      state: activeRequestsState,
      requests,
      total: platformTotal,
    });
  const publicListPage = publicRequestsPage ?? filtersPage;
  const publicListLimit = publicRequestsLimit ?? filtersLimit;
  const publicListTotalPages = Math.max(1, Math.ceil(publicRequestsTotal / Math.max(1, publicListLimit)));
  const decisionPanel = marketResponse.decisionPanel ?? null;

  return {
    requests,
    publicRequestsListItems,
    publicRequestsTotal,
    platformTotal,
    resolvedTotalResults,
    summaryItems,
    decisionPanel,
    publicListPage,
    publicListLimit,
    publicListTotalPages,
  };
}
