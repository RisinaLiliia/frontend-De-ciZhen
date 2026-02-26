// src/lib/api/requests.ts
import { apiDelete, apiGet, apiPatch, apiPost, apiPostForm } from '@/lib/api/http';
import { ApiError } from '@/lib/api/http-error';
import type {
  CreateRequestDto,
  DeleteMyRequestResponseDto,
  PublicRequestsResponseDto,
  RequestResponseDto,
  UpdateMyRequestDto,
} from '@/lib/api/dto/requests';
import { getMockPublicRequestById, listMockPublicRequests } from '@/lib/api/requests-mock';

export function createRequest(payload: CreateRequestDto) {
  return apiPost<CreateRequestDto, RequestResponseDto>('/requests/my', payload);
}

export function publishMyRequest(requestId: string) {
  return apiPost<undefined, RequestResponseDto>(`/requests/my/${requestId}/publish`, undefined);
}

export function uploadRequestPhotos(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));
  return apiPostForm<{ urls: string[] }>('/requests/my/photos', formData);
}

export type PublicRequestsSort =
  | 'date_desc'
  | 'date_asc'
  | 'price_asc'
  | 'price_desc';

export type PublicRequestsFilter = {
  locale?: string;
  cityId?: string;
  categoryKey?: string;
  subcategoryKey?: string;
  serviceKey?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: PublicRequestsSort;
  page?: number;
  limit?: number;
  offset?: number;
};

type RequestsMockMode = 'off' | 'only' | 'merge';

function isMockRequestId(requestId: string) {
  return requestId.trim().startsWith('mock-request-');
}

function readMockMode(): RequestsMockMode {
  const explicit = (process.env.NEXT_PUBLIC_REQUESTS_MOCK_MODE ?? '').toLowerCase();
  if (explicit === 'off' || explicit === 'only' || explicit === 'merge') return explicit;
  return process.env.NEXT_PUBLIC_REQUESTS_MOCK_ENABLED === 'true' ? 'only' : 'off';
}

function readMergeFetchLimit() {
  const raw = Number(process.env.NEXT_PUBLIC_REQUESTS_MOCK_MERGE_FETCH_LIMIT ?? 100);
  if (!Number.isFinite(raw)) return 100;
  const normalized = Math.floor(raw);
  return Math.min(100, Math.max(20, normalized));
}

export function buildPublicRequestsQuery(filter: PublicRequestsFilter) {
  const qs = new URLSearchParams();
  if (filter.cityId) qs.set('cityId', filter.cityId);
  if (filter.categoryKey) qs.set('categoryKey', filter.categoryKey);
  if (filter.subcategoryKey) {
    qs.set('subcategoryKey', filter.subcategoryKey);
  } else if (filter.serviceKey) {
    qs.set('serviceKey', filter.serviceKey);
  }
  if (filter.priceMin != null) qs.set('priceMin', String(filter.priceMin));
  if (filter.priceMax != null) qs.set('priceMax', String(filter.priceMax));
  qs.set('sort', filter.sort ?? 'date_desc');
  if (filter.offset != null) {
    qs.set('offset', String(filter.offset));
  } else {
    qs.set('page', String(filter.page ?? 1));
  }
  qs.set('limit', String(filter.limit ?? 20));
  return qs.toString();
}

async function listPublicRequestsFromApi(filter: PublicRequestsFilter = {}) {
  const suffix = buildPublicRequestsQuery(filter);
  const response = await apiGet<PublicRequestsResponseDto | RequestResponseDto[]>(
    `/requests/public?${suffix}`,
  );
  if (Array.isArray(response)) {
    return {
      items: response,
      total: response.length,
      page: 1,
      limit: response.length,
    };
  }
  return response;
}

function sortRequests(items: RequestResponseDto[], sort: PublicRequestsSort = 'date_desc') {
  const copy = [...items];
  copy.sort((a, b) => {
    if (sort === 'date_desc') return a.createdAt < b.createdAt ? 1 : -1;
    if (sort === 'date_asc') return a.createdAt > b.createdAt ? 1 : -1;
    if (sort === 'price_asc') return (a.price ?? 0) - (b.price ?? 0);
    return (b.price ?? 0) - (a.price ?? 0);
  });
  return copy;
}

function paginateRequests(items: RequestResponseDto[], filter: PublicRequestsFilter) {
  const limit = Math.max(1, Math.floor(filter.limit ?? 20));
  if (filter.offset != null) {
    const offset = Math.max(0, Math.floor(filter.offset));
    return {
      items: items.slice(offset, offset + limit),
      page: Math.floor(offset / limit) + 1,
      limit,
    };
  }
  const page = Math.max(1, Math.floor(filter.page ?? 1));
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    page,
    limit,
  };
}

export async function listPublicRequests(filter: PublicRequestsFilter = {}) {
  const mode = readMockMode();
  if (mode === 'only') {
    return listMockPublicRequests(filter);
  }
  if (mode === 'off') {
    return listPublicRequestsFromApi(filter);
  }

  const mergeFetchLimit = readMergeFetchLimit();
  const poolFilter: PublicRequestsFilter = {
    ...filter,
    page: 1,
    offset: undefined,
    limit: mergeFetchLimit,
  };

  const [real, mock] = await Promise.all([
    listPublicRequestsFromApi(poolFilter),
    listMockPublicRequests(poolFilter),
  ]);

  const mergedById = new Map<string, RequestResponseDto>();
  for (const item of real.items) mergedById.set(item.id, item);
  for (const item of mock.items) {
    if (!mergedById.has(item.id)) mergedById.set(item.id, item);
  }

  const sorted = sortRequests(Array.from(mergedById.values()), filter.sort ?? 'date_desc');
  const paged = paginateRequests(sorted, filter);
  return {
    items: paged.items,
    total: sorted.length,
    page: paged.page,
    limit: paged.limit,
  };
}

export function getPublicRequestById(requestId: string, options?: { locale?: string }) {
  const mode = readMockMode();
  const isMockId = isMockRequestId(requestId);

  if (mode === 'only' || isMockId) {
    return getMockPublicRequestById(requestId, options?.locale).then((item) => {
      if (item) return item;
      throw new ApiError('Request not found', 404);
    });
  }

  if (mode === 'merge') {
    return apiGet<RequestResponseDto>(`/requests/public/${requestId}`).catch(async (error) => {
      if (!(error instanceof ApiError) || (error.status !== 404 && error.status !== 400)) {
        throw error;
      }
      const item = await getMockPublicRequestById(requestId, options?.locale);
      if (item) return item;
      throw error;
    });
  }
  return apiGet<RequestResponseDto>(`/requests/public/${requestId}`);
}

export function listMyRequests(params?: {
  status?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.from) qs.set('from', params.from);
  if (params?.to) qs.set('to', params.to);
  if (params?.limit !== undefined) qs.set('limit', String(params.limit));
  if (params?.offset !== undefined) qs.set('offset', String(params.offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<RequestResponseDto[]>(`/requests/my${suffix}`);
}

export function updateMyRequest(requestId: string, payload: UpdateMyRequestDto) {
  return apiPatch<UpdateMyRequestDto, RequestResponseDto>(`/requests/my/${requestId}`, payload);
}

export function deleteMyRequest(requestId: string) {
  return apiDelete<DeleteMyRequestResponseDto>(`/requests/my/${requestId}`);
}
