'use client';

import type { Locale } from '@/lib/i18n/t';
import type { FilterOption } from './requestsFilters.types';

export function buildFilteredCityOptions(params: {
  cityOptions: FilterOption[];
  cityQuery: string;
  locale: Locale;
}): FilterOption[] {
  const { cityOptions, cityQuery, locale } = params;
  const placeholder = cityOptions.find((option) => option.value === '');
  const base = cityOptions.filter((option) => option.value !== '');
  const query = cityQuery.trim().toLowerCase();
  const filtered = query
    ? base.filter((option) => option.label.toLowerCase().includes(query))
    : base;
  const sorted = filtered.sort((a, b) => a.label.localeCompare(b.label, locale));
  return placeholder ? [placeholder, ...sorted] : sorted;
}

export function resolveFilterOptionLabel(params: {
  options: FilterOption[];
  selectedValue: string;
  fallbackLabel: string;
}): string {
  const { options, selectedValue, fallbackLabel } = params;
  return options.find((option) => option.value === selectedValue)?.label ?? fallbackLabel;
}

export function hasRequestsPagination(params: {
  onPrevPage?: () => void;
  onNextPage?: () => void;
}): boolean {
  return typeof params.onPrevPage === 'function' && typeof params.onNextPage === 'function';
}

export function selectRequestsAppliedChipsForContentType(
  appliedChips: Array<{ key: string; label: string; onRemove: () => void }>,
  contentType: 'requests' | 'providers',
) {
  if (contentType !== 'providers') return appliedChips;
  return appliedChips.filter((chip) => chip.key !== 'sort');
}
