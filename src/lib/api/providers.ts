// src/lib/api/providers.ts
import { apiGet, apiPatch } from '@/lib/api/http';
import type {
  ProviderProfileDto,
  ProviderPublicDto,
  UpdateMyProviderProfileDto,
} from '@/lib/api/dto/providers';

export function listPublicProviders(params?: { cityId?: string; serviceKey?: string }) {
  const qs = new URLSearchParams();
  if (params?.cityId) qs.set('cityId', params.cityId);
  if (params?.serviceKey) qs.set('serviceKey', params.serviceKey);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<ProviderPublicDto[]>(`/providers${suffix}`);
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
