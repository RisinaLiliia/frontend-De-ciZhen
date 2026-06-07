import { describe, expect, it } from 'vitest';

import type { City } from '@/features/catalog/model';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { PublicRequestsResponseDto, RequestResponseDto } from '@/lib/api/dto/requests';
import {
  buildHomeNearbyFavoriteRequestIds,
  buildHomeNearbyNextPath,
  buildHomeNearbyOffersByRequest,
  buildHomeNearbyPanelStyle,
  buildHomeNearbyRequestById,
  buildHomeNearbyRequestsResult,
  findHomeNearbyOfferRequestId,
  resolveHomeNearbyCityId,
  resolveHomeNearbyLoginHref,
  resolveHomeNearbyOfferHref,
  resolveHomeNearbySubtitleKey,
  shouldUseHomeNearbyFallback,
} from '@/components/home/homeNearbyPanel.model';

function city(overrides: Partial<City> = {}): City {
  return {
    id: 'berlin',
    key: 'berlin',
    name: 'Berlin',
    i18n: { de: 'Berlin', en: 'Berlin' },
    countryCode: 'DE',
    stateName: 'Berlin',
    districtName: null,
    postalCodes: ['10115'],
    isActive: true,
    sortOrder: 1,
    ...overrides,
  };
}

function request(overrides: Partial<RequestResponseDto> = {}): RequestResponseDto {
  return {
    id: 'request-1',
    serviceKey: 'cleaning',
    cityId: 'berlin',
    propertyType: 'apartment',
    area: 75,
    preferredDate: '2026-03-24',
    isRecurring: false,
    status: 'published',
    createdAt: '2026-03-23T12:00:00.000Z',
    ...overrides,
  };
}

function response(items: RequestResponseDto[]): PublicRequestsResponseDto {
  return {
    items,
    total: items.length,
    page: 1,
    limit: items.length,
  };
}

function offer(overrides: Partial<OfferDto> = {}): OfferDto {
  return {
    id: 'offer-1',
    requestId: 'request-1',
    providerUserId: 'provider-1',
    clientUserId: 'client-1',
    status: 'sent',
    createdAt: '2026-03-23T11:00:00.000Z',
    updatedAt: '2026-03-23T11:00:00.000Z',
    ...overrides,
  };
}

describe('homeNearbyPanel.model', () => {
  it('resolves localized city id from region label', () => {
    expect(resolveHomeNearbyCityId([
      city(),
      city({ id: 'munich', key: 'munich', i18n: { de: 'Muenchen', en: 'Munich' } }),
    ], ' munich ')).toBe('munich');

    expect(resolveHomeNearbyCityId([city()], null)).toBeUndefined();
  });

  it('decides fallback usage and merges primary with deduplicated fallback items', () => {
    expect(shouldUseHomeNearbyFallback('berlin', 1, 3)).toBe(true);
    expect(shouldUseHomeNearbyFallback(undefined, 1, 3)).toBe(false);

    const merged = buildHomeNearbyRequestsResult({
      primary: response([request({ id: 'request-1' })]),
      fallback: response([
        request({ id: 'request-1' }),
        request({ id: 'request-2' }),
        request({ id: 'request-3' }),
      ]),
      targetItems: 3,
    });

    expect(merged.items.map((item) => item.id)).toEqual(['request-1', 'request-2', 'request-3']);
    expect(merged.usedFallback).toBe(true);
  });

  it('builds request and offer lookup helpers', () => {
    const requests = [request({ id: 'request-1' }), request({ id: 'request-2' })];
    const offers = [
      offer({ id: 'offer-1', requestId: 'request-1', updatedAt: '2026-03-23T10:00:00.000Z' }),
      offer({ id: 'offer-2', requestId: 'request-1', updatedAt: '2026-03-23T12:00:00.000Z' }),
      offer({ id: 'offer-3', requestId: 'request-2', updatedAt: '2026-03-23T09:00:00.000Z' }),
    ];

    expect(buildHomeNearbyRequestById(requests).get('request-2')?.id).toBe('request-2');
    expect(buildHomeNearbyFavoriteRequestIds([{ id: 'request-1' }, { id: 'request-2' }])).toEqual(
      new Set(['request-1', 'request-2']),
    );
    expect(buildHomeNearbyOffersByRequest(offers).get('request-1')?.id).toBe('offer-2');
    expect(findHomeNearbyOfferRequestId(offers, 'offer-3')).toBe('request-2');
  });

  it('builds routing, subtitle and panel style helpers', () => {
    expect(buildHomeNearbyNextPath('/workspace', 'section=requests')).toBe('/workspace?section=requests');
    expect(resolveHomeNearbyOfferHref('request-1')).toBe('/requests/request-1?offer=1');
    expect(resolveHomeNearbyLoginHref('request-1')).toBe('/auth/login?next=%2Frequests%2Frequest-1%3Foffer%3D1');
    expect(resolveHomeNearbySubtitleKey(true)).toBe('homePublic.nearbyFallbackHint');
    expect(resolveHomeNearbySubtitleKey(false)).toBe('homePublic.nearbySubtitle');
    expect(buildHomeNearbyPanelStyle({ targetItems: 3, visibleRows: 0 })).toEqual({
      '--home-nearby-visible-rows': '1',
    });
  });
});
