import { describe, expect, it, vi } from 'vitest';

import { buildRequestsFilterControlsViewModel } from '@/components/requests/requestsFilterControls.model';

describe('requestsFilterControls.model', () => {
  it('builds derived control state and prefers service label in mobile summary', () => {
    const viewModel = buildRequestsFilterControlsViewModel({
      t: (key) => key,
      locale: 'en',
      cityOptions: [
        { value: '', label: 'All cities' },
        { value: 'berlin', label: 'Berlin' },
      ],
      categoryOptions: [{ value: 'design', label: 'Design' }],
      serviceOptions: [{ value: 'logo', label: 'Logo' }],
      cityId: 'berlin',
      categoryKey: 'design',
      subcategoryKey: 'logo',
      cityQuery: '',
      isPending: false,
      isCategoriesLoading: false,
      isServicesLoading: false,
      appliedChips: [{ key: 'city', label: 'Berlin', onRemove: vi.fn() }],
      onPrevPage: vi.fn(),
      onNextPage: vi.fn(),
    });

    expect(viewModel.filteredCityOptions.map((option) => option.value)).toEqual(['', 'berlin']);
    expect(viewModel.controlsDisabled).toBe(false);
    expect(viewModel.hasActiveFilters).toBe(true);
    expect(viewModel.hasPagination).toBe(true);
    expect(viewModel.cityLabel).toBe('Berlin');
    expect(viewModel.mobileSummaryLabel).toBe('Logo');
  });

  it('falls back to category label and disables controls while loading', () => {
    const viewModel = buildRequestsFilterControlsViewModel({
      t: (key) => key,
      locale: 'en',
      cityOptions: [{ value: '', label: 'All cities' }],
      categoryOptions: [{ value: 'design', label: 'Design' }],
      serviceOptions: [{ value: 'logo', label: 'Logo' }],
      cityId: '',
      categoryKey: 'design',
      subcategoryKey: 'all',
      cityQuery: '',
      isPending: true,
      isCategoriesLoading: false,
      isServicesLoading: false,
      appliedChips: [],
      onPrevPage: undefined,
      onNextPage: undefined,
    });

    expect(viewModel.controlsDisabled).toBe(true);
    expect(viewModel.hasActiveFilters).toBe(false);
    expect(viewModel.hasPagination).toBe(false);
    expect(viewModel.mobileSummaryLabel).toBe('Design');
  });
});
