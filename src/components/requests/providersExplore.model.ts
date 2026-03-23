import { isProviderInFavoriteLookup } from '@/lib/api/favorites';
import { ALL_OPTION_KEY } from '@/features/workspace/requests';
import type { FilterOption } from '@/components/requests/requestsFilters.types';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { Locale } from '@/lib/i18n/t';

type ProviderFavoriteLookup = ReadonlySet<string>;

type ProviderService = {
  key: string;
  categoryKey: string;
};

type BuildProvidersExploreCollectionArgs = {
  providers: ProviderPublicDto[];
  favoriteProviderLookup: ProviderFavoriteLookup;
  categoryKey: string;
  subcategoryKey: string;
  cityId: string;
  services: ProviderService[];
  cityOptions: FilterOption[];
  sortBy: string;
  page: number;
  limit: number;
};

function getProviderServiceKeys(provider: ProviderPublicDto) {
  const values = [
    ...(Array.isArray(provider.serviceKeys) ? provider.serviceKeys : []),
    ...(typeof provider.serviceKey === 'string' && provider.serviceKey.trim().length > 0
      ? [provider.serviceKey]
      : []),
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  return new Set(values);
}

function resolveSelectedCityLabel(cityId: string, cityOptions: FilterOption[]) {
  if (cityId === ALL_OPTION_KEY) return '';
  return cityOptions.find((option) => option.value === cityId)?.label?.trim().toLowerCase() ?? '';
}

export function buildProviderByIdMap(providers: ProviderPublicDto[]) {
  return new Map(providers.map((provider) => [provider.id, provider]));
}

export function buildFavoriteProviderIds(
  providers: ProviderPublicDto[],
  favoriteProviderLookup: ProviderFavoriteLookup,
) {
  return new Set(
    providers
      .filter((provider) => isProviderInFavoriteLookup(favoriteProviderLookup, provider))
      .map((provider) => provider.id),
  );
}

export function buildCategoryServiceKeys(categoryKey: string, services: ProviderService[]) {
  if (categoryKey === ALL_OPTION_KEY) return null;
  return new Set(
    services
      .filter((service) => service.categoryKey === categoryKey)
      .map((service) => service.key),
  );
}

export function filterProvidersForExplore({
  providers,
  cityId,
  cityOptions,
  subcategoryKey,
  categoryServiceKeys,
}: {
  providers: ProviderPublicDto[];
  cityId: string;
  cityOptions: FilterOption[];
  subcategoryKey: string;
  categoryServiceKeys: ReadonlySet<string> | null;
}) {
  const selectedCityLabel = resolveSelectedCityLabel(cityId, cityOptions);

  return providers.filter((provider) => {
    if (cityId !== ALL_OPTION_KEY) {
      const providerCityId = provider.cityId ?? '';
      const providerCityName = (
        provider.cityName ??
        (provider as { city?: string | null }).city ??
        ''
      )
        .trim()
        .toLowerCase();
      const matchesById = providerCityId === cityId;
      const matchesByName = Boolean(selectedCityLabel) && providerCityName === selectedCityLabel;
      if (!matchesById && !matchesByName) return false;
    }

    const providerServiceKeys = getProviderServiceKeys(provider);
    if (subcategoryKey !== ALL_OPTION_KEY) {
      return providerServiceKeys.has(subcategoryKey);
    }
    if (categoryServiceKeys) {
      if (providerServiceKeys.size === 0) return false;
      for (const key of providerServiceKeys) {
        if (categoryServiceKeys.has(key)) return true;
      }
      return false;
    }
    return true;
  });
}

export function sortProvidersForExplore(providers: ProviderPublicDto[], sortBy: string) {
  const copy = [...providers];
  copy.sort((a, b) => {
    if (sortBy === 'date_asc') return a.ratingAvg - b.ratingAvg;
    if (sortBy === 'price_asc') return (a.basePrice ?? 0) - (b.basePrice ?? 0);
    if (sortBy === 'price_desc') return (b.basePrice ?? 0) - (a.basePrice ?? 0);
    return b.ratingAvg - a.ratingAvg;
  });
  return copy;
}

export function paginateProvidersForExplore(providers: ProviderPublicDto[], page: number, limit: number) {
  const safeLimit = Math.max(1, limit);
  const start = (Math.max(1, page) - 1) * safeLimit;
  return providers.slice(start, start + safeLimit);
}

export function resolveProvidersTotalPages(totalProviders: number, limit: number) {
  return Math.max(1, Math.ceil(totalProviders / Math.max(1, limit)));
}

export function formatProvidersTotalLabel(locale: Locale, totalProviders: number) {
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US').format(totalProviders);
}

export function buildProvidersExploreCollection({
  providers,
  favoriteProviderLookup,
  categoryKey,
  subcategoryKey,
  cityId,
  services,
  cityOptions,
  sortBy,
  page,
  limit,
}: BuildProvidersExploreCollectionArgs) {
  const providerById = buildProviderByIdMap(providers);
  const favoriteProviderIds = buildFavoriteProviderIds(providers, favoriteProviderLookup);
  const categoryServiceKeys = buildCategoryServiceKeys(categoryKey, services);
  const filteredProviders = filterProvidersForExplore({
    providers,
    cityId,
    cityOptions,
    subcategoryKey,
    categoryServiceKeys,
  });
  const sortedProviders = sortProvidersForExplore(filteredProviders, sortBy);
  const pagedProviders = paginateProvidersForExplore(sortedProviders, page, limit);
  const filteredProvidersCount = filteredProviders.length;

  return {
    providerById,
    favoriteProviderIds,
    pagedProviders,
    filteredProvidersCount,
    totalProviderPages: resolveProvidersTotalPages(filteredProvidersCount, limit),
  };
}
