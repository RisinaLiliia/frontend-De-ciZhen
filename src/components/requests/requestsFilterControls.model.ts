'use client';

import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import {
  buildFilteredCityOptions,
  hasRequestsPagination,
  resolveFilterOptionLabel,
} from '@/components/requests/requestsFilters.model';
import type { FilterOption, RequestsFilterChip } from '@/components/requests/requestsFilters.types';

type Translator = (key: I18nKey) => string;

type BuildRequestsFilterControlsViewModelArgs = {
  t: Translator;
  locale: Locale;
  cityOptions: FilterOption[];
  categoryOptions: FilterOption[];
  serviceOptions: FilterOption[];
  cityId: string;
  categoryKey: string;
  subcategoryKey: string;
  cityQuery: string;
  isPending: boolean;
  isCategoriesLoading: boolean;
  isServicesLoading: boolean;
  appliedChips: RequestsFilterChip[];
  onPrevPage?: () => void;
  onNextPage?: () => void;
};

export function buildRequestsFilterControlsViewModel({
  t,
  locale,
  cityOptions,
  categoryOptions,
  serviceOptions,
  cityId,
  categoryKey,
  subcategoryKey,
  cityQuery,
  isPending,
  isCategoriesLoading,
  isServicesLoading,
  appliedChips,
  onPrevPage,
  onNextPage,
}: BuildRequestsFilterControlsViewModelArgs) {
  const filteredCityOptions = buildFilteredCityOptions({
    cityOptions,
    cityQuery,
    locale,
  });
  const controlsDisabled = isPending || isCategoriesLoading || isServicesLoading;
  const hasActiveFilters = appliedChips.length > 0;
  const hasPagination = hasRequestsPagination({ onPrevPage, onNextPage });
  const cityLabel = resolveFilterOptionLabel({
    options: cityOptions,
    selectedValue: cityId,
    fallbackLabel: t(I18N_KEYS.requestsPage.cityLabel),
  });
  const categoryLabel = resolveFilterOptionLabel({
    options: categoryOptions,
    selectedValue: categoryKey,
    fallbackLabel: t(I18N_KEYS.requestsPage.categoryLabel),
  });
  const serviceLabel = resolveFilterOptionLabel({
    options: serviceOptions,
    selectedValue: subcategoryKey,
    fallbackLabel: t(I18N_KEYS.requestsPage.serviceLabel),
  });

  return {
    filteredCityOptions,
    controlsDisabled,
    hasActiveFilters,
    hasPagination,
    cityLabel,
    categoryLabel,
    serviceLabel,
    mobileSummaryLabel: subcategoryKey !== 'all' ? serviceLabel : categoryLabel,
  };
}
