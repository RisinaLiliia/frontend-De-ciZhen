import { describe, expect, it } from 'vitest';

import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import {
  buildProviderAvailabilityModel,
  getAvailableIsoDays,
  getNextSlotStartAt,
  getProviderCityKey,
  getProviderServiceKeys,
} from '@/features/providers/publicProfile/providerPublicProfile.presentation';

function provider(overrides: Partial<ProviderPublicDto> = {}): ProviderPublicDto {
  return {
    id: 'provider-1',
    ratingAvg: 4.6,
    ratingCount: 10,
    completedJobs: 42,
    ...overrides,
  };
}

describe('providerPublicProfile.presentation', () => {
  it('builds deduplicated normalized service keys', () => {
    const result = getProviderServiceKeys(
      provider({
        serviceKey: 'Home_Cleaning',
        serviceKeys: ['home_cleaning', ' window_cleaning '],
      }),
    );
    expect(result).toEqual(['home_cleaning', 'window_cleaning']);
  });

  it('builds city keys by cityId first, then cityName', () => {
    expect(getProviderCityKey(provider({ cityId: 'Berlin-Id', cityName: 'Berlin' }))).toBe('id:berlin-id');
    expect(getProviderCityKey(provider({ cityName: 'Berlin' }))).toBe('name:berlin');
    expect(getProviderCityKey(provider({}))).toBe('');
  });

  it('derives next slot and available days from slot list', () => {
    const slots = [
      { startAt: '2026-03-08T10:00:00.000Z' },
      { startAt: '2026-03-07T08:00:00.000Z' },
      { startAt: 'invalid' },
      { startAt: '2026-03-08T12:00:00.000Z' },
    ];
    expect(getNextSlotStartAt(slots)).toBe('2026-03-07T08:00:00.000Z');
    expect(getAvailableIsoDays(slots)).toEqual(['2026-03-07', '2026-03-08']);
  });

  it('builds busy availability model when no slots are available', () => {
    const model = buildProviderAvailabilityModel({
      availabilityState: undefined,
      nextAvailableAt: null,
      nextSlotStartAt: null,
      formatLongDate: () => 'formatted-date',
      openLabel: 'Open',
      busyLabel: 'Busy',
      nextSlotLabel: 'Next slot',
    });
    expect(model.isBusy).toBe(true);
    expect(model.stateLabel).toBe('Busy');
    expect(model.datePrefix).toBe('Next slot');
    expect(model.dateLabel).toBe('formatted-date');
  });
});
