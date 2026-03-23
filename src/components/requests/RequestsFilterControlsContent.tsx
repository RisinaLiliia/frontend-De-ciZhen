'use client';

import * as React from 'react';

import { RequestsFilterSelect } from '@/components/requests/RequestsFilterSelect';
import { IconFilter, IconPin } from '@/components/ui/icons/icons';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { FilterOption, RequestsFilterChip } from './requestsFilters.types';

type RequestsFilterControlsContentProps = {
  t: (key: I18nKey) => string;
  cityId: string;
  categoryKey: string;
  subcategoryKey: string;
  sortBy: string;
  cityOptions: FilterOption[];
  categoryOptions: FilterOption[];
  serviceOptions: FilterOption[];
  sortOptions: FilterOption[];
  controlsDisabled: boolean;
  hasActiveFilters: boolean;
  variant: 'panel' | 'shell';
  appliedChips: RequestsFilterChip[];
  sortControlRef: React.RefObject<HTMLDivElement | null>;
  onCityChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
};

export function RequestsFilterControlsContent({
  t,
  cityId,
  categoryKey,
  subcategoryKey,
  sortBy,
  cityOptions,
  categoryOptions,
  serviceOptions,
  sortOptions,
  controlsDisabled,
  hasActiveFilters,
  variant,
  appliedChips,
  sortControlRef,
  onCityChange,
  onCategoryChange,
  onSubcategoryChange,
  onSortChange,
  onReset,
}: RequestsFilterControlsContentProps) {
  return (
    <>
      <div className="requests-filter-grid requests-filter-grid--primary">
        <div className="requests-filter">
          <RequestsFilterSelect
            options={cityOptions}
            value={cityId}
            onChange={onCityChange}
            className="requests-select is-city"
            ariaLabel={t(I18N_KEYS.requestsPage.cityLabel)}
            disabled={controlsDisabled}
            icon={<IconPin />}
            iconClassName="requests-select-icon--city"
          />
        </div>
        <div className="requests-filter">
          <RequestsFilterSelect
            options={categoryOptions}
            value={categoryKey}
            onChange={onCategoryChange}
            className="requests-select"
            ariaLabel={t(I18N_KEYS.requestsPage.categoryLabel)}
            disabled={controlsDisabled}
          />
        </div>
        <div className="requests-filter">
          <RequestsFilterSelect
            options={serviceOptions}
            value={subcategoryKey}
            onChange={onSubcategoryChange}
            className="requests-select"
            ariaLabel={t(I18N_KEYS.requestsPage.serviceLabel)}
            disabled={controlsDisabled || categoryKey === 'all'}
          />
        </div>
      </div>
      <div className="requests-filter-grid requests-filter-grid--secondary">
        <div className="requests-filter" ref={sortControlRef}>
          <RequestsFilterSelect
            options={sortOptions}
            value={sortBy}
            onChange={onSortChange}
            className="requests-select"
            ariaLabel={t(I18N_KEYS.requestsPage.sortLabel)}
            disabled={controlsDisabled}
          />
        </div>
        <button
          type="button"
          className={`${variant === 'shell' ? 'panel-action icon-button--hint workspace-control-shell__action requests-clear requests-clear--icon' : 'btn-ghost is-primary requests-clear'}`.trim()}
          onClick={onReset}
          disabled={controlsDisabled || !hasActiveFilters}
          aria-label={t(I18N_KEYS.requestsPage.clearFilters)}
          title={t(I18N_KEYS.requestsPage.clearFilters)}
        >
          <IconFilter />
          {variant === 'shell' ? null : t(I18N_KEYS.requestsPage.clearFilters)}
        </button>
      </div>
      {appliedChips.length > 0 ? (
        <div
          className={`chip-row requests-filters__chips requests-filters__chips--${variant}`.trim()}
          role="list"
          aria-label={t(I18N_KEYS.requestsPage.activeFiltersLabel)}
        >
          {appliedChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="chip is-active"
              role="listitem"
              onClick={chip.onRemove}
              aria-label={`${chip.label} ${t(I18N_KEYS.requestsPage.removeFilterSuffix)}`}
            >
              {chip.label} ×
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
