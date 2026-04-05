// src/lib/api/requests.ts
import { apiDelete, apiGet, apiPatch, apiPost, apiPostForm } from '@/lib/api/http';
import { REQUESTS_PAGE_SIZE } from '@/lib/requests/pagination';
import type {
  CreateRequestDto,
  DeleteMyRequestResponseDto,
  PublicRequestsResponseDto,
  RequestResponseDto,
  UpdateMyRequestDto,
} from '@/lib/api/dto/requests';

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

export function buildPublicRequestsQuery(filter: PublicRequestsFilter) {
  const page = Math.max(1, Math.trunc(filter.page ?? 1));
  const limit = Math.min(100, Math.max(1, Math.trunc(filter.limit ?? REQUESTS_PAGE_SIZE)));
  const offset =
    filter.offset == null
      ? (page - 1) * limit
      : Math.max(0, Math.trunc(filter.offset));
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
  qs.set('page', String(page));
  qs.set('offset', String(offset));
  qs.set('limit', String(limit));
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

export async function listPublicRequests(filter: PublicRequestsFilter = {}) {
  return listPublicRequestsFromApi(filter);
}

export function getPublicRequestById(requestId: string, options?: { locale?: string }) {
  void options;
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
