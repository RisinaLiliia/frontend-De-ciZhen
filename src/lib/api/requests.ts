// src/lib/api/requests.ts
import { apiGet, apiPost } from '@/lib/api/http';
import type { CreateRequestDto, RequestResponseDto } from '@/lib/api/dto/requests';

export function createRequest(payload: CreateRequestDto) {
  return apiPost<CreateRequestDto, RequestResponseDto>('/requests', payload);
}

export function listPublicRequests(params?: {
  cityId?: string;
  serviceKey?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.cityId) qs.set('cityId', params.cityId);
  if (params?.serviceKey) qs.set('serviceKey', params.serviceKey);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<RequestResponseDto[]>(`/requests/public${suffix}`);
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
