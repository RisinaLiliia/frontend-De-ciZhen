'use client';

import * as React from 'react';

import { RequestsFilters } from '@/components/requests/RequestsFilters';
import { RequestsList } from '@/components/requests/RequestsList';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

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
}: Props) {
  const [listDensity, setListDensity] = React.useState<'single' | 'double'>('single');

  React.useEffect(() => {
    onListDensityChange?.(listDensity);
  }, [listDensity, onListDensityChange]);

  return (
    <section className="panel requests-panel">
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

      {statusFilters.length > 0 ? (
        <div className="chip-row" role="group" aria-label={t(I18N_KEYS.requestsPage.statusFiltersLabel)}>
          {statusFilters.map((filterItem) => (
            <button
              key={filterItem.key}
              type="button"
              className={`chip ${activeStatusFilter === filterItem.key ? 'is-active' : ''}`.trim()}
              onClick={() => onStatusFilterChange(filterItem.key)}
              aria-pressed={activeStatusFilter === filterItem.key}
            >
              {filterItem.label}
            </button>
          ))}
        </div>
      ) : null}

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

      <div className="requests-pagination">
        <span className="requests-page-nav__label">
          {page}/{Math.max(1, totalPages)}
        </span>
        <div className="requests-page-nav" role="group" aria-label={t(I18N_KEYS.requestsPage.paginationBottomLabel)}>
          <button
            type="button"
            className="btn-ghost requests-page-nav__btn"
            onClick={onPrevPage}
            disabled={page <= 1}
            aria-label={t(I18N_KEYS.requestsPage.paginationPrev)}
          >
            ←
          </button>
          <button
            type="button"
            className="btn-ghost requests-page-nav__btn"
            onClick={onNextPage}
            disabled={page >= totalPages}
            aria-label={t(I18N_KEYS.requestsPage.paginationNext)}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
