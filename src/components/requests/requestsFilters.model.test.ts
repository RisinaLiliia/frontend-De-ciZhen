import { describe, expect, it, vi } from 'vitest';

import {
  buildFilteredCityOptions,
  hasRequestsPagination,
  resolveFilterOptionLabel,
  selectRequestsAppliedChipsForContentType,
} from './requestsFilters.model';

describe('requestsFilters.model', () => {
  it('keeps placeholder first and sorts remaining city options by locale', () => {
    const options = buildFilteredCityOptions({
      cityOptions: [
        { value: '', label: 'All cities' },
        { value: 'munich', label: 'Munich' },
        { value: 'berlin', label: 'Berlin' },
      ],
      cityQuery: '',
      locale: 'en',
    });

    expect(options.map((option) => option.value)).toEqual(['', 'berlin', 'munich']);
  });

  it('filters city options by case-insensitive query', () => {
    const options = buildFilteredCityOptions({
      cityOptions: [
        { value: '', label: 'All cities' },
        { value: 'berlin', label: 'Berlin' },
        { value: 'bernau', label: 'Bernau' },
        { value: 'hamburg', label: 'Hamburg' },
      ],
      cityQuery: 'BER',
      locale: 'en',
    });

    expect(options.map((option) => option.value)).toEqual(['', 'berlin', 'bernau']);
  });

  it('resolves selected labels with fallback and detects pagination handlers', () => {
    expect(resolveFilterOptionLabel({
      options: [{ value: 'cleaning', label: 'Cleaning' }],
      selectedValue: 'cleaning',
      fallbackLabel: 'Service',
    })).toBe('Cleaning');

    expect(resolveFilterOptionLabel({
      options: [{ value: 'cleaning', label: 'Cleaning' }],
      selectedValue: 'painting',
      fallbackLabel: 'Service',
    })).toBe('Service');

    expect(hasRequestsPagination({
      onPrevPage: vi.fn(),
      onNextPage: vi.fn(),
    })).toBe(true);

    expect(hasRequestsPagination({
      onPrevPage: vi.fn(),
    })).toBe(false);
  });

  it('keeps sort chip only for requests content', () => {
    const chips = [
      { key: 'city', label: 'Berlin', onRemove: vi.fn() },
      { key: 'sort', label: 'Newest', onRemove: vi.fn() },
    ];

    expect(selectRequestsAppliedChipsForContentType(chips, 'requests')).toBe(chips);
    expect(selectRequestsAppliedChipsForContentType(chips, 'providers').map((chip) => chip.key)).toEqual(['city']);
  });
});
