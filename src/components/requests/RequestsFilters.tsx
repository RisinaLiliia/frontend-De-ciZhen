// src/components/requests/RequestsFilters.tsx
'use client';

import * as React from 'react';
import { Select } from '@/components/ui/Select';
import { CountBadge } from '@/components/ui/CountBadge';
// import { Input } from '@/components/ui/Input';
import { IconFilter, IconPin } from '@/components/ui/icons/icons';
import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { RequestsMobileFilterToolbar } from '@/components/requests/RequestsMobileFilterToolbar';
import * as keys from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

export type FilterOption = { value: string; label: string };

type RequestsFiltersProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  categoryOptions: FilterOption[];
  serviceOptions: FilterOption[];
  cityOptions: FilterOption[];
  sortOptions: FilterOption[];
  categoryKey: string;
  subcategoryKey: string;
  cityId: string;
  sortBy: string;
  totalResults: string;
  resultsLabel?: string;
  page?: number;
  totalPages?: number;
  isCategoriesLoading: boolean;
  isServicesLoading: boolean;
  isPending?: boolean;
  listDensity?: 'single' | 'double';
  appliedChips?: Array<{ key: string; label: string; onRemove: () => void }>;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onListDensityChange?: (value: 'single' | 'double') => void;
};

export function RequestsFilters({
  t,
  locale,
  categoryOptions,
  serviceOptions,
  cityOptions,
  sortOptions,
  categoryKey,
  subcategoryKey,
  cityId,
  sortBy,
  totalResults,
  resultsLabel,
  page = 1,
  totalPages = 1,
  isCategoriesLoading,
  isServicesLoading,
  isPending = false,
  listDensity = 'single',
  appliedChips = [],
  onCategoryChange,
  onSubcategoryChange,
  onCityChange,
  onSortChange,
  onReset,
  onPrevPage,
  onNextPage,
  onListDensityChange,
}: RequestsFiltersProps) {
  const [cityQuery] = React.useState('');
  const [isMobileControlsOpen, setIsMobileControlsOpen] = React.useState(false);
  const sortControlRef = React.useRef<HTMLDivElement | null>(null);
  const controlsDisabled = isPending || isCategoriesLoading || isServicesLoading;
  const hasActiveFilters = appliedChips.length > 0;
  const hasPagination = typeof onPrevPage === 'function' && typeof onNextPage === 'function';
  const hasDensityToggle = typeof onListDensityChange === 'function';

  const filteredCityOptions = React.useMemo(() => {
    const placeholder = cityOptions.find((option) => option.value === '');
    const base = cityOptions.filter((option) => option.value !== '');
    const query = cityQuery.trim().toLowerCase();
    const filtered = query
      ? base.filter((option) => option.label.toLowerCase().includes(query))
      : base;
    const sorted = filtered.sort((a, b) => a.label.localeCompare(b.label, locale));
    return placeholder ? [placeholder, ...sorted] : sorted;
  }, [cityOptions, cityQuery, locale]);

  const openSortControl = React.useCallback(() => {
    setIsMobileControlsOpen(true);
    requestAnimationFrame(() => {
      sortControlRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }, []);

  return (
    <div
      className={`requests-filters requests-filters--sticky${isPending ? ' is-pending' : ''}`}
      role="region"
      aria-label={t(keys.I18N_KEYS.requestsPage.filterRegionLabel)}
      aria-busy={isPending}
    >
      <RequestsMobileFilterToolbar
        t={t}
        isOpen={isMobileControlsOpen}
        disabled={controlsDisabled}
        page={page}
        totalPages={totalPages}
        hasPagination={hasPagination}
        onToggleFilters={() => setIsMobileControlsOpen((prev) => !prev)}
        onOpenSort={openSortControl}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
      />

      <div id="requests-filter-controls" className={`requests-filters__controls ${isMobileControlsOpen ? 'is-open' : ''}`.trim()}>
        <div className="requests-filter-row">
          <div className="requests-filter">
            {/* <Input
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder={t(I18N_KEYS.home.cityPlaceholder)}
            /> */}
            <div className="requests-select-wrap">
              <span className="requests-select-icon requests-select-icon--city" aria-hidden="true">
                <IconPin />
              </span>
              <Select
                options={filteredCityOptions}
                value={cityId}
                onChange={onCityChange}
                className="requests-select is-city"
                aria-label={t(keys.I18N_KEYS.requestsPage.cityLabel)}
                disabled={controlsDisabled}
              />
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost is-primary requests-clear"
            onClick={onReset}
            disabled={controlsDisabled || !hasActiveFilters}
          >
            <IconFilter />
            {t(keys.I18N_KEYS.requestsPage.clearFilters)}
          </button>
        </div>
        <div className="requests-filter-grid">
          <div className="requests-filter">
            <Select
              options={categoryOptions}
              value={categoryKey}
              onChange={onCategoryChange}
              className="requests-select"
              aria-label={t(keys.I18N_KEYS.requestsPage.categoryLabel)}
              disabled={controlsDisabled}
            />
          </div>
          <div className="requests-filter">
            <Select
              options={serviceOptions}
              value={subcategoryKey}
              onChange={onSubcategoryChange}
              className="requests-select"
              aria-label={t(keys.I18N_KEYS.requestsPage.serviceLabel)}
              disabled={controlsDisabled || categoryKey === 'all'}
            />
          </div>
          <div className="requests-filter" ref={sortControlRef}>
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={onSortChange}
              className="requests-select"
              aria-label={t(keys.I18N_KEYS.requestsPage.sortLabel)}
              disabled={controlsDisabled}
            />
          </div>
        </div>
        {appliedChips.length > 0 ? (
          <div className="chip-row" role="list" aria-label={t(keys.I18N_KEYS.requestsPage.activeFiltersLabel)}>
            {appliedChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className="chip is-active"
                role="listitem"
                onClick={chip.onRemove}
                aria-label={`${chip.label} ${t(keys.I18N_KEYS.requestsPage.removeFilterSuffix)}`}
              >
                {chip.label} ×
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="requests-filter-summary">
        <div className="requests-results" aria-live="polite">
          <span className="typo-small">{resultsLabel ?? t(keys.I18N_KEYS.requestsPage.countLabel)}</span>
          <CountBadge as="strong" value={totalResults} />
          {isPending ? <span className="sr-only">{t(keys.I18N_KEYS.requestsPage.updatingLabel)}</span> : null}
        </div>
        {(hasDensityToggle || hasPagination) ? (
          <div className="requests-filter-summary__controls">
            {hasDensityToggle ? (
              <div className="requests-view-toggle" role="group" aria-label={t(keys.I18N_KEYS.requestsPage.viewModeLabel)}>
                <button
                  type="button"
                  className={`requests-view-toggle__btn ${listDensity === 'single' ? 'is-active' : ''}`.trim()}
                  aria-label={t(keys.I18N_KEYS.requestsPage.viewModeSingle)}
                  aria-pressed={listDensity === 'single'}
                  onClick={() => onListDensityChange?.('single')}
                >
                  <span className="requests-layout-icon requests-layout-icon--single" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`requests-view-toggle__btn ${listDensity === 'double' ? 'is-active' : ''}`.trim()}
                  aria-label={t(keys.I18N_KEYS.requestsPage.viewModeDouble)}
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
                ariaLabel={t(keys.I18N_KEYS.requestsPage.paginationLabel)}
                prevAriaLabel={t(keys.I18N_KEYS.requestsPage.paginationPrev)}
                nextAriaLabel={t(keys.I18N_KEYS.requestsPage.paginationNext)}
              />
            ) : null}
          </div>
        ) : null}
      </div>
      {isCategoriesLoading || isServicesLoading ? (
        <div className="requests-filters__skeleton" aria-hidden="true">
          <div className="skeleton is-wide h-10 w-full rounded-md" />
          <div className="skeleton is-wide h-10 w-full rounded-md" />
          <div className="skeleton is-wide h-10 w-full rounded-md" />
        </div>
      ) : null}
    </div>
  );
}
