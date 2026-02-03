// src/lib/api/catalog.ts
import { apiGet } from './http';
import type { CityResponseDto, ServiceCategoryDto, ServiceDto } from './dto/catalog';

export function listCities(countryCode: string) {
  return apiGet<CityResponseDto[]>(
    `/catalog/cities?countryCode=${encodeURIComponent(countryCode)}`,
  );
}

export function listServiceCategories() {
  return apiGet<ServiceCategoryDto[]>(`/catalog/service-categories`);
}

export function listServices(categoryKey?: string) {
  const qs = categoryKey ? `?category=${encodeURIComponent(categoryKey)}` : '';
  return apiGet<ServiceDto[]>(`/catalog/services${qs}`);
}
