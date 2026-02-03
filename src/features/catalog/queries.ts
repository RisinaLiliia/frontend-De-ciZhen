// src/features/catalog/queries.ts
import { useQuery } from '@tanstack/react-query';
import { qk } from '@/lib/query/keys';
import { listCities, listServiceCategories, listServices } from '@/lib/api/catalog';
import { mapCity, mapCategory, mapService } from './mappers';
import type { City, Service, ServiceCategory } from './model';

export function useCities(countryCode: string) {
  return useQuery<City[]>({
    queryKey: qk.cities(countryCode),
    queryFn: async () => (await listCities(countryCode)).map(mapCity),
    staleTime: 60_000,
  });
}

export function useServiceCategories() {
  return useQuery<ServiceCategory[]>({
    queryKey: qk.categories(),
    queryFn: async () => (await listServiceCategories()).map(mapCategory),
    staleTime: 60_000,
  });
}

export function useServices(categoryKey?: string) {
  return useQuery<Service[]>({
    queryKey: qk.services(categoryKey),
    queryFn: async () => (await listServices(categoryKey)).map(mapService),
    staleTime: 60_000,
  });
}
