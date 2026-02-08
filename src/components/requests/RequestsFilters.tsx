// src/components/requests/RequestsFilters.tsx
'use client';

import { Select } from '@/components/ui/Select';
import { IconFilter } from '@/components/ui/icons/icons';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

export type FilterOption = { value: string; label: string };

type RequestsFiltersProps = {
  t: (key: I18nKey) => string;
  categoryOptions: FilterOption[];
  serviceOptions: FilterOption[];
  cityOptions: FilterOption[];
  sortOptions: FilterOption[];
  categoryKey: string;
  subcategoryKey: string;
  cityId: string;
  sortBy: string;
  totalResults: string;
  isCategoriesLoading: boolean;
  isServicesLoading: boolean;
  isCitiesLoading: boolean;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
};

export function RequestsFilters({
  t,
  categoryOptions,
  serviceOptions,
  cityOptions,
  sortOptions,
  categoryKey,
  subcategoryKey,
  cityId,
  sortBy,
  totalResults,
  isCategoriesLoading,
  isServicesLoading,
  isCitiesLoading,
  onCategoryChange,
  onSubcategoryChange,
  onCityChange,
  onSortChange,
  onReset,
}: RequestsFiltersProps) {
  return (
    <div className="requests-filters">
      <div className="requests-filter-row">
        <div className="requests-filter">
          <Select
            options={cityOptions}
            value={cityId}
            onChange={onCityChange}
            className="requests-select is-city"
            aria-label={t(I18N_KEYS.requestsPage.cityLabel)}
            disabled={isCitiesLoading}
          />
        </div>
        <button type="button" className="btn-ghost is-primary requests-clear" onClick={onReset}>
          <IconFilter />
          {t(I18N_KEYS.requestsPage.clearFilters)}
        </button>
      </div>
      <div className="requests-filter-grid">
        <div className="requests-filter">
          <Select
            options={categoryOptions}
            value={categoryKey}
            onChange={onCategoryChange}
            className="requests-select"
            aria-label={t(I18N_KEYS.requestsPage.categoryLabel)}
            disabled={isCategoriesLoading}
          />
        </div>
        <div className="requests-filter">
          <Select
            options={serviceOptions}
            value={subcategoryKey}
            onChange={onSubcategoryChange}
            className="requests-select"
            aria-label={t(I18N_KEYS.requestsPage.serviceLabel)}
            disabled={isServicesLoading || categoryKey === 'all'}
          />
        </div>
        <div className="requests-filter">
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={onSortChange}
            className="requests-select"
            aria-label={t(I18N_KEYS.requestsPage.sortLabel)}
          />
        </div>
      </div>
      <div className="requests-results">
        <span className="typo-small">{t(I18N_KEYS.requestsPage.countLabel)}</span>
        <strong>{totalResults}</strong>
      </div>
    </div>
  );
}
