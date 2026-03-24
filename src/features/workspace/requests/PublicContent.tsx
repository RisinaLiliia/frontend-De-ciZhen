'use client';

import * as React from 'react';

import { RequestsPaginatedPanel } from '@/components/requests/RequestsPaginatedPanel';
import { RequestsFilters, RequestsResultsSummary } from '@/components/requests/RequestsFilters';
import { RequestsList } from '@/components/requests/RequestsList';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import {
  DEFAULT_REQUESTS_LIST_DENSITY,
  type RequestsListDensity,
} from '@/lib/requests/pagination';
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
  initialListDensity?: RequestsListDensity;
  onListDensityChange?: (value: RequestsListDensity) => void;
  showFilterControls?: boolean;
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
  initialListDensity,
  onListDensityChange,
  showFilterControls = true,
}: Props) {
  const [listDensity, setListDensity] = React.useState<RequestsListDensity>(initialListDensity ?? DEFAULT_REQUESTS_LIST_DENSITY);
  const prevInitialDensityRef = React.useRef<RequestsListDensity | undefined>(initialListDensity);
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    if (initialListDensity == null) return;

    if (prevInitialDensityRef.current !== initialListDensity) {
      setListDensity(initialListDensity);
      prevInitialDensityRef.current = initialListDensity;
    }
  }, [initialListDensity]);

  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    onListDensityChange?.(listDensity);
  }, [listDensity, onListDensityChange]);

  const topSlot = showFilterControls ? (
    <RequestsFilters
      {...filtersProps}
      resultsLabel={resultsLabel}
      page={page}
      totalPages={totalPages}
      onPrevPage={onPrevPage}
      onNextPage={onNextPage}
      listDensity={listDensity}
      onListDensityChange={setListDensity}
    />
  ) : (
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
      onListDensityChange={setListDensity}
    />
  );

  const secondarySlot = (
    <WorkspaceChipToggleGroup
      items={statusFilters}
      selectedKey={activeStatusFilter}
      onSelect={onStatusFilterChange}
      ariaLabel={t(I18N_KEYS.requestsPage.statusFiltersLabel)}
    />
  );

  return (
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
      <RequestsList {...requestsListProps} />
    </RequestsPaginatedPanel>
  );
}
