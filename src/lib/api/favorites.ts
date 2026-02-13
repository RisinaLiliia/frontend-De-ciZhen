// src/lib/api/favorites.ts
import { apiDelete, apiGet, apiPost } from '@/lib/api/http';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';

type FavoriteResultDto = { ok: true };
type FavoriteType = 'provider' | 'request';

export function listFavorites(type: 'request'): Promise<RequestResponseDto[]>;
export function listFavorites(type: 'provider'): Promise<ProviderPublicDto[]>;
export function listFavorites(type: FavoriteType) {
  return apiGet(`/favorites?type=${encodeURIComponent(type)}`);
}

export function addFavorite(type: FavoriteType, targetId: string) {
  return apiPost<{ type: FavoriteType; targetId: string }, FavoriteResultDto>('/favorites', { type, targetId });
}

export function removeFavorite(type: FavoriteType, targetId: string) {
  return apiDelete<FavoriteResultDto>(`/favorites?type=${encodeURIComponent(type)}&targetId=${encodeURIComponent(targetId)}`);
}
