import type { OfferDto } from '@/lib/api/dto/offers';

type PublicFilter = {
  cityId?: string;
  categoryKey?: string;
  subcategoryKey?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export function hasDefaultPublicFilter(filter: PublicFilter) {
  return (
    !filter.cityId &&
    !filter.categoryKey &&
    !filter.subcategoryKey &&
    (filter.sort ?? 'date_desc') === 'date_desc' &&
    (filter.page ?? 1) === 1 &&
    (filter.limit ?? 10) === 10
  );
}

export function buildOffersByRequestMap(myOffers: OfferDto[]) {
  const map = new Map<string, OfferDto>();
  myOffers.forEach((offer) => {
    if (!map.has(offer.requestId) || offer.updatedAt > (map.get(offer.requestId)?.updatedAt ?? '')) {
      map.set(offer.requestId, offer);
    }
  });
  return map;
}

export function resolveTotalPages(totalResults: number, limit: number) {
  return Math.max(1, Math.ceil(totalResults / Math.max(1, limit)));
}
