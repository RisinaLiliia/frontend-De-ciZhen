// src/lib/api/catalog.ts
import { apiGet } from './http';
import type { CityResponseDto, ServiceCategoryDto, ServiceDto } from './dto/catalog';

export type ListCitiesParams = {
  query?: string;
  limit?: number;
  ids?: string[];
};

export function listCities(countryCode: string, params?: ListCitiesParams) {
  const qs = new URLSearchParams();
  qs.set('countryCode', countryCode);

  const normalizedQuery = params?.query?.trim();
  if (normalizedQuery) {
    qs.set('q', normalizedQuery);
  }

  if (typeof params?.limit === 'number' && Number.isFinite(params.limit)) {
    qs.set('limit', String(Math.max(1, Math.round(params.limit))));
  }

  const ids = Array.from(new Set((params?.ids ?? []).map((id) => id.trim()).filter(Boolean))).sort();
  if (ids.length > 0) {
    qs.set('ids', ids.join(','));
  }

  return apiGet<CityResponseDto[]>(`/catalog/cities?${qs.toString()}`);
}

export function listServiceCategories() {
  return apiGet<ServiceCategoryDto[]>(`/catalog/service-categories`);
}

export function listServices(categoryKey?: string) {
  const qs = categoryKey ? `?category=${encodeURIComponent(categoryKey)}` : '';
  return apiGet<ServiceDto[]>(`/catalog/services${qs}`);
}
