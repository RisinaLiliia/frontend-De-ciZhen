'use client';

import * as React from 'react';
import type { ComponentProps } from 'react';

import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { RequestsListShellHeader } from '@/components/requests/RequestsListShellHeader';
import { RequestsPaginatedPanel } from '@/components/requests/RequestsPaginatedPanel';
import { PublicRequestsCardList } from '@/components/requests/PublicRequestsCardList';
import type { RequestsListProps } from '@/components/requests/requestsList.types';
import type { RequestsFilters } from '@/components/requests/RequestsFilters';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import {
  DEFAULT_REQUESTS_LIST_DENSITY,
  type RequestsListDensity,
} from '@/lib/requests/pagination';
import {
  WorkspaceRequestsSummaryStrip,
  WorkspaceRequestsSummaryStripSkeleton,
} from '@/features/workspace/ai-rail/WorkspaceRequestsSummaryStrip';
import { WorkspaceChipToggleGroup } from '@/features/workspace/shared';
import { WorkspacePublicRequestSessionDialog } from '@/features/workspace/requests/WorkspacePublicRequestSessionDialog';
import { useWorkspacePublicRequestOverlayFlow } from '@/features/workspace/requests/useWorkspacePublicRequestOverlayFlow';
import type { RequestsListShellHeaderMode } from '@/components/requests/RequestsListShellHeader';

export type PublicContentProps = {
  t: (key: I18nKey) => string;
  filtersProps: React.ComponentProps<typeof RequestsFilters>;
  statusFilters: Array<{
    key: string;
    label: string;
  }>;
  activeStatusFilter: string;
  onStatusFilterChange: (status: string) => void;
  isLoading: boolean;
  isError: boolean;
  requestsCount: number;
  hasActivePublicFilter: boolean;
  emptyCtaHref: string;
  requestsListProps: RequestsListProps;
  page: number;
  totalPages: number;
  resultsLabel: string;
  onPrevPage: () => void;
  onNextPage: () => void;
  listDensity?: RequestsListDensity;
  onListDensityChange?: (value: RequestsListDensity) => void;
  header?: RequestsListShellHeaderMode;
  summaryStripProps?: ComponentProps<typeof WorkspaceRequestsSummaryStrip>;
  isSummaryStripLoading?: boolean;
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
  header = { kind: 'filters' },
  summaryStripProps,
  isSummaryStripLoading = false,
}: PublicContentProps) {
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
      {isSummaryStripLoading && !summaryStripProps ? (
        <WorkspaceRequestsSummaryStripSkeleton />
      ) : null}
      {summaryStripProps ? <WorkspaceRequestsSummaryStrip {...summaryStripProps} /> : null}
      <RequestsPaginatedPanel
        t={t}
        page={page}
        totalPages={totalPages}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        topSlot={(
          <RequestsListShellHeader
            t={t}
            filtersProps={filtersProps}
            page={page}
            totalPages={totalPages}
            resultsLabel={resultsLabel}
            listDensity={listDensity}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
            onListDensityChange={handleListDensityChange}
            header={header}
          />
        )}
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
        <PublicRequestsCardList {...requestsListPropsWithOverlay} />
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
