// src/lib/api/providers.ts
import { apiGet, apiPatch } from '@/lib/api/http';
import type {
  ProviderProfileDto,
  ProviderPublicDto,
  UpdateMyProviderProfileDto,
} from '@/lib/api/dto/providers';
import { listMockPublicProviders } from '@/lib/api/providers-mock';

type ProvidersMockMode = 'off' | 'only' | 'merge';

function readMockMode(): ProvidersMockMode {
  const explicit = (process.env.NEXT_PUBLIC_PROVIDERS_MOCK_MODE ?? process.env.NEXT_PUBLIC_REQUESTS_MOCK_MODE ?? '').toLowerCase();
  if (explicit === 'off' || explicit === 'only' || explicit === 'merge') return explicit;
  return process.env.NEXT_PUBLIC_PROVIDERS_MOCK_ENABLED === 'true' || process.env.NEXT_PUBLIC_REQUESTS_MOCK_ENABLED === 'true'
    ? 'only'
    : 'off';
}

async function listPublicProvidersFromApi(params?: { cityId?: string; serviceKey?: string }) {
  const qs = new URLSearchParams();
  if (params?.cityId) qs.set('cityId', params.cityId);
  if (params?.serviceKey) qs.set('serviceKey', params.serviceKey);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<ProviderPublicDto[]>(`/providers${suffix}`);
}

async function getPublicProviderByIdFromApi(id: string) {
  return apiGet<ProviderPublicDto>(`/providers/${encodeURIComponent(id)}`);
}

export async function listPublicProviders(params?: { cityId?: string; serviceKey?: string }) {
  const mode = readMockMode();
  if (mode === 'only') {
    return listMockPublicProviders(params);
  }
  if (mode === 'off') {
    return listPublicProvidersFromApi(params);
  }

  const [real, mock] = await Promise.all([
    listPublicProvidersFromApi(params),
    listMockPublicProviders(params),
  ]);

  const mergedById = new Map<string, ProviderPublicDto>();
  for (const item of real) mergedById.set(item.id, item);
  for (const item of mock) {
    if (!mergedById.has(item.id)) mergedById.set(item.id, item);
  }
  return Array.from(mergedById.values());
}

export async function getPublicProviderById(id: string) {
  const mode = readMockMode();
  const targetId = String(id ?? '').trim();
  if (!targetId) throw new Error('provider id is required');

  if (mode === 'only') {
    const list = await listMockPublicProviders();
    const found = list.find((item) => item.id === targetId || item.userId === targetId);
    if (!found) throw new Error('Provider not found');
    return found;
  }

  if (mode === 'off') {
    return getPublicProviderByIdFromApi(targetId);
  }

  try {
    return await getPublicProviderByIdFromApi(targetId);
  } catch {
    const list = await listMockPublicProviders();
    const found = list.find((item) => item.id === targetId || item.userId === targetId);
    if (!found) throw new Error('Provider not found');
    return found;
  }
}

export function getMyProviderProfile() {
  return apiGet<ProviderProfileDto>('/providers/me/profile');
}

export function updateMyProviderProfile(payload: UpdateMyProviderProfileDto) {
  return apiPatch<UpdateMyProviderProfileDto, ProviderProfileDto>(
    '/providers/me/profile',
    payload,
  );
}
