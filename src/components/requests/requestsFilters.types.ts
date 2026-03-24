'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { RequestsListDensity } from '@/lib/requests/pagination';

export type FilterOption = { value: string; label: string };

export type RequestsFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

export type RequestsFiltersProps = {
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
  resultsLabel?: string;
  page?: number;
  totalPages?: number;
  isCategoriesLoading: boolean;
  isServicesLoading: boolean;
  isPending?: boolean;
  listDensity?: RequestsListDensity;
  appliedChips?: RequestsFilterChip[];
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onListDensityChange?: (value: RequestsListDensity) => void;
};

export type RequestsFilterControlsProps = Pick<
  RequestsFiltersProps,
  | 't'
  | 'locale'
  | 'categoryOptions'
  | 'serviceOptions'
  | 'cityOptions'
  | 'sortOptions'
  | 'categoryKey'
  | 'subcategoryKey'
  | 'cityId'
  | 'sortBy'
  | 'page'
  | 'totalPages'
  | 'isCategoriesLoading'
  | 'isServicesLoading'
  | 'isPending'
  | 'appliedChips'
  | 'onCategoryChange'
  | 'onSubcategoryChange'
  | 'onCityChange'
  | 'onSortChange'
  | 'onReset'
  | 'onPrevPage'
  | 'onNextPage'
> & {
  variant?: 'panel' | 'shell';
  surface?: 'card' | 'embedded';
  showMobileToolbar?: boolean;
  mobileMode?: 'inline' | 'sheet';
};

export type RequestsResultsSummaryProps = Pick<
  RequestsFiltersProps,
  | 't'
  | 'totalResults'
  | 'resultsLabel'
  | 'page'
  | 'totalPages'
  | 'isPending'
  | 'listDensity'
  | 'onPrevPage'
  | 'onNextPage'
  | 'onListDensityChange'
>;
