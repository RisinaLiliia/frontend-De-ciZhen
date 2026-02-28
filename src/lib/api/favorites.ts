// src/lib/api/favorites.ts
import { apiDelete, apiGet, apiPost } from '@/lib/api/http';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';

type FavoriteResultDto = { ok: true };
type FavoriteType = 'provider' | 'request';
type FavoriteSnapshot = RequestResponseDto | ProviderPublicDto;

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

function normalizeId(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function isValidObjectId(value: unknown): boolean {
  return OBJECT_ID_RE.test(normalizeId(value));
}

export function getProviderFavoriteCandidateIds(
  provider: Pick<ProviderPublicDto, 'id' | 'userId'> | string,
): string[] {
  if (typeof provider === 'string') {
    const id = normalizeId(provider);
    return id ? [id] : [];
  }

  const ids = [normalizeId(provider.userId), normalizeId(provider.id)].filter(Boolean);
  const unique: string[] = [];
  for (const id of ids) {
    if (!unique.includes(id)) unique.push(id);
  }
  return unique;
}

export function resolveProviderFavoriteTargetId(provider: Pick<ProviderPublicDto, 'id' | 'userId'> | string): string {
  const candidates = getProviderFavoriteCandidateIds(provider);
  const preferred = candidates.find((id) => isValidObjectId(id));
  return preferred ?? '';
}

export function resolveRequestFavoriteTargetId(request: Pick<RequestResponseDto, 'id'> | string): string {
  const id = typeof request === 'string' ? normalizeId(request) : normalizeId(request.id);
  return isValidObjectId(id) ? id : '';
}

export function buildProviderFavoriteLookup(items: Array<Pick<ProviderPublicDto, 'id' | 'userId'>>): Set<string> {
  const ids = new Set<string>();
  for (const item of items) {
    for (const id of getProviderFavoriteCandidateIds(item)) ids.add(id);
  }
  return ids;
}

export function isProviderInFavoriteLookup(
  lookup: ReadonlySet<string>,
  provider: Pick<ProviderPublicDto, 'id' | 'userId'> | null | undefined,
): boolean {
  if (!provider) return false;
  return getProviderFavoriteCandidateIds(provider).some((id) => lookup.has(id));
}

function resolveTargetId(
  type: FavoriteType,
  targetId: string,
  snapshot?: FavoriteSnapshot,
): string {
  if (type === 'provider') {
    if (snapshot) {
      const provider = snapshot as ProviderPublicDto;
      return resolveProviderFavoriteTargetId({
        id: normalizeId(provider.id) || normalizeId(targetId),
        userId: provider.userId,
      });
    }
    return resolveProviderFavoriteTargetId(targetId);
  }
  if (snapshot) {
    const request = snapshot as RequestResponseDto;
    return resolveRequestFavoriteTargetId(request.id || targetId);
  }
  return resolveRequestFavoriteTargetId(targetId);
}

function assertValidTargetId(type: FavoriteType, targetId: string): string {
  if (!isValidObjectId(targetId)) {
    throw new Error(`Favorite ${type} targetId must be a valid ObjectId`);
  }
  return targetId;
}

export function listFavorites(type: 'request'): Promise<RequestResponseDto[]>;
export function listFavorites(type: 'provider'): Promise<ProviderPublicDto[]>;
export function listFavorites(type: FavoriteType) {
  return apiGet(`/favorites?type=${encodeURIComponent(type)}`);
}

export function addFavorite(
  type: 'request',
  targetId: string,
  snapshot?: RequestResponseDto,
): Promise<FavoriteResultDto>;
export function addFavorite(
  type: 'provider',
  targetId: string,
  snapshot?: ProviderPublicDto,
): Promise<FavoriteResultDto>;
export async function addFavorite(
  type: FavoriteType,
  targetId: string,
  snapshot?: FavoriteSnapshot,
) {
  const resolvedTargetId = assertValidTargetId(type, resolveTargetId(type, targetId, snapshot));
  return apiPost<{ type: FavoriteType; targetId: string }, FavoriteResultDto>('/favorites', {
    type,
    targetId: resolvedTargetId,
  });
}

export function removeFavorite(
  type: 'request',
  targetId: string,
  snapshot?: RequestResponseDto,
): Promise<FavoriteResultDto>;
export function removeFavorite(
  type: 'provider',
  targetId: string,
  snapshot?: ProviderPublicDto,
): Promise<FavoriteResultDto>;
export async function removeFavorite(
  type: FavoriteType,
  targetId: string,
  snapshot?: FavoriteSnapshot,
) {
  const resolvedTargetId = assertValidTargetId(type, resolveTargetId(type, targetId, snapshot));
  return apiDelete<FavoriteResultDto>(
    `/favorites?type=${encodeURIComponent(type)}&targetId=${encodeURIComponent(resolvedTargetId)}`,
  );
}
