import { describe, expect, it } from 'vitest';

import { buildProviderFavoriteLookup } from '@/lib/api/favorites';
import {
  buildCategoryServiceKeys,
  buildFavoriteProviderIds,
  buildProvidersExploreCollection,
  filterProvidersForExplore,
  formatProvidersTotalLabel,
  paginateProvidersForExplore,
  resolveProvidersTotalPages,
  sortProvidersForExplore,
} from '@/components/requests/providersExplore.model';
import { ALL_OPTION_KEY } from '@/features/workspace/requests';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';

const providers: ProviderPublicDto[] = [
  {
    id: 'provider-1',
    userId: 'user-1',
    ratingAvg: 4.7,
    ratingCount: 12,
    completedJobs: 20,
    basePrice: 120,
    cityId: 'berlin-id',
    serviceKey: 'design-logo',
  },
  {
    id: 'provider-2',
    userId: 'user-2',
    ratingAvg: 4.2,
    ratingCount: 8,
    completedJobs: 10,
    basePrice: 80,
    cityName: 'Berlin',
    serviceKeys: ['design-web', 'photo'],
  },
  {
    id: 'provider-3',
    userId: 'user-3',
    ratingAvg: 4.9,
    ratingCount: 20,
    completedJobs: 30,
    basePrice: 300,
    cityId: 'hamburg-id',
    serviceKeys: ['legal'],
  },
];

describe('providersExplore.model', () => {
  it('builds favorite provider ids using provider id or user id matches', () => {
    const favoriteLookup = buildProviderFavoriteLookup([
      { id: 'missing-provider', userId: 'user-2' },
      { id: 'provider-3', userId: 'missing-user' },
    ]);

    expect(buildFavoriteProviderIds(providers, favoriteLookup)).toEqual(new Set(['provider-2', 'provider-3']));
  });

  it('filters providers by city label fallback, category and subcategory', () => {
    const categoryServiceKeys = buildCategoryServiceKeys('design', [
      { key: 'design-logo', categoryKey: 'design' },
      { key: 'design-web', categoryKey: 'design' },
      { key: 'legal', categoryKey: 'legal' },
    ]);

    expect(
      filterProvidersForExplore({
        providers,
        cityId: 'berlin-id',
        cityOptions: [{ value: 'berlin-id', label: 'Berlin' }],
        subcategoryKey: ALL_OPTION_KEY,
        categoryServiceKeys,
      }).map((provider) => provider.id),
    ).toEqual(['provider-1', 'provider-2']);

    expect(
      filterProvidersForExplore({
        providers,
        cityId: ALL_OPTION_KEY,
        cityOptions: [],
        subcategoryKey: 'design-web',
        categoryServiceKeys: null,
      }).map((provider) => provider.id),
    ).toEqual(['provider-2']);
  });

  it('sorts, paginates and resolves total pages safely', () => {
    expect(sortProvidersForExplore(providers, 'price_asc').map((provider) => provider.id)).toEqual([
      'provider-2',
      'provider-1',
      'provider-3',
    ]);
    expect(paginateProvidersForExplore(providers, 2, 2).map((provider) => provider.id)).toEqual(['provider-3']);
    expect(resolveProvidersTotalPages(0, 10)).toBe(1);
    expect(resolveProvidersTotalPages(21, 10)).toBe(3);
  });

  it('builds providers explore collection from raw query results', () => {
    const favoriteProviderLookup = buildProviderFavoriteLookup([{ id: 'provider-1', userId: '' }]);

    const result = buildProvidersExploreCollection({
      providers,
      favoriteProviderLookup,
      categoryKey: 'design',
      subcategoryKey: ALL_OPTION_KEY,
      cityId: ALL_OPTION_KEY,
      services: [
        { key: 'design-logo', categoryKey: 'design' },
        { key: 'design-web', categoryKey: 'design' },
        { key: 'legal', categoryKey: 'legal' },
      ],
      cityOptions: [{ value: 'berlin-id', label: 'Berlin' }],
      sortBy: 'price_desc',
      page: 1,
      limit: 1,
    });

    expect(result.providerById.get('provider-2')?.userId).toBe('user-2');
    expect(result.favoriteProviderIds).toEqual(new Set(['provider-1']));
    expect(result.filteredProvidersCount).toBe(2);
    expect(result.totalProviderPages).toBe(2);
    expect(result.pagedProviders.map((provider) => provider.id)).toEqual(['provider-1']);
  });

  it('formats provider totals for the active locale', () => {
    expect(formatProvidersTotalLabel('de', 12345)).toBe('12.345');
    expect(formatProvidersTotalLabel('en', 12345)).toBe('12,345');
  });
});
