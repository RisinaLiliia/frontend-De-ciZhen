import type { ContractDto } from '@/lib/api/dto/contracts';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { buildProviderFavoriteLookup, isProviderInFavoriteLookup } from '@/lib/api/favorites';
import type { I18nMap } from '@/lib/i18n/helpers';
import { pickI18n } from '@/lib/i18n/helpers';
import type { Locale } from '@/lib/i18n/t';

type CityLookup = ReadonlyMap<string, { i18n: I18nMap }>;
type ServiceLookup = ReadonlyMap<string, { i18n: I18nMap }>;

function toEpoch(value: string | null | undefined): number {
  const parsed = Date.parse(value ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildFavoriteRequestIds(favoriteRequests: RequestResponseDto[]) {
  return new Set(favoriteRequests.map((item) => item.id));
}

export function buildRequestById(
  requests: RequestResponseDto[],
  favoriteRequests: RequestResponseDto[],
) {
  const map = new Map<string, RequestResponseDto>();
  for (const request of requests) map.set(request.id, request);
  for (const request of favoriteRequests) map.set(request.id, request);
  return map;
}

export function buildProviderById(
  providers: ProviderPublicDto[],
  favoriteProviders: ProviderPublicDto[],
) {
  const map = new Map<string, ProviderPublicDto>();
  for (const provider of providers) map.set(provider.id, provider);
  for (const provider of favoriteProviders) map.set(provider.id, provider);
  return map;
}

export function buildFavoriteProviderIds(
  providers: ProviderPublicDto[],
  favoriteProviderLookup: ReadonlySet<string>,
) {
  return new Set(
    providers
      .filter((provider) => isProviderInFavoriteLookup(favoriteProviderLookup, provider))
      .map((provider) => provider.id),
  );
}

export function buildOffersByRequest(myOffers: OfferDto[]) {
  const map = new Map<string, OfferDto>();
  for (const offer of myOffers) {
    const current = map.get(offer.requestId);
    if (!current || toEpoch(offer.updatedAt) > toEpoch(current.updatedAt)) {
      map.set(offer.requestId, offer);
    }
  }
  return map;
}

export function buildAllMyContracts(
  myProviderContracts: ContractDto[],
  myClientContracts: ContractDto[],
) {
  return [...myProviderContracts, ...myClientContracts].sort(
    (a, b) => toEpoch(b.updatedAt) - toEpoch(a.updatedAt),
  );
}

export function buildFavoriteProviderCityLabelById(
  favoriteProviders: ProviderPublicDto[],
  cityById: CityLookup,
  locale: Locale,
) {
  const map = new Map<string, string>();
  for (const provider of favoriteProviders) {
    const cityId = provider.cityId?.trim();
    if (!cityId || map.has(provider.id)) continue;
    const city = cityById.get(cityId);
    if (!city) continue;
    map.set(provider.id, pickI18n(city.i18n, locale));
  }
  return map;
}

export function buildFavoriteProviderRoleLabelById(
  favoriteProviders: ProviderPublicDto[],
  serviceByKey: ServiceLookup,
  locale: Locale,
) {
  const map = new Map<string, string>();
  for (const provider of favoriteProviders) {
    const serviceCandidates = [
      ...(Array.isArray(provider.serviceKeys) ? provider.serviceKeys : []),
      ...(provider.serviceKey ? [provider.serviceKey] : []),
    ]
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value));
    const serviceKey = serviceCandidates.find((key) => serviceByKey.has(key));
    if (!serviceKey) continue;
    const service = serviceByKey.get(serviceKey);
    if (!service) continue;
    map.set(provider.id, pickI18n(service.i18n, locale));
  }
  return map;
}

export { buildProviderFavoriteLookup };
