'use client';

import * as React from 'react';

import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import {
  buildRequestsExplorerCategoryOptions,
  buildRequestsExplorerCityOptions,
  buildRequestsExplorerFilterChips,
  buildRequestsExplorerServiceOptions,
  buildRequestsExplorerSortOptions,
} from '@/components/requests/requestsExplorerFilters.model';
import {
  hasWorkspacePublicActiveFilters,
  resolveWorkspacePublicSearchEventPayload,
} from '@/features/workspace/public/workspacePublicFilters.model';
import { useRequestsFilters } from '@/hooks/useRequestsFilters';
import { trackUXEvent } from '@/lib/analytics';
import { trackSearchEvent as postSearchEvent } from '@/lib/api/analytics';
import { isAnalyticsConsentGranted } from '@/lib/consent/runtime';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { ALL_OPTION_KEY } from '@/features/workspace/requests';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';

type Translator = (key: I18nKey) => string;

type Args = {
  t: Translator;
  locale: Locale;
  shouldLoadCatalog: boolean;
  activePublicSection: PublicWorkspaceSection | null;
};

export function useWorkspacePublicFilters({ t, locale, shouldLoadCatalog, activePublicSection }: Args) {
  const { data: cities = [] } = useCities('DE', shouldLoadCatalog);
  const { data: categories = [], isLoading: isCategoriesLoading } = useServiceCategories(shouldLoadCatalog);
  const { data: services = [], isLoading: isServicesLoading } = useServices(undefined, shouldLoadCatalog);

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
    isPending: isFiltersPending,
  } = useRequestsFilters({
    services,
    defaultSort: 'date_desc',
  });

  const sendSearchEvent = React.useCallback((next: {
    cityId?: string;
    categoryKey?: string;
    subcategoryKey?: string;
  }) => {
    if (!isAnalyticsConsentGranted()) return;
    const payload = resolveWorkspacePublicSearchEventPayload({
      activePublicSection,
      locale,
      cities,
      current: {
        cityId,
        categoryKey,
        subcategoryKey,
      },
      next,
    });
    if (!payload) return;
    void postSearchEvent(payload).catch(() => undefined);
  }, [activePublicSection, categoryKey, cities, cityId, locale, subcategoryKey]);

  const onCategoryChangeTracked = React.useCallback((value: string) => {
    onCategoryChange(value);
    trackUXEvent('workspace_filter_change', { filter: 'category', value });
    sendSearchEvent({ categoryKey: value, subcategoryKey: ALL_OPTION_KEY });
  }, [onCategoryChange, sendSearchEvent]);

  const onSubcategoryChangeTracked = React.useCallback((value: string) => {
    onSubcategoryChange(value);
    trackUXEvent('workspace_filter_change', { filter: 'service', value });
    sendSearchEvent({ subcategoryKey: value });
  }, [onSubcategoryChange, sendSearchEvent]);

  const onCityChangeTracked = React.useCallback((value: string) => {
    onCityChange(value);
    trackUXEvent('workspace_filter_change', { filter: 'city', value });
    sendSearchEvent({ cityId: value });
  }, [onCityChange, sendSearchEvent]);

  const onSortChangeTracked = React.useCallback((value: string) => {
    onSortChange(value);
    trackUXEvent('workspace_filter_change', { filter: 'sort', value });
  }, [onSortChange]);

  const onResetTracked = React.useCallback(() => {
    onReset();
    trackUXEvent('workspace_filter_reset');
  }, [onReset]);

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
      onCityReset: () => onCityChangeTracked(ALL_OPTION_KEY),
      categoryKey,
      categoryOptions,
      onCategoryReset: () => onCategoryChangeTracked(ALL_OPTION_KEY),
      subcategoryKey,
      serviceOptions,
      onSubcategoryReset: () => onSubcategoryChangeTracked(ALL_OPTION_KEY),
      sortBy,
      sortOptions,
      onSortReset: () => onSortChangeTracked('date_desc'),
    }), [
    categoryKey,
    categoryOptions,
    cityId,
    cityOptions,
    onCategoryChangeTracked,
    onCityChangeTracked,
    onSortChangeTracked,
    onSubcategoryChangeTracked,
    serviceOptions,
    sortBy,
    sortOptions,
    subcategoryKey,
  ]);

  const hasActivePublicFilter = React.useMemo(
    () => hasWorkspacePublicActiveFilters(appliedFilterChips),
    [appliedFilterChips],
  );

  return {
    cities,
    categories,
    services,
    isCategoriesLoading,
    isServicesLoading,
    categoryKey,
    subcategoryKey,
    cityId,
    sortBy,
    page,
    limit,
    filter,
    setPage,
    isFiltersPending,
    sortOptions,
    categoryOptions,
    serviceOptions,
    cityOptions,
    appliedFilterChips,
    hasActivePublicFilter,
    onCategoryChangeTracked,
    onSubcategoryChangeTracked,
    onCityChangeTracked,
    onSortChangeTracked,
    onResetTracked,
  };
}
