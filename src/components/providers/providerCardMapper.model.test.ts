import { describe, expect, it } from 'vitest';

import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import {
  buildProviderCardBadges,
  buildProviderServicePreview,
  computeProviderResponseRate,
  hashProviderCardSeed,
  resolveProviderAvailabilityLabel,
  resolveProviderBioPreview,
  resolveProviderCityLabel,
  resolveProviderIsVerified,
  resolveProviderPricingLabel,
  resolveProviderResponseMinutes,
} from '@/components/providers/providerCardMapper.model';

function provider(overrides: Partial<ProviderPublicDto> = {}): ProviderPublicDto {
  return {
    id: 'provider-1',
    ratingAvg: 4.6,
    ratingCount: 10,
    completedJobs: 20,
    ...overrides,
  };
}

describe('providerCardMapper.model', () => {
  it('builds deterministic seed and derived response metrics', () => {
    const seed = hashProviderCardSeed('provider-1');

    expect(seed).toBe(hashProviderCardSeed('provider-1'));
    expect(resolveProviderResponseMinutes(seed)).toBeGreaterThanOrEqual(10);
    expect(resolveProviderResponseMinutes(seed)).toBeLessThanOrEqual(25);
    expect(computeProviderResponseRate(provider({ ratingAvg: 4.9, ratingCount: 120, completedJobs: 400 }))).toBe(77);
    expect(computeProviderResponseRate(provider({ ratingAvg: 5, ratingCount: 9999, completedJobs: 9999 }))).toBe(78);
  });

  it('builds pricing, availability, city and preview fallbacks', () => {
    const t = (key: string) => key;

    expect(
      resolveProviderPricingLabel({
        t,
        provider: provider({ basePrice: 55 }),
      }),
    ).toContain('55€');

    expect(
      resolveProviderAvailabilityLabel({
        t,
        provider: provider({ availabilityState: 'busy' }),
        seed: 3,
      }),
    ).toBe('homePublic.providerAvailabilityTomorrow');

    expect(
      resolveProviderCityLabel({
        cityLabel: '',
        provider: provider({ cityName: 'Berlin' }),
        seed: 1,
      }),
    ).toBe('Berlin');

    expect(resolveProviderBioPreview({ aboutPreview: ' Custom bio ', seed: 1 })).toBe('Custom bio');
    expect(buildProviderServicePreview({ t, seed: 1 })).toHaveLength(2);
  });

  it('builds badge variants and verified state from provider stats', () => {
    const t = (key: string) => key;

    expect(
      buildProviderCardBadges({
        t,
        provider: provider({ ratingAvg: 4.9, ratingCount: 40 }),
        responseRate: 82,
        responseMinutes: 18,
      }).map((badge) => badge.type),
    ).toEqual(['top']);

    expect(
      buildProviderCardBadges({
        t,
        provider: provider({ ratingAvg: 4.75, ratingCount: 20 }),
        responseRate: 79,
        responseMinutes: 18,
      }).map((badge) => badge.type),
    ).toEqual(['service', 'fast']);

    expect(resolveProviderIsVerified(provider({ ratingCount: 31 }))).toBe(true);
    expect(resolveProviderIsVerified(provider({ ratingCount: 5, completedJobs: 10 }))).toBe(false);
  });
});
