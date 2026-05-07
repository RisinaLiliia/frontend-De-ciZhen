import { describe, expect, it, vi } from 'vitest';

import {
  buildRequestsPublicContentProps,
  buildRequestsPublicFiltersProps,
} from './requestsPublicContent.model';

describe('requestsPublicContent.model', () => {
  it('builds public filters props without reshaping the shared contract', () => {
    const props = buildRequestsPublicFiltersProps({
      t: vi.fn(),
      locale: 'de',
      categoryOptions: [],
      serviceOptions: [],
      cityOptions: [],
      sortOptions: [],
      categoryKey: '',
      subcategoryKey: '',
      cityId: '',
      sortBy: 'date_desc',
      totalResults: '12',
      isCategoriesLoading: false,
      isServicesLoading: false,
      isPending: false,
      appliedChips: [],
      onCategoryChange: vi.fn(),
      onSubcategoryChange: vi.fn(),
      onCityChange: vi.fn(),
      onSortChange: vi.fn(),
      onReset: vi.fn(),
    });

    expect(props.totalResults).toBe('12');
    expect(props.sortBy).toBe('date_desc');
  });

  it('fills the default results label for public content props', () => {
    const t = vi.fn((key: string) => key);

    const props = buildRequestsPublicContentProps({
      t,
      filtersProps: {
        t,
        locale: 'de',
        categoryOptions: [],
        serviceOptions: [],
        cityOptions: [],
        sortOptions: [],
        categoryKey: '',
        subcategoryKey: '',
        cityId: '',
        sortBy: 'date_desc',
        totalResults: '12',
        isCategoriesLoading: false,
        isServicesLoading: false,
        isPending: false,
        appliedChips: [],
        onCategoryChange: vi.fn(),
        onSubcategoryChange: vi.fn(),
        onCityChange: vi.fn(),
        onSortChange: vi.fn(),
        onReset: vi.fn(),
      },
      statusFilters: [],
      activeStatusFilter: 'all',
      onStatusFilterChange: vi.fn(),
      isLoading: false,
      isError: false,
      requestsCount: 0,
      hasActivePublicFilter: false,
      emptyCtaHref: '/workspace?section=requests',
      requestsListProps: {
        t,
        locale: 'de',
        requests: [],
        isLoading: false,
        isError: false,
        serviceByKey: new Map(),
        categoryByKey: new Map(),
        cityById: new Map(),
        formatDate: new Intl.DateTimeFormat('de-DE'),
        formatPrice: new Intl.NumberFormat('de-DE'),
      },
      page: 1,
      totalPages: 1,
      onPrevPage: vi.fn(),
      onNextPage: vi.fn(),
    });

    expect(props.resultsLabel).toBe('requestsPage.resultsLabel');
  });
});
