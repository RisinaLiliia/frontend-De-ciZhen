'use client';

import * as React from 'react';

import { useCities, useServiceCategories, useServices } from '@/features/catalog/queries';
import { useRequestsFilters } from '@/hooks/useRequestsFilters';
import { pickI18n } from '@/lib/i18n/helpers';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { ALL_OPTION_KEY, SORT_OPTIONS } from '@/features/workspace/requests';
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
    isPending,
  } = useRequestsFilters({
    services,
    defaultSort: 'date_desc',
  });

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
        onRemove: () => onCityChange(ALL_OPTION_KEY),
      });
    }
    if (categoryKey !== ALL_OPTION_KEY) {
      const categoryLabel = categoryOptions.find((option) => option.value === categoryKey)?.label ?? categoryKey;
      chips.push({
        key: 'category',
        label: categoryLabel,
        onRemove: () => onCategoryChange(ALL_OPTION_KEY),
      });
    }
    if (subcategoryKey !== ALL_OPTION_KEY) {
      const serviceLabel = serviceOptions.find((option) => option.value === subcategoryKey)?.label ?? subcategoryKey;
      chips.push({
        key: 'service',
        label: serviceLabel,
        onRemove: () => onSubcategoryChange(ALL_OPTION_KEY),
      });
    }
    if (sortBy !== 'date_desc') {
      const sortLabel = sortOptions.find((option) => option.value === sortBy)?.label ?? sortBy;
      chips.push({
        key: 'sort',
        label: sortLabel,
        onRemove: () => onSortChange('date_desc'),
      });
    }
    return chips;
  }, [
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

  const formatDate = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
        day: '2-digit',
        month: 'short',
      }),
    [locale],
  );

  const formatPrice = React.useMemo(
    () =>
      new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    [locale],
  );

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
