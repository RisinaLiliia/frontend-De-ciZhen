import { describe, expect, it } from 'vitest';

import type { City } from '@/features/catalog/model';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import {
  buildHomeCityLabelById,
  buildHomeFavoriteProviderIds,
  buildHomeTopProviderCards,
  buildHomeTopProvidersById,
  buildHomeTopProvidersNextPath,
  rankHomeTopProviders,
} from '@/components/home/homeTopProvidersPanel.model';

function provider(overrides: Partial<ProviderPublicDto> = {}): ProviderPublicDto {
  return {
    id: 'provider-1',
    displayName: 'Provider One',
    ratingAvg: 4.6,
    ratingCount: 12,
    completedJobs: 20,
    ...overrides,
  };
}

function city(overrides: Partial<City> = {}): City {
  return {
    id: 'berlin',
    key: 'berlin',
    i18n: { en: 'Berlin', de: 'Berlin' },
    countryCode: 'DE',
    isActive: true,
    sortOrder: 1,
    ...overrides,
  };
}

describe('homeTopProvidersPanel.model', () => {
  it('ranks providers by rating and respects the requested limit', () => {
    const ranked = rankHomeTopProviders([
      provider({ id: 'provider-1', ratingAvg: 4.2 }),
      provider({ id: 'provider-2', ratingAvg: 4.9 }),
      provider({ id: 'provider-3', ratingAvg: 4.7 }),
    ], 2);

    expect(ranked.map((item) => item.id)).toEqual(['provider-2', 'provider-3']);
    expect(buildHomeTopProvidersById(ranked).get('provider-2')?.id).toBe('provider-2');
  });

  it('builds favorite ids, next path and localized city lookup', () => {
    const providers = [
      provider({ id: 'provider-1' }),
      provider({ id: 'provider-2' }),
    ];

    expect(
      buildHomeFavoriteProviderIds({
        providers,
        favoriteProviderLookup: new Set(['provider-2']),
      }),
    ).toEqual(new Set(['provider-2']));

    expect(buildHomeTopProvidersNextPath('/workspace', 'section=providers')).toBe('/workspace?section=providers');
    expect(buildHomeTopProvidersNextPath('/workspace', '')).toBe('/workspace');
    expect(buildHomeCityLabelById({ cities: [city()], locale: 'de' }).get('berlin')).toBe('Berlin');
  });

  it('builds top-provider cards with forced top badge and default review preview', () => {
    const cards = buildHomeTopProviderCards({
      t: (key) => String(key),
      providers: [provider({ id: 'provider-2', cityId: 'berlin', ratingAvg: 4.9, ratingCount: 40 }) as ProviderPublicDto & { cityId: string }],
      cityLabelById: new Map([['berlin', 'Berlin']]),
    });

    expect(cards).toHaveLength(1);
    expect(cards[0]?.badges[0]?.type).toBe('top');
    expect(cards[0]?.reviewPreview).toBe('homePublic.providerReviewPreviewDefault');
    expect(cards[0]?.cityLabel).toBe('Berlin');
    expect(cards[0]?.profileHref).toBe('/providers/provider-2');
  });
});
