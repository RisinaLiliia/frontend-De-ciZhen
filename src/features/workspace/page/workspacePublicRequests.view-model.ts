'use client';

import type { ComponentProps } from 'react';

import { buildRequestsExplorerRequestsContentProps } from '@/components/requests/requestsExplorer.model';
import type {
  RequestsExplorerCatalogIndex,
  RequestsExplorerSharedFilters,
} from '@/components/requests/requestsExplorer.types';
import { RequestsPrivateActionRail } from '@/features/workspace/requests';
import {
  buildRequestsWorkspaceDecisionRailProps,
  buildRequestsWorkspaceSummaryStripProps,
} from '@/features/workspace/requests/requestsWorkspaceSurface.model';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import type { WorkspaceRequestsResponseDto } from '@/lib/api/dto/workspace';

export function buildWorkspacePublicRequestsSummaryStripProps(params: {
  locale: WorkspaceBranchProps['locale'];
  items: NonNullable<NonNullable<WorkspaceRequestsResponseDto['summary']>['items']>;
  onSelect: (key: string) => void;
}) {
  return buildRequestsWorkspaceSummaryStripProps({
    locale: params.locale,
    items: params.items,
    onSelect: params.onSelect,
    variant: 'market',
  });
}

export function buildWorkspacePublicRequestsListProps(params: {
  t: WorkspaceBranchProps['t'];
  locale: WorkspaceBranchProps['locale'];
  emptyCtaHref: string;
  sharedFilters: RequestsExplorerSharedFilters;
  requestsData: {
    totalResultsLabel: string;
    requests: Parameters<typeof buildRequestsExplorerRequestsContentProps>[0]['requestsData']['requests'];
    isLoading: boolean;
    isError: boolean;
    offersByRequest?: Parameters<typeof buildRequestsExplorerRequestsContentProps>[0]['requestsData']['offersByRequest'];
    favoriteRequestIds?: Parameters<typeof buildRequestsExplorerRequestsContentProps>[0]['requestsData']['favoriteRequestIds'];
    pendingFavoriteRequestIds?: Parameters<typeof buildRequestsExplorerRequestsContentProps>[0]['requestsData']['pendingFavoriteRequestIds'];
    pendingOfferRequestId: string | null;
    totalPages: number;
    openOfferSheet: (requestId: string) => void;
    onWithdrawOffer?: (offerId: string, requestId?: string) => void;
    toggleRequestFavorite: (requestId: string) => Promise<void> | void;
  };
  catalogIndex: RequestsExplorerCatalogIndex;
  formatDate: Intl.DateTimeFormat;
  formatPrice: Intl.NumberFormat;
  summaryStripProps?: ReturnType<typeof buildWorkspacePublicRequestsSummaryStripProps>;
  isSummaryStripLoading: boolean;
}) {
  return buildRequestsExplorerRequestsContentProps({
    t: params.t,
    locale: params.locale,
    emptyCtaHref: params.emptyCtaHref,
    sharedFilters: params.sharedFilters,
    requestsData: params.requestsData,
    catalogIndex: params.catalogIndex,
    formatDate: params.formatDate,
    formatPrice: params.formatPrice,
    showTopFilters: false,
    summaryStripProps: params.summaryStripProps,
    isSummaryStripLoading: params.isSummaryStripLoading,
  });
}

export function buildWorkspacePublicRequestsAsideProps(params: {
  locale: WorkspaceBranchProps['locale'];
  panel: NonNullable<WorkspaceRequestsResponseDto['decisionPanel']>;
  onStartDecisionMode: () => void;
  onOpenQueueItem: (requestId: string) => void;
}): ComponentProps<typeof RequestsPrivateActionRail> {
  return buildRequestsWorkspaceDecisionRailProps({
    locale: params.locale,
    panel: params.panel,
    mode: 'default',
    activeRequestId: null,
    onStartDecisionMode: params.onStartDecisionMode,
    onOpenQueueItem: params.onOpenQueueItem,
    variant: 'market',
  });
}
