'use client';

import * as React from 'react';

import { RequestsBottomPagination } from '@/components/requests/RequestsBottomPagination';
import { RequestsFilters, RequestsResultsSummary } from '@/components/requests/RequestsFilters';
import { RequestsList } from '@/components/requests/RequestsList';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
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
  onListDensityChange?: (value: 'single' | 'double') => void;
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
  onListDensityChange,
  showFilterControls = true,
}: Props) {
  const [listDensity, setListDensity] = React.useState<'single' | 'double'>('single');

  React.useEffect(() => {
    onListDensityChange?.(listDensity);
  }, [listDensity, onListDensityChange]);

  return (
    <section className="panel requests-panel">
      {showFilterControls ? (
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
      )}

      <WorkspaceChipToggleGroup
        items={statusFilters}
        selectedKey={activeStatusFilter}
        onSelect={onStatusFilterChange}
        ariaLabel={t(I18N_KEYS.requestsPage.statusFiltersLabel)}
      />

      <section
        id="requests-list"
        className={`requests-list requests-list--stable ${listDensity === 'double' ? 'is-double' : 'is-single'}`.trim()}
        role="region"
        aria-label={t(I18N_KEYS.requestsPage.resultsLabel)}
        aria-live="polite"
      >
        <WorkspaceContentState
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
        </WorkspaceContentState>
      </section>

      <RequestsBottomPagination
        t={t}
        page={page}
        totalPages={totalPages}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
      />
    </section>
  );
}
