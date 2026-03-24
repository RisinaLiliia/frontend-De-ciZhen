export const REQUESTS_PAGE_SIZE_SINGLE = 10;
export const REQUESTS_PAGE_SIZE_DOUBLE = 20;
export const REQUESTS_PAGE_SIZE = REQUESTS_PAGE_SIZE_DOUBLE;

export const REQUESTS_LIST_DENSITIES = ['single', 'double'] as const;

export type RequestsListDensity = (typeof REQUESTS_LIST_DENSITIES)[number];

export const DEFAULT_REQUESTS_LIST_DENSITY: RequestsListDensity = 'single';

export function resolveRequestsPageSizeForDensity(density: RequestsListDensity) {
  return density === 'double' ? REQUESTS_PAGE_SIZE_DOUBLE : REQUESTS_PAGE_SIZE_SINGLE;
}

export function resolveRequestsListDensityForPageSize(limit: number): RequestsListDensity {
  return limit >= REQUESTS_PAGE_SIZE_DOUBLE ? 'double' : 'single';
}
