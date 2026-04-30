'use client';

import * as React from 'react';

import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { RequestsPaginatedPanel } from '@/components/requests/RequestsPaginatedPanel';
import { RequestsFilters, RequestsResultsSummary } from '@/components/requests/RequestsFilters';
import { RequestsList } from '@/components/requests/RequestsList';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import {
  DEFAULT_REQUESTS_LIST_DENSITY,
  type RequestsListDensity,
} from '@/lib/requests/pagination';
import { WorkspacePublicRequestSessionDialog } from '@/features/workspace/requests/WorkspacePublicRequestSessionDialog';
import { useWorkspacePublicRequestOverlayFlow } from '@/features/workspace/requests/useWorkspacePublicRequestOverlayFlow';
import type { MyRequestsSummaryItem } from '@/features/workspace/requests/myRequestsView.model';
import {
  WorkspaceRequestsSummaryStrip,
  WorkspaceRequestsSummaryStripSkeleton,
} from '@/features/workspace/requests/components/WorkspaceRequestsSummaryStrip';
import { WorkspaceChipToggleGroup } from './WorkspaceChipToggleGroup';

type StatusFilter = {
  key: string;
  label: string;
};

type Props = {
  t: (key: I18nKey) => string;
  filtersProps: React.ComponentProps<typeof RequestsFilters>;
  statusFilters: StatusFilter[];
  activeStatusFilter: string;
  onStatusFilterChange: (status: string) => void;
  isLoading: boolean;
  isError: boolean;
  requestsCount: number;
  hasActivePublicFilter: boolean;
  emptyCtaHref: string;
  requestsListProps: React.ComponentProps<typeof RequestsList>;
  page: number;
  totalPages: number;
  resultsLabel: string;
  onPrevPage: () => void;
  onNextPage: () => void;
  listDensity?: RequestsListDensity;
  onListDensityChange?: (value: RequestsListDensity) => void;
  showFilterControls?: boolean;
  showResultsSummary?: boolean;
  showResultsCount?: boolean;
  showDensityToggle?: boolean;
  showPaginationControls?: boolean;
  summaryItems?: MyRequestsSummaryItem[];
  onSummaryItemSelect?: (key: string) => void;
  summaryVariant?: 'private' | 'market';
};

export function PublicContent({
  t,
  filtersProps,
  statusFilters,
  activeStatusFilter,
  onStatusFilterChange,
  isLoading,
  isError,
  requestsCount,
  hasActivePublicFilter,
  emptyCtaHref,
  requestsListProps,
  page,
  totalPages,
  resultsLabel,
  onPrevPage,
  onNextPage,
  listDensity = DEFAULT_REQUESTS_LIST_DENSITY,
  onListDensityChange,
  showFilterControls = true,
  showResultsSummary = true,
  showResultsCount = true,
  showDensityToggle = true,
  showPaginationControls = true,
  summaryItems,
  onSummaryItemSelect,
  summaryVariant = 'private',
}: Props) {
  const authStatus = useAuthStatus();
  const {
    activeChatState,
    activeOfferRequestId,
    activeRequestState,
    closeChat,
    closeOfferSheet,
    dismissSession,
    openChatConversation,
    openOfferSheet,
    openRequest,
  } = useWorkspacePublicRequestOverlayFlow({
    locale: requestsListProps.locale,
    requests: requestsListProps.requests,
  });
  const handleListDensityChange = React.useCallback((nextDensity: RequestsListDensity) => {
    onListDensityChange?.(nextDensity);
  }, [onListDensityChange]);

  const requestsListPropsWithOverlay = React.useMemo(
    () => ({
      ...requestsListProps,
      onOpenRequest: (requestId: string) => openRequest(requestId, 'view'),
      onSendOffer: authStatus === 'authenticated'
        ? (requestId: string) => openOfferSheet(requestId)
        : requestsListProps.onSendOffer,
      onEditOffer: authStatus === 'authenticated'
        ? (requestId: string) => openOfferSheet(requestId)
        : requestsListProps.onEditOffer,
    }),
    [authStatus, openOfferSheet, openRequest, requestsListProps],
  );

  const topSlot = showFilterControls ? (
    <RequestsFilters
      {...filtersProps}
      resultsLabel={resultsLabel}
      page={page}
      totalPages={totalPages}
      onPrevPage={onPrevPage}
      onNextPage={onNextPage}
      listDensity={listDensity}
      onListDensityChange={handleListDensityChange}
    />
  ) : showResultsSummary ? (
    <RequestsResultsSummary
      t={t}
      totalResults={filtersProps.totalResults}
      resultsLabel={resultsLabel}
      page={page}
      totalPages={totalPages}
      isPending={filtersProps.isPending}
      listDensity={listDensity}
      onPrevPage={onPrevPage}
      onNextPage={onNextPage}
      onListDensityChange={handleListDensityChange}
      showResultsCount={showResultsCount}
      showDensityToggle={showDensityToggle}
      showPaginationControls={showPaginationControls}
    />
  ) : null;

  const secondarySlot = statusFilters.length > 0 ? (
    <WorkspaceChipToggleGroup
      items={statusFilters}
      selectedKey={activeStatusFilter}
      onSelect={onStatusFilterChange}
      ariaLabel={t(I18N_KEYS.requestsPage.statusFiltersLabel)}
    />
  ) : null;

  return (
    <>
      {isLoading && summaryItems == null && onSummaryItemSelect ? (
        <WorkspaceRequestsSummaryStripSkeleton />
      ) : null}
      {summaryItems && onSummaryItemSelect ? (
        <WorkspaceRequestsSummaryStrip
          locale={requestsListProps.locale}
          items={summaryItems}
          onSelect={onSummaryItemSelect}
          variant={summaryVariant}
        />
      ) : null}
      <RequestsPaginatedPanel
        t={t}
        page={page}
        totalPages={totalPages}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        topSlot={topSlot}
        secondarySlot={secondarySlot}
        listId="requests-list"
        listAriaLabel={t(I18N_KEYS.requestsPage.resultsLabel)}
        listDensity={listDensity}
        isLoading={isLoading}
        isEmpty={!isError && requestsCount === 0}
        emptyTitle={
          hasActivePublicFilter
            ? t(I18N_KEYS.requestsPage.emptyFilteredTitle)
            : t(I18N_KEYS.requestsPage.emptyDefaultTitle)
        }
        emptyHint={
          hasActivePublicFilter
            ? t(I18N_KEYS.requestsPage.emptyFilteredHint)
            : t(I18N_KEYS.requestsPage.emptyDefaultHint)
        }
        emptyCtaLabel={hasActivePublicFilter ? t(I18N_KEYS.requestsPage.clearFilters) : undefined}
        emptyCtaHref={hasActivePublicFilter ? emptyCtaHref : undefined}
      >
        <RequestsList {...requestsListPropsWithOverlay} />
      </RequestsPaginatedPanel>

      {(activeRequestState || activeOfferRequestId || activeChatState) ? (
        <WorkspacePublicRequestSessionDialog
          locale={requestsListProps.locale}
          activeRequestState={activeRequestState}
          activeOfferRequestId={activeOfferRequestId}
          activeChatState={activeChatState}
          onDismissSession={dismissSession}
          onCloseOfferSheet={closeOfferSheet}
          onCloseChat={closeChat}
          onOpenRequest={openRequest}
          onOpenOfferSheet={openOfferSheet}
          onOpenChatConversation={openChatConversation}
        />
      ) : null}
    </>
  );
}
