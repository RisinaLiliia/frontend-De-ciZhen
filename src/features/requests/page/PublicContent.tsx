'use client';

import * as React from 'react';

import { RequestsFilters } from '@/components/requests/RequestsFilters';
import { RequestsList } from '@/components/requests/RequestsList';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';

type StatusFilter = {
  key: string;
  label: string;
};

type Props = {
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
  totalResultsLabel: string;
  resultsLabel: string;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function PublicContent({
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
  totalResultsLabel,
  resultsLabel,
  onPrevPage,
  onNextPage,
}: Props) {
  return (
    <section className="panel requests-panel">
      <RequestsFilters {...filtersProps} />

      {statusFilters.length > 0 ? (
        <div className="chip-row" role="tablist" aria-label="Statusfilter">
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

      <section id="requests-list" className="requests-list" role="tabpanel" aria-live="polite">
        <WorkspaceContentState
          isLoading={isLoading}
          isEmpty={!isError && requestsCount === 0}
          emptyTitle={hasActivePublicFilter ? 'Keine Auftraege gefunden.' : 'Noch keine Auftraege vorhanden.'}
          emptyHint={
            hasActivePublicFilter
              ? 'Passe die Filter an oder setze sie zurueck.'
              : 'Schau spaeter erneut vorbei oder pruefe eine andere Stadt.'
          }
          emptyCtaLabel={hasActivePublicFilter ? 'Filter zuruecksetzen' : undefined}
          emptyCtaHref={hasActivePublicFilter ? emptyCtaHref : undefined}
        >
          <RequestsList {...requestsListProps} />
        </WorkspaceContentState>
      </section>

      <div className="requests-pagination">
        <button type="button" className="btn-ghost" onClick={onPrevPage} disabled={page <= 1}>
          ←
        </button>
        <span className="typo-small">
          {resultsLabel} {totalResultsLabel} • {page}/{totalPages}
        </span>
        <button type="button" className="btn-ghost" onClick={onNextPage} disabled={page >= totalPages}>
          →
        </button>
      </div>
    </section>
  );
}

