'use client';

import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type {
  WorkspaceRequestsDecisionPanelDto,
  WorkspaceRequestsResponseDto,
} from '@/lib/api/dto/workspace';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';

type WorkspaceSummaryItems = NonNullable<NonNullable<WorkspaceRequestsResponseDto['summary']>['items']>;
type WorkspaceDecisionQueueItem = WorkspaceRequestsDecisionPanelDto['queue'][number];
const DAY_IN_MS = 24 * 60 * 60 * 1000;

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
  decisionPanel: WorkspaceRequestsDecisionPanelDto;
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

  return summaryItems.map((item) => (
    item.key === 'all'
      ? {
        ...item,
        value: platformTotal,
      }
      : item
  ));
}

function resolveRequestTimestamp(request: RequestResponseDto) {
  const source = request.publishedAt ?? request.createdAt ?? request.preferredDate;
  const timestamp = Date.parse(source);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function isRequestOlderThan24h(request: RequestResponseDto, nowMs: number) {
  const timestamp = resolveRequestTimestamp(request);
  if (timestamp == null) return false;
  return nowMs - timestamp >= DAY_IN_MS;
}

function buildQueueItem(params: {
  request: RequestResponseDto;
  actionType: WorkspaceDecisionQueueItem['actionType'];
  actionLabel: string;
  actionPriority: number;
  actionPriorityLevel: WorkspaceDecisionQueueItem['actionPriorityLevel'];
  actionReason?: string | null;
}): WorkspaceDecisionQueueItem {
  const { request, actionType, actionLabel, actionPriority, actionPriorityLevel, actionReason } = params;

  return {
    requestId: request.id,
    title: request.title?.trim() || request.subcategoryName?.trim() || request.categoryName?.trim() || request.serviceKey,
    actionType,
    actionLabel,
    actionPriority,
    actionPriorityLevel,
    actionReason: actionReason ?? null,
    categoryLabel: request.categoryName?.trim() || request.categoryKey?.trim() || null,
    cityLabel: request.cityName?.trim() || request.clientCity?.trim() || null,
  };
}

export function buildFallbackDecisionPanel(params: {
  locale: WorkspaceBranchProps['locale'];
  requests: RequestResponseDto[];
  nowMs?: number;
}): WorkspaceRequestsDecisionPanelDto {
  const { locale, requests, nowMs = Date.now() } = params;
  const isDe = locale === 'de';
  const publishedRequests = requests.filter((request) => request.status === 'published');
  const matchedRequests = requests.filter((request) => request.status === 'matched');
  const closedRequests = requests.filter((request) => request.status === 'closed');
  const overdueRequests = publishedRequests.filter((request) => isRequestOlderThan24h(request, nowMs));
  const recentPublishedRequests = publishedRequests.filter((request) => !isRequestOlderThan24h(request, nowMs));

  const queue: WorkspaceDecisionQueueItem[] = [
    ...matchedRequests.map((request) => buildQueueItem({
      request,
      actionType: 'confirm_contract',
      actionLabel: isDe ? 'Vertrag ansehen' : 'View contract',
      actionPriority: 90,
      actionPriorityLevel: 'high',
      actionReason: isDe ? 'Bereits vergeben' : 'Already assigned',
    })),
    ...overdueRequests.map((request) => buildQueueItem({
      request,
      actionType: 'overdue_followup',
      actionLabel: isDe ? 'Seit 24h ohne Aktion' : 'No action for 24h',
      actionPriority: 70,
      actionPriorityLevel: 'medium',
      actionReason: isDe ? 'Offene Nachfrage' : 'Open demand',
    })),
    ...recentPublishedRequests.map((request) => buildQueueItem({
      request,
      actionType: 'review_offers',
      actionLabel: isDe ? 'Neu im Markt' : 'New on market',
      actionPriority: 50,
      actionPriorityLevel: 'low',
      actionReason: isDe ? 'Neues Marktsignal' : 'New market signal',
    })),
  ].slice(0, 5);

  return {
    summary: {
      totalNeedsAction: matchedRequests.length + overdueRequests.length + recentPublishedRequests.length,
      highPriorityCount: matchedRequests.length,
      newOffersCount: recentPublishedRequests.length,
      replyRequiredCount: 0,
      confirmCompletionCount: 0,
      overdueCount: overdueRequests.length,
    },
    primaryAction: {
      label: isDe ? 'Markt prüfen' : 'Review market',
      mode: 'decision',
      targetFilter: 'needs_action',
    },
    queue,
    overview: {
      highUrgency: publishedRequests.length,
      inProgress: matchedRequests.length,
      completedThisPeriod: closedRequests.length,
    },
  };
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
  const publicRequestsListItems = filterPublicRequestsByState(publicRequestsItems ?? requests, activeRequestsState);
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
  const decisionPanel = hasMarketContract && marketResponse.decisionPanel
    ? marketResponse.decisionPanel
    : buildFallbackDecisionPanel({
      locale,
      requests: publicRequestsListItems,
    });

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
