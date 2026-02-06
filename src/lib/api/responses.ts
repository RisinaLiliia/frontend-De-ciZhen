// src/lib/api/responses.ts
import { apiGet, apiPatch, apiPost } from '@/lib/api/http';
import type {
  AcceptResponseResultDto,
  CreateResponseDto,
  ResponseDto,
} from '@/lib/api/dto/responses';

export function listResponsesByRequest(requestId: string) {
  return apiGet<ResponseDto[]>(`/responses/by-request/${requestId}`);
}

export function listMyClientResponses(params?: { status?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<ResponseDto[]>(`/responses/my-client${suffix}`);
}

export function listMyProviderResponses(params?: { status?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<ResponseDto[]>(`/responses/my${suffix}`);
}

export function respondToRequest(payload: CreateResponseDto) {
  return apiPost<CreateResponseDto, ResponseDto>('/responses', payload);
}

export function acceptResponse(id: string) {
  return apiPatch<void, AcceptResponseResultDto>(`/responses/id/${id}/accept`, undefined);
}
