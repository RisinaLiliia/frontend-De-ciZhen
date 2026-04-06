import { ALL_OPTION_KEY } from '@/features/workspace/requests';
import type { PublicRequestsSort } from '@/lib/api/requests';
import {
  REQUESTS_PAGE_SIZE,
  REQUESTS_PAGE_SIZE_SINGLE,
} from '@/lib/requests/pagination';

export const REQUESTS_FILTER_QUERY_KEYS = new Set([
  'city',
  'cityId',
  'category',
  'categoryKey',
  'service',
  'subcategoryKey',
  'serviceKey',
  'sort',
  'page',
  'limit',
]);
export const DEFAULT_REQUESTS_FILTER_LIMIT = REQUESTS_PAGE_SIZE;

type SearchParamsLike = Pick<URLSearchParams, 'get' | 'forEach'>;

type RequestsFiltersCurrentState = {
  cityId: string;
  categoryKey: string;
  subcategoryKey: string;
  sortBy: PublicRequestsSort;
  page: number;
  limit: number;
};

type RequestsFiltersNextState = {
  cityId?: string;
  categoryKey?: string;
  subcategoryKey?: string;
  sortBy?: PublicRequestsSort;
  page?: number;
  limit?: number;
};

type RequestsService = {
  key: string;
  categoryKey: string;
};

export function readPositiveInt(value: string | null, fallback: number, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value ?? '');
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(max, Math.trunc(parsed));
}

export function resolveRequestsFilterQueryParams(
  searchParams: SearchParamsLike,
  defaultSort: PublicRequestsSort,
) {
  const requestedLimit = readPositiveInt(searchParams.get('limit'), DEFAULT_REQUESTS_FILTER_LIMIT, REQUESTS_PAGE_SIZE);
  const limit = requestedLimit <= REQUESTS_PAGE_SIZE_SINGLE ? REQUESTS_PAGE_SIZE_SINGLE : REQUESTS_PAGE_SIZE;

  return {
    categoryParam: searchParams.get('category') ?? searchParams.get('categoryKey') ?? ALL_OPTION_KEY,
    subcategoryParam: searchParams.get('service')
      ?? searchParams.get('subcategoryKey')
      ?? searchParams.get('serviceKey')
      ?? ALL_OPTION_KEY,
    cityId: searchParams.get('city') ?? searchParams.get('cityId') ?? ALL_OPTION_KEY,
    sortBy: (searchParams.get('sort') as PublicRequestsSort | null) ?? defaultSort,
    page: readPositiveInt(searchParams.get('page'), 1),
    limit,
  };
}

export function buildRequestsServiceByKeyMap<TService extends RequestsService>(services: TService[]) {
  return new Map(services.map((service) => [service.key, service]));
}

export function resolveRequestsFilterSelection<TService extends RequestsService>(params: {
  services: TService[];
  categoryParam: string;
  subcategoryParam: string;
}) {
  const { services, categoryParam, subcategoryParam } = params;
  const serviceByKey = buildRequestsServiceByKeyMap(services);

  const categoryKey = (() => {
    if (categoryParam !== ALL_OPTION_KEY) return categoryParam;
    if (subcategoryParam === ALL_OPTION_KEY) return ALL_OPTION_KEY;
    return serviceByKey.get(subcategoryParam)?.categoryKey ?? ALL_OPTION_KEY;
  })();

  const subcategoryKey = (() => {
    if (subcategoryParam === ALL_OPTION_KEY) return ALL_OPTION_KEY;
    if (categoryKey === ALL_OPTION_KEY) return subcategoryParam;
    const service = serviceByKey.get(subcategoryParam);
    if (!service || service.categoryKey !== categoryKey) return ALL_OPTION_KEY;
    return subcategoryParam;
  })();

  return {
    categoryKey,
    subcategoryKey,
    filteredServices:
      categoryKey === ALL_OPTION_KEY
        ? []
        : services.filter((service) => service.categoryKey === categoryKey),
  };
}

export function buildPublicRequestsFilterPayload(params: {
  cityId: string;
  categoryKey: string;
  subcategoryKey: string;
  sortBy: PublicRequestsSort;
  page: number;
  limit: number;
}) {
  const { cityId, categoryKey, subcategoryKey, sortBy, page, limit } = params;
  return {
    cityId: cityId === ALL_OPTION_KEY ? undefined : cityId,
    categoryKey: categoryKey === ALL_OPTION_KEY ? undefined : categoryKey,
    subcategoryKey: subcategoryKey === ALL_OPTION_KEY ? undefined : subcategoryKey,
    sort: sortBy,
    page,
    limit,
  };
}

export function buildRequestsFiltersHref(params: {
  pathname: string;
  searchParams: SearchParamsLike;
  current: RequestsFiltersCurrentState;
  next: RequestsFiltersNextState;
  defaultSort: PublicRequestsSort;
}) {
  const { pathname, searchParams, current, next, defaultSort } = params;
  const merged = new URLSearchParams();

  searchParams.forEach((value, key) => {
    if (!REQUESTS_FILTER_QUERY_KEYS.has(key)) {
      merged.append(key, value);
    }
  });

  const nextCity = next.cityId ?? current.cityId;
  const nextCategory = next.categoryKey ?? current.categoryKey;
  const nextSubcategory = next.subcategoryKey ?? current.subcategoryKey;
  const nextSort = next.sortBy ?? current.sortBy;
  const nextPage = next.page ?? current.page;
  const nextLimit = next.limit ?? current.limit;

  if (nextCity !== ALL_OPTION_KEY) merged.set('cityId', nextCity);
  if (nextCategory !== ALL_OPTION_KEY) merged.set('categoryKey', nextCategory);
  if (nextSubcategory !== ALL_OPTION_KEY) merged.set('subcategoryKey', nextSubcategory);
  if (nextSort !== defaultSort) merged.set('sort', nextSort);
  if (nextPage > 1) merged.set('page', String(nextPage));
  if (nextLimit !== DEFAULT_REQUESTS_FILTER_LIMIT) merged.set('limit', String(nextLimit));

  const nextQuery = merged.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}
