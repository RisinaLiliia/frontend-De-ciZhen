import { describe, expect, it } from 'vitest';
import { buildRequestDetailsViewModel } from '@/features/requests/details/viewModel';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { RequestResponseDto } from '@/lib/api/dto/requests';

const t = (key: string) => key;
const formatPrice = (value: number) => `€${value}`;
const formatDate = (value: Date) => value.toISOString().slice(0, 10);

function baseRequest(overrides: Partial<RequestResponseDto> = {}): RequestResponseDto {
  return {
    id: 'req-1',
    serviceKey: 'tap_replace',
    cityId: 'city-1',
    propertyType: 'apartment',
    area: 50,
    preferredDate: '2026-03-02T18:42:00.000Z',
    isRecurring: false,
    status: 'published',
    createdAt: '2026-02-09T18:43:23.449Z',
    ...overrides,
  };
}

describe('buildRequestDetailsViewModel', () => {
  it('formats rating and count from backend values', () => {
    const vm = buildRequestDetailsViewModel({
      request: baseRequest({ clientRatingAvg: 4.9, clientRatingCount: 12 }),
      t,
      formatPrice,
      formatDate,
      isClientOnline: true,
    });
    expect(vm.clientRatingText).toBe('4.9');
    expect(vm.clientRatingCount).toBe(12);
  });

  it('falls back to 0.0 and 0 when rating is missing', () => {
    const vm = buildRequestDetailsViewModel({
      request: baseRequest({ clientRatingAvg: null, clientRatingCount: null }),
      t,
      formatPrice,
      formatDate,
      isClientOnline: false,
    });
    expect(vm.clientRatingText).toBe('0.0');
    expect(vm.clientRatingCount).toBe(0);
  });

  it('uses fallback tags when request tags are empty', () => {
    const vm = buildRequestDetailsViewModel({
      request: baseRequest({ tags: [], categoryName: 'Plumbing', subcategoryName: 'Replace tap' }),
      t,
      formatPrice,
      formatDate,
      isClientOnline: false,
    });
    expect(vm.tagList).toEqual(['Plumbing', 'Replace tap']);
  });

  it('handles invalid preferredDate', () => {
    const vm = buildRequestDetailsViewModel({
      request: baseRequest({ preferredDate: 'invalid-date' }),
      t,
      formatPrice,
      formatDate,
      isClientOnline: false,
    });
    expect(vm.preferredDateLabel).toBe('—');
  });

  it('uses correct status label based on online flag', () => {
    const online = buildRequestDetailsViewModel({
      request: baseRequest({ clientName: 'Liliia' }),
      t,
      formatPrice,
      formatDate,
      isClientOnline: true,
    });
    const offline = buildRequestDetailsViewModel({
      request: baseRequest({ clientName: 'Liliia' }),
      t,
      formatPrice,
      formatDate,
      isClientOnline: false,
    });
    expect(online.clientStatus).toBe('online');
    expect(online.clientStatusLabel).toBe(I18N_KEYS.requestDetails.clientOnline);
    expect(offline.clientStatus).toBe('offline');
    expect(offline.clientStatusLabel).toBe(I18N_KEYS.requestDetails.clientActive);
  });
});
