'use client';

import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { CountBadge } from '@/components/ui/CountBadge';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { hasRequestsPagination } from './requestsFilters.model';
import type { RequestsResultsSummaryProps } from './requestsFilters.types';

export function RequestsResultsSummary({
  t,
  totalResults,
  resultsLabel,
  page = 1,
  totalPages = 1,
  isPending = false,
  listDensity = 'single',
  onPrevPage,
  onNextPage,
  onListDensityChange,
}: RequestsResultsSummaryProps) {
  const hasPagination = hasRequestsPagination({ onPrevPage, onNextPage });
  const hasDensityToggle = typeof onListDensityChange === 'function';
  const controlsDisabled = isPending;

  return (
    <div className="requests-filter-summary">
      <div className="requests-results" aria-live="polite">
        <span className="typo-small">{resultsLabel ?? t(I18N_KEYS.requestsPage.countLabel)}</span>
        <CountBadge as="strong" value={totalResults} />
        {isPending ? <span className="sr-only">{t(I18N_KEYS.requestsPage.updatingLabel)}</span> : null}
      </div>
      {(hasDensityToggle || hasPagination) ? (
        <div className="requests-filter-summary__controls">
          {hasDensityToggle ? (
            <div className="requests-view-toggle" role="group" aria-label={t(I18N_KEYS.requestsPage.viewModeLabel)}>
              <button
                type="button"
                className={`requests-view-toggle__btn ${listDensity === 'single' ? 'is-active' : ''}`.trim()}
                aria-label={t(I18N_KEYS.requestsPage.viewModeSingle)}
                aria-pressed={listDensity === 'single'}
                onClick={() => onListDensityChange?.('single')}
              >
                <span className="requests-layout-icon requests-layout-icon--single" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`requests-view-toggle__btn ${listDensity === 'double' ? 'is-active' : ''}`.trim()}
                aria-label={t(I18N_KEYS.requestsPage.viewModeDouble)}
                aria-pressed={listDensity === 'double'}
                onClick={() => onListDensityChange?.('double')}
              >
                <span className="requests-layout-icon requests-layout-icon--double" aria-hidden="true" />
              </button>
            </div>
          ) : null}
          {hasPagination ? (
            <RequestsPageNav
              page={page}
              totalPages={totalPages}
              disabled={controlsDisabled}
              onPrevPage={onPrevPage}
              onNextPage={onNextPage}
              ariaLabel={t(I18N_KEYS.requestsPage.paginationLabel)}
              prevAriaLabel={t(I18N_KEYS.requestsPage.paginationPrev)}
              nextAriaLabel={t(I18N_KEYS.requestsPage.paginationNext)}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
