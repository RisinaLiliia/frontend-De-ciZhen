'use client';

import * as React from 'react';

import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { useRequestsFilters } from '@/hooks/useRequestsFilters';
import { trackUXEvent } from '@/lib/analytics';
import { trackSearchEvent as postSearchEvent } from '@/lib/api/analytics';
import { isAnalyticsConsentGranted } from '@/lib/consent/runtime';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { pickI18n } from '@/lib/i18n/helpers';
import type { Locale } from '@/lib/i18n/t';
import { ALL_OPTION_KEY, SORT_OPTIONS } from '@/features/workspace/requests';
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
    () =>
      SORT_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      })),
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

    const resolvedCityId = (next.cityId ?? cityId) === ALL_OPTION_KEY ? undefined : (next.cityId ?? cityId);
    const resolvedCategoryKey =
      (next.categoryKey ?? categoryKey) === ALL_OPTION_KEY ? undefined : (next.categoryKey ?? categoryKey);
    const resolvedSubcategoryKey =
      (next.subcategoryKey ?? subcategoryKey) === ALL_OPTION_KEY
        ? undefined
        : (next.subcategoryKey ?? subcategoryKey);

    if (!resolvedCityId && !resolvedCategoryKey && !resolvedSubcategoryKey) {
      return;
    }

    const cityName = resolvedCityId
      ? pickI18n(cities.find((city) => city.id === resolvedCityId)?.i18n ?? {}, locale) || undefined
      : undefined;

    void postSearchEvent({
      target: activePublicSection === 'providers' ? 'provider' : 'request',
      source: activePublicSection === 'providers' ? 'workspace_providers' : 'workspace_requests',
      cityId: resolvedCityId,
      cityName,
      categoryKey: resolvedCategoryKey,
      subcategoryKey: resolvedSubcategoryKey,
    }).catch(() => undefined);
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
    () => [
      { value: ALL_OPTION_KEY, label: t(I18N_KEYS.requestsPage.categoryAll) },
      ...categories
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((category) => ({
          value: category.key,
          label: pickI18n(category.i18n, locale),
        })),
    ],
    [categories, locale, t],
  );

  const serviceOptions = React.useMemo(
    () => [
      { value: ALL_OPTION_KEY, label: t(I18N_KEYS.requestsPage.serviceAll) },
      ...filteredServices
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((service) => ({
          value: service.key,
          label: pickI18n(service.i18n, locale),
        })),
    ],
    [filteredServices, locale, t],
  );

  const cityOptions = React.useMemo(
    () => [
      { value: ALL_OPTION_KEY, label: t(I18N_KEYS.requestsPage.cityAll) },
      ...cities
        .slice()
        .sort((a, b) => pickI18n(a.i18n, locale).localeCompare(pickI18n(b.i18n, locale), locale))
        .map((city) => ({
          value: city.id,
          label: pickI18n(city.i18n, locale),
        })),
    ],
    [cities, locale, t],
  );

  const appliedFilterChips = React.useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
    if (cityId !== ALL_OPTION_KEY) {
      const cityLabel = cityOptions.find((option) => option.value === cityId)?.label ?? cityId;
      chips.push({
        key: 'city',
        label: cityLabel,
        onRemove: () => onCityChangeTracked(ALL_OPTION_KEY),
      });
    }
    if (categoryKey !== ALL_OPTION_KEY) {
      const categoryLabel = categoryOptions.find((option) => option.value === categoryKey)?.label ?? categoryKey;
      chips.push({
        key: 'category',
        label: categoryLabel,
        onRemove: () => onCategoryChangeTracked(ALL_OPTION_KEY),
      });
    }
    if (subcategoryKey !== ALL_OPTION_KEY) {
      const serviceLabel = serviceOptions.find((option) => option.value === subcategoryKey)?.label ?? subcategoryKey;
      chips.push({
        key: 'service',
        label: serviceLabel,
        onRemove: () => onSubcategoryChangeTracked(ALL_OPTION_KEY),
      });
    }
    if (sortBy !== 'date_desc') {
      const sortLabel = sortOptions.find((option) => option.value === sortBy)?.label ?? sortBy;
      chips.push({
        key: 'sort',
        label: sortLabel,
        onRemove: () => onSortChangeTracked('date_desc'),
      });
    }
    return chips;
  }, [
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

  const hasActivePublicFilter = appliedFilterChips.length > 0;

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
