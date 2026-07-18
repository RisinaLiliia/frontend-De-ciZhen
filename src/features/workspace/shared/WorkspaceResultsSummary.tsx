'use client';

import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { CountBadge } from '@/components/ui/CountBadge';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { hasRequestsPagination } from '@/components/requests/requestsFilters.model';
import { WorkspaceViewToggle } from './WorkspaceViewToggle';
import type { WorkspaceResultsSummaryProps } from './workspaceListPrimitives.types';

export function WorkspaceResultsSummary({
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
  controls,
  classNamespace = 'workspace',
}: WorkspaceResultsSummaryProps) {
  const hasPagination = (controls?.pagination ?? true) && hasRequestsPagination({ onPrevPage, onNextPage });
  const hasDensityToggle = (controls?.densityToggle ?? true) && typeof onListDensityChange === 'function';
  const controlsDisabled = isPending;
  const hasVisibleResultsCount = controls?.resultsCount ?? true;

  if (!hasVisibleResultsCount && !hasDensityToggle && !hasPagination) {
    return null;
  }

  return (
    <div
      className={
        classNamespace === 'workspace'
          ? 'workspace-results-summary'
          : 'requests-filter-summary'
      }
    >
      {hasVisibleResultsCount ? (
        <div
          className={classNamespace === 'workspace' ? 'workspace-results' : 'requests-results'}
          aria-live="polite"
        >
          <span className="typo-small">{resultsLabel ?? t(I18N_KEYS.requestsPage.countLabel)}</span>
          <CountBadge as="strong" value={totalResults} />
          {isPending ? <span className="sr-only">{t(I18N_KEYS.requestsPage.updatingLabel)}</span> : null}
        </div>
      ) : (
        <div aria-hidden="true" />
      )}
      {(hasDensityToggle || hasPagination) ? (
        <div
          className={
            classNamespace === 'workspace'
              ? 'workspace-results-summary__controls'
              : 'requests-filter-summary__controls'
          }
        >
          {hasDensityToggle ? (
            <WorkspaceViewToggle
              t={t}
              listDensity={listDensity}
              onChange={(value) => onListDensityChange?.(value)}
            />
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
              className={classNamespace === 'workspace' ? 'workspace-results-summary__nav' : undefined}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
