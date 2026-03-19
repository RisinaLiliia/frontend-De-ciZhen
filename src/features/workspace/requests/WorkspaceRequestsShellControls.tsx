'use client';

import * as React from 'react';

import { RequestsFilterControls } from '@/components/requests/RequestsFilters';
import { useRequestsExplorerFilters } from '@/components/requests/useRequestsExplorerFilters';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type WorkspaceRequestsShellControlsProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  contentType?: 'requests' | 'providers';
};

export function WorkspaceRequestsShellControls({
  t,
  locale,
  contentType = 'requests',
}: WorkspaceRequestsShellControlsProps) {
  const filters = useRequestsExplorerFilters({ t, locale });
  const appliedChips = React.useMemo(
    () => (
      contentType === 'providers'
        ? filters.appliedFilterChips.filter((chip) => chip.key !== 'sort')
        : filters.appliedFilterChips
    ),
    [contentType, filters.appliedFilterChips],
  );

  return (
    <RequestsFilterControls
      t={t}
      locale={locale}
      categoryOptions={filters.categoryOptions}
      serviceOptions={filters.serviceOptions}
      cityOptions={filters.cityOptions}
      sortOptions={filters.sortOptions}
      categoryKey={filters.categoryKey}
      subcategoryKey={filters.subcategoryKey}
      cityId={filters.cityId}
      sortBy={filters.sortBy}
      isCategoriesLoading={filters.isCategoriesLoading}
      isServicesLoading={filters.isServicesLoading}
      isPending={filters.isPending}
      appliedChips={appliedChips}
      onCategoryChange={filters.onCategoryChange}
      onSubcategoryChange={filters.onSubcategoryChange}
      onCityChange={filters.onCityChange}
      onSortChange={filters.onSortChange}
      onReset={filters.onReset}
      variant="shell"
      showMobileToolbar={false}
    />
  );
}
