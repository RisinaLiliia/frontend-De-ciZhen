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

export function getMyProviderProfile() {
  return apiGet<ProviderProfileDto>('/providers/me/profile');
}

export function updateMyProviderProfile(payload: UpdateMyProviderProfileDto) {
  return apiPatch<UpdateMyProviderProfileDto, ProviderProfileDto>(
    '/providers/me/profile',
    payload,
  );
}
