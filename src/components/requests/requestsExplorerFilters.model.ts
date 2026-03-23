import { pickI18n } from '@/lib/i18n/helpers';
import { ALL_OPTION_KEY, SORT_OPTIONS } from '@/features/workspace/requests';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { FilterOption } from '@/components/requests/requestsFilters.types';

type Translator = (key: I18nKey) => string;

type FilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

type WithI18nLabel = {
  i18n: Record<string, string>;
};

type CategoryOptionSource = WithI18nLabel & {
  key: string;
  sortOrder: number;
};

type ServiceOptionSource = WithI18nLabel & {
  key: string;
  sortOrder: number;
};

type CityOptionSource = WithI18nLabel & {
  id: string;
};

export function buildRequestsExplorerSortOptions(t: Translator): FilterOption[] {
  return SORT_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));
}

export function buildRequestsExplorerCategoryOptions(params: {
  categories: CategoryOptionSource[];
  locale: Locale;
  t: Translator;
}): FilterOption[] {
  const { categories, locale, t } = params;
  return [
    { value: ALL_OPTION_KEY, label: t(I18N_KEYS.requestsPage.categoryAll) },
    ...categories
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((category) => ({
        value: category.key,
        label: pickI18n(category.i18n, locale),
      })),
  ];
}

export function buildRequestsExplorerServiceOptions(params: {
  services: ServiceOptionSource[];
  locale: Locale;
  t: Translator;
}): FilterOption[] {
  const { services, locale, t } = params;
  return [
    { value: ALL_OPTION_KEY, label: t(I18N_KEYS.requestsPage.serviceAll) },
    ...services
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((service) => ({
        value: service.key,
        label: pickI18n(service.i18n, locale),
      })),
  ];
}

export function buildRequestsExplorerCityOptions(params: {
  cities: CityOptionSource[];
  locale: Locale;
  t: Translator;
}): FilterOption[] {
  const { cities, locale, t } = params;
  return [
    { value: ALL_OPTION_KEY, label: t(I18N_KEYS.requestsPage.cityAll) },
    ...cities
      .slice()
      .sort((a, b) => pickI18n(a.i18n, locale).localeCompare(pickI18n(b.i18n, locale), locale))
      .map((city) => ({
        value: city.id,
        label: pickI18n(city.i18n, locale),
      })),
  ];
}

function resolveFilterChipLabel(options: FilterOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function buildRequestsExplorerFilterChips(params: {
  cityId: string;
  cityOptions: FilterOption[];
  onCityReset: () => void;
  categoryKey: string;
  categoryOptions: FilterOption[];
  onCategoryReset: () => void;
  subcategoryKey: string;
  serviceOptions: FilterOption[];
  onSubcategoryReset: () => void;
  sortBy: string;
  sortOptions: FilterOption[];
  onSortReset: () => void;
}): FilterChip[] {
  const {
    cityId,
    cityOptions,
    onCityReset,
    categoryKey,
    categoryOptions,
    onCategoryReset,
    subcategoryKey,
    serviceOptions,
    onSubcategoryReset,
    sortBy,
    sortOptions,
    onSortReset,
  } = params;

  const chips: FilterChip[] = [];
  if (cityId !== ALL_OPTION_KEY) {
    chips.push({
      key: 'city',
      label: resolveFilterChipLabel(cityOptions, cityId),
      onRemove: onCityReset,
    });
  }
  if (categoryKey !== ALL_OPTION_KEY) {
    chips.push({
      key: 'category',
      label: resolveFilterChipLabel(categoryOptions, categoryKey),
      onRemove: onCategoryReset,
    });
  }
  if (subcategoryKey !== ALL_OPTION_KEY) {
    chips.push({
      key: 'service',
      label: resolveFilterChipLabel(serviceOptions, subcategoryKey),
      onRemove: onSubcategoryReset,
    });
  }
  if (sortBy !== 'date_desc') {
    chips.push({
      key: 'sort',
      label: resolveFilterChipLabel(sortOptions, sortBy),
      onRemove: onSortReset,
    });
  }
  return chips;
}
