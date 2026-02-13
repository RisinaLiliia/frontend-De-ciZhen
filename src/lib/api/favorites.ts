// src/lib/api/favorites.ts
import { apiDelete, apiGet, apiPost } from '@/lib/api/http';
import type { RequestResponseDto } from '@/lib/api/dto/requests';

type FavoriteResultDto = { ok: true };

export function listFavoriteRequests() {
  return apiGet<RequestResponseDto[]>('/favorites/requests');
}

export function addFavoriteRequest(requestId: string) {
  return apiPost<void, FavoriteResultDto>(`/favorites/requests/${requestId}`);
}

export function removeFavoriteRequest(requestId: string) {
  return apiDelete<FavoriteResultDto>(`/favorites/requests/${requestId}`);
}
