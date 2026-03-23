import type { CSSProperties } from 'react';

import type { City } from '@/features/catalog/model';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { PublicRequestsResponseDto, RequestResponseDto } from '@/lib/api/dto/requests';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

export function resolveHomeNearbyCityId(cities: City[], region?: string | null) {
  if (!region) return undefined;

  const target = region.trim().toLowerCase();
  const match = cities.find((city) =>
    Object.values(city.i18n ?? {}).some((name) => name.trim().toLowerCase() === target),
  );

  return match?.id;
}

export function shouldUseHomeNearbyFallback(cityId: string | undefined, primaryItemsLength: number, targetItems: number) {
  return Boolean(cityId) && primaryItemsLength < targetItems;
}

export function buildHomeNearbyRequestsResult(params: {
  primary: PublicRequestsResponseDto;
  fallback: PublicRequestsResponseDto;
  targetItems: number;
}) {
  const seen = new Set(params.primary.items.map((item) => item.id));
  const merged = [...params.primary.items];

  for (const item of params.fallback.items) {
    if (seen.has(item.id)) continue;
    merged.push(item);
    seen.add(item.id);
    if (merged.length >= params.targetItems) break;
  }

  return {
    ...params.primary,
    items: merged.slice(0, params.targetItems),
    usedFallback: merged.length > params.primary.items.length,
  };
}

export function buildHomeNearbyOffersByRequest(myOffers: OfferDto[]) {
  const map = new Map<string, OfferDto>();

  for (const offer of myOffers) {
    const current = map.get(offer.requestId);
    if (!current || offer.updatedAt > current.updatedAt) {
      map.set(offer.requestId, offer);
    }
  }

  return map;
}

export function buildHomeNearbyRequestById(requests: RequestResponseDto[]) {
  return new Map(requests.map((request) => [request.id, request]));
}

export function buildHomeNearbyFavoriteRequestIds(favoriteRequests: Array<Pick<RequestResponseDto, 'id'>>) {
  return new Set(favoriteRequests.map((item) => item.id));
}

export function buildHomeNearbyNextPath(pathname: string, searchParamsValue?: string | null) {
  return `${pathname}${searchParamsValue ? `?${searchParamsValue}` : ''}`;
}

export function resolveHomeNearbySubtitleKey(usedFallback: boolean): I18nKey {
  return usedFallback
    ? I18N_KEYS.homePublic.nearbyFallbackHint
    : I18N_KEYS.homePublic.nearbySubtitle;
}

export function buildHomeNearbyPanelStyle(params: {
  visibleRows?: number;
  targetItems: number;
}): CSSProperties {
  return {
    '--home-nearby-visible-rows': String(Math.max(1, params.visibleRows ?? params.targetItems)),
  } as CSSProperties;
}

export function resolveHomeNearbyOfferHref(requestId: string) {
  return `/requests/${requestId}?offer=1`;
}

export function resolveHomeNearbyLoginHref(requestId: string) {
  return `/auth/login?next=${encodeURIComponent(resolveHomeNearbyOfferHref(requestId))}`;
}

export function findHomeNearbyOfferRequestId(myOffers: OfferDto[], offerId: string) {
  return myOffers.find((offer) => offer.id === offerId)?.requestId ?? null;
}
