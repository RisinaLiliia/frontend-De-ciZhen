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
    page: queryPage,
    limit,
    filter,
    filteredServices,
    onCategoryChange: onCategoryChangeQuery,
    onSubcategoryChange: onSubcategoryChangeQuery,
    onCityChange: onCityChangeQuery,
    onSortChange: onSortChangeQuery,
    onReset: onResetQuery,
    setLimit: setLimitQuery,
    isPending,
  } = useRequestsFilters({
    services,
    defaultSort: 'date_desc',
  });
  const [page, setPageState] = React.useState(queryPage);
  const pageScopeKey = React.useMemo(
    () => JSON.stringify([cityId, categoryKey, subcategoryKey, sortBy, limit]),
    [categoryKey, cityId, limit, sortBy, subcategoryKey],
  );
  const prevPageScopeKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (prevPageScopeKeyRef.current === pageScopeKey) return;
    prevPageScopeKeyRef.current = pageScopeKey;
    setPageState(queryPage);
  }, [pageScopeKey, queryPage]);

  const setPage = React.useCallback((nextPage: number) => {
    const normalized = Math.max(1, Math.trunc(nextPage));
    setPageState((current) => (current === normalized ? current : normalized));
  }, []);

  const onCategoryChange = React.useCallback((value: string) => {
    setPageState(1);
    onCategoryChangeQuery(value);
  }, [onCategoryChangeQuery]);

  const onSubcategoryChange = React.useCallback((value: string) => {
    setPageState(1);
    onSubcategoryChangeQuery(value);
  }, [onSubcategoryChangeQuery]);

  const onCityChange = React.useCallback((value: string) => {
    setPageState(1);
    onCityChangeQuery(value);
  }, [onCityChangeQuery]);

  const onSortChange = React.useCallback((value: string) => {
    setPageState(1);
    onSortChangeQuery(value);
  }, [onSortChangeQuery]);

  const onReset = React.useCallback(() => {
    setPageState(1);
    onResetQuery();
  }, [onResetQuery]);

  const setLimit = React.useCallback((nextLimit: number) => {
    setPageState(1);
    setLimitQuery(nextLimit);
  }, [setLimitQuery]);
  const { data: cities = [] } = useCities('DE', {
    ids: cityId !== ALL_OPTION_KEY ? [cityId] : [],
    enabled: cityId !== ALL_OPTION_KEY,
    limit: 8,
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
    filter: {
      ...filter,
      page,
    },
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
