'use client';

import * as React from 'react';

import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { useRequestsFilters } from '@/hooks/useRequestsFilters';
import {
  buildRequestsExplorerCategoryOptions,
  buildRequestsExplorerCityOptions,
  buildRequestsExplorerFilterChips,
  buildRequestsExplorerServiceOptions,
  buildRequestsExplorerSortOptions,
} from '@/components/requests/requestsExplorerFilters.model';
import { ALL_OPTION_KEY } from '@/features/workspace/requests';
import { useWorkspaceFormatters } from '@/features/workspace/shared/useWorkspaceFormatters';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type Args = {
  t: (key: I18nKey) => string;
  locale: Locale;
};

export function useRequestsExplorerFilters({ t, locale }: Args) {
  const { data: cities = [] } = useCities('DE');
  const { data: categories = [], isLoading: isCategoriesLoading } = useServiceCategories();
  const { data: services = [], isLoading: isServicesLoading } = useServices();
  const { formatDate, formatPrice } = useWorkspaceFormatters(locale);

  const sortOptions = React.useMemo(
    () => buildRequestsExplorerSortOptions(t),
    [t],
  );

  const {
    categoryKey,
    subcategoryKey,
    cityId,
    sortBy,
    page,
    limit,
    filter,
    filteredServices,
    onCategoryChange,
    onSubcategoryChange,
    onCityChange,
    onSortChange,
    onReset,
    setPage,
    setLimit,
    isPending,
  } = useRequestsFilters({
    services,
    defaultSort: 'date_desc',
  });

  const categoryOptions = React.useMemo(
    () => buildRequestsExplorerCategoryOptions({ categories, locale, t }),
    [categories, locale, t],
  );

  const serviceOptions = React.useMemo(
    () => buildRequestsExplorerServiceOptions({ services: filteredServices, locale, t }),
    [filteredServices, locale, t],
  );

  const cityOptions = React.useMemo(
    () => buildRequestsExplorerCityOptions({ cities, locale, t }),
    [cities, locale, t],
  );

  const appliedFilterChips = React.useMemo(() =>
    buildRequestsExplorerFilterChips({
      cityId,
      cityOptions,
      onCityReset: () => onCityChange(ALL_OPTION_KEY),
      categoryKey,
      categoryOptions,
      onCategoryReset: () => onCategoryChange(ALL_OPTION_KEY),
      subcategoryKey,
      serviceOptions,
      onSubcategoryReset: () => onSubcategoryChange(ALL_OPTION_KEY),
      sortBy,
      sortOptions,
      onSortReset: () => onSortChange('date_desc'),
    }), [
    categoryKey,
    categoryOptions,
    cityId,
    cityOptions,
    onCategoryChange,
    onCityChange,
    onSortChange,
    onSubcategoryChange,
    serviceOptions,
    sortBy,
    sortOptions,
    subcategoryKey,
  ]);

  return {
    cities,
    categories,
    services,
    isCategoriesLoading,
    isServicesLoading,
    sortOptions,
    categoryOptions,
    serviceOptions,
    cityOptions,
    categoryKey,
    subcategoryKey,
    cityId,
    sortBy,
    page,
    limit,
    filter,
    setPage,
    setLimit,
    isPending,
    onCategoryChange,
    onSubcategoryChange,
    onCityChange,
    onSortChange,
    onReset,
    appliedFilterChips,
    formatDate,
    formatPrice,
  };
}
