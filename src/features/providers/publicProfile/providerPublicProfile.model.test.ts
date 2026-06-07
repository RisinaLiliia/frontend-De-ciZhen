import { describe, expect, it } from 'vitest';

import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import {
  buildProviderPublicProfileAvailabilityCalendarConfig,
  buildProviderPublicProfileCard,
  buildProviderPublicProfileSimilarCards,
  buildProviderPublicProfileSimilarProviders,
  buildProviderPublicProfileViewModel,
  getPrimaryProviderServiceKey,
  rankProviderPublicProfileCandidates,
  resolveProviderTargetUserId,
} from '@/features/providers/publicProfile/providerPublicProfile.model';

function provider(overrides: Partial<ProviderPublicDto> = {}): ProviderPublicDto {
  return {
    id: 'provider-1',
    displayName: 'Provider One',
    ratingAvg: 4.8,
    ratingCount: 24,
    completedJobs: 32,
    cityId: 'city-1',
    cityName: 'Berlin',
    serviceKey: 'painting',
    ...overrides,
  };
}

describe('providerPublicProfile.model', () => {
  it('resolves provider target user id and primary service key', () => {
    expect(resolveProviderTargetUserId(provider({ userId: 'user-1' }))).toBe('user-1');
    expect(resolveProviderTargetUserId(provider({ userId: ' ' }))).toBe('provider-1');
    expect(getPrimaryProviderServiceKey(provider({ serviceKeys: ['plumbing', 'painting'] }))).toBe('plumbing');
  });

  it('builds profile card and ranks similar providers with same-city preference', () => {
    const t = (key: string) => key;
    const baseProvider = provider();
    const similarProviders = buildProviderPublicProfileSimilarProviders({
      provider: baseProvider,
      providers: [
        baseProvider,
        provider({ id: 'provider-2', cityId: 'city-1', ratingAvg: 4.9, ratingCount: 18 }),
        provider({ id: 'provider-3', cityId: 'city-1', ratingAvg: 4.7, ratingCount: 100 }),
        provider({ id: 'provider-4', cityId: 'city-2', ratingAvg: 5, ratingCount: 2 }),
      ],
    });

    expect(rankProviderPublicProfileCandidates(
      provider({ id: 'a', ratingAvg: 4.9, ratingCount: 10 }),
      provider({ id: 'b', ratingAvg: 4.8, ratingCount: 100 }),
    )).toBeLessThan(0);
    expect(similarProviders.map((item) => item.id)).toEqual(['provider-2', 'provider-3']);
    expect(buildProviderPublicProfileCard({ provider: baseProvider, t: t as never, locale: 'de' }).profileHref).toBe('/providers/provider-1');
    expect(buildProviderPublicProfileSimilarCards({ providers: similarProviders, t: t as never, locale: 'de' })).toHaveLength(2);
  });

  it('builds availability calendar config and final profile view model', () => {
    const t = (key: string) => key;
    const profileCard = buildProviderPublicProfileCard({ provider: provider({ basePrice: 80 }), t: t as never, locale: 'de' });
    const viewModel = buildProviderPublicProfileViewModel({
      provider: provider({ basePrice: 80 }),
      profileCard,
      hasRecentReview: true,
      locale: 'de',
      formatPrice: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
      t: t as never,
      similarCardsLength: 1,
      hasSameCityProviders: false,
    });
    const calendar = buildProviderPublicProfileAvailabilityCalendarConfig({
      locale: 'de',
      availableIsoDays: ['2026-03-24'],
      rangeStartIso: '2026-03-23',
      rangeEndIso: '2026-04-06',
    });

    expect(viewModel.statusLabel).toBe('requestDetails.clientOnline');
    expect(viewModel.pricePrefixLabel).toBe('provider.basePrice:');
    expect(viewModel.priceSuffixLabel).toBe('pro Stunde');
    expect(viewModel.similarProvidersHint).toBe('Aus derselben Leistungskategorie.');
    expect(calendar.legendFree).toBe('Frei');
    expect(calendar.rangeStartIso).toBe('2026-03-23');
  });
});
