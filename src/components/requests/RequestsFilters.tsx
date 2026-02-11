// src/components/requests/RequestsFilters.tsx
'use client';

import * as React from 'react';
import { Select } from '@/components/ui/Select';
// import { Input } from '@/components/ui/Input';
import { IconFilter } from '@/components/ui/icons/icons';
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
  isCategoriesLoading: boolean;
  isServicesLoading: boolean;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
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
  isCategoriesLoading,
  isServicesLoading,
  onCategoryChange,
  onSubcategoryChange,
  onCityChange,
  onSortChange,
  onReset,
}: RequestsFiltersProps) {
  const [cityQuery] = React.useState('');

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

  return (
    <div className="requests-filters">
      <div className="requests-filter-row">
        <div className="requests-filter">
          <label className="typo-small">{t(keys.I18N_KEYS.requestsPage.cityLabel)}</label>
          {/* <Input
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            placeholder={t(I18N_KEYS.home.cityPlaceholder)}
          /> */}
          <Select
            options={filteredCityOptions}
            value={cityId}
            onChange={onCityChange}
            className="requests-select is-city"
            aria-label={t(keys.I18N_KEYS.requestsPage.cityLabel)}
          />
        </div>
        <button type="button" className="btn-ghost is-primary requests-clear" onClick={onReset}>
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
            disabled={isCategoriesLoading}
          />
        </div>
        <div className="requests-filter">
          <Select
            options={serviceOptions}
            value={subcategoryKey}
            onChange={onSubcategoryChange}
            className="requests-select"
            aria-label={t(keys.I18N_KEYS.requestsPage.serviceLabel)}
            disabled={isServicesLoading || categoryKey === 'all'}
          />
        </div>
        <div className="requests-filter">
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={onSortChange}
            className="requests-select"
            aria-label={t(keys.I18N_KEYS.requestsPage.sortLabel)}
          />
        </div>
      </div>
      <div className="requests-results">
        <span className="typo-small">{t(keys.I18N_KEYS.requestsPage.countLabel)}</span>
        <strong>{totalResults}</strong>
      </div>
    </div>
  );
}
