import type { OfferDto } from '@/lib/api/dto/offers';
import type { PublicRequestsResponseDto, RequestResponseDto } from '@/lib/api/dto/requests';
import type { PublicRequestsFilter } from '@/lib/api/requests';
import type { Locale } from '@/lib/i18n/t';
import { hasDefaultPublicFilter } from '@/components/requests/requestsExplorer.model';

type BuildPublicRequestsQueryStateArgs = {
  filter: PublicRequestsFilter;
  locale: Locale;
  isProvidersView: boolean;
  preferInitialPublicRequests: boolean;
  initialPublicRequests?: PublicRequestsResponseDto;
};

export function buildRequestsExplorerPublicRequestsQueryState({
  filter,
  locale,
  isProvidersView,
  preferInitialPublicRequests,
  initialPublicRequests,
}: BuildPublicRequestsQueryStateArgs) {
  const shouldUseInitialPublicRequests = preferInitialPublicRequests && hasDefaultPublicFilter(filter);

  return {
    queryKey: [
      'requests-explorer-public',
      filter.cityId,
      filter.categoryKey,
      filter.subcategoryKey,
      filter.sort,
      filter.page,
      filter.limit,
      locale,
    ] as const,
    enabled: !isProvidersView,
    initialData:
      !isProvidersView && shouldUseInitialPublicRequests
        ? initialPublicRequests
        : undefined,
  };
}

export function buildRequestByIdMap(requests: RequestResponseDto[]) {
  return new Map(requests.map((request) => [request.id, request]));
}

export function buildFavoriteRequestIds(requests: Array<Pick<RequestResponseDto, 'id'>>) {
  return new Set(requests.map((request) => request.id));
}

export function findOfferRequestId(myOffers: OfferDto[], offerId: string) {
  return myOffers.find((offer) => offer.id === offerId)?.requestId ?? null;
}

export function resolveRequestsExplorerOfferHref(requestId: string) {
  return `/requests/${requestId}?offer=1`;
}

export function resolveRequestsExplorerLoginHref(requestId: string) {
  return `/auth/login?next=${encodeURIComponent(resolveRequestsExplorerOfferHref(requestId))}`;
}

export function formatRequestsExplorerTotalResultsLabel(locale: Locale, totalResults: number) {
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US').format(totalResults);
}
