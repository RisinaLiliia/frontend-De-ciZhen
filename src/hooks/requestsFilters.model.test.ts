import { describe, expect, it } from 'vitest';

import {
  buildPublicRequestsFilterPayload,
  buildRequestsFiltersHref,
  buildRequestsServiceByKeyMap,
  readPositiveInt,
  resolveRequestsFilterQueryParams,
  resolveRequestsFilterSelection,
} from '@/hooks/requestsFilters.model';

describe('requestsFilters.model', () => {
  it('parses positive ints safely with fallback and max bounds', () => {
    expect(readPositiveInt('12', 1)).toBe(12);
    expect(readPositiveInt('-4', 1)).toBe(1);
    expect(readPositiveInt('101', 1, 100)).toBe(100);
    expect(readPositiveInt('2.8', 1)).toBe(2);
  });

  it('resolves query params with legacy serviceKey support', () => {
    const params = resolveRequestsFilterQueryParams(
      new URLSearchParams('serviceKey=logo&cityId=berlin&sort=price_desc&page=3&limit=40'),
      'date_desc',
    );

    expect(params).toEqual({
      categoryParam: 'all',
      subcategoryParam: 'logo',
      cityId: 'berlin',
      sortBy: 'price_desc',
      page: 3,
      limit: 20,
    });
  });

  it('normalizes limit to supported page sizes', () => {
    expect(
      resolveRequestsFilterQueryParams(
        new URLSearchParams('limit=10'),
        'date_desc',
      ).limit,
    ).toBe(10);

    expect(
      resolveRequestsFilterQueryParams(
        new URLSearchParams('limit=17'),
        'date_desc',
      ).limit,
    ).toBe(20);
  });

  it('resolves category and subcategory selection from services', () => {
    const services = [
      { key: 'logo', categoryKey: 'design' },
      { key: 'landing', categoryKey: 'design' },
      { key: 'tax', categoryKey: 'finance' },
    ];

    expect(buildRequestsServiceByKeyMap(services).get('tax')?.categoryKey).toBe('finance');

    expect(
      resolveRequestsFilterSelection({
        services,
        categoryParam: 'all',
        subcategoryParam: 'logo',
      }),
    ).toEqual({
      categoryKey: 'design',
      subcategoryKey: 'logo',
      filteredServices: [
        { key: 'logo', categoryKey: 'design' },
        { key: 'landing', categoryKey: 'design' },
      ],
    });

    expect(
      resolveRequestsFilterSelection({
        services,
        categoryParam: 'finance',
        subcategoryParam: 'logo',
      }),
    ).toEqual({
      categoryKey: 'finance',
      subcategoryKey: 'all',
      filteredServices: [{ key: 'tax', categoryKey: 'finance' }],
    });
  });

  it('builds public request payload and preserves unrelated query params in href updates', () => {
    expect(
      buildPublicRequestsFilterPayload({
        cityId: 'all',
        categoryKey: 'design',
        subcategoryKey: 'all',
        sortBy: 'date_desc',
        page: 1,
        limit: 20,
      }),
    ).toEqual({
      cityId: undefined,
      categoryKey: 'design',
      subcategoryKey: undefined,
      sort: 'date_desc',
      page: 1,
      limit: 20,
    });

    expect(
      buildRequestsFiltersHref({
        pathname: '/workspace',
        searchParams: new URLSearchParams('tab=requests&serviceKey=legacy&cityId=munich&page=7'),
        current: {
          cityId: 'munich',
          categoryKey: 'all',
          subcategoryKey: 'all',
          sortBy: 'date_desc',
          page: 7,
          limit: 20,
        },
        next: {
          cityId: 'berlin',
          categoryKey: 'design',
          subcategoryKey: 'logo',
          page: 1,
          limit: 10,
        },
        defaultSort: 'date_desc',
      }),
    ).toBe('/workspace?tab=requests&cityId=berlin&categoryKey=design&subcategoryKey=logo&limit=10');
  });
});
