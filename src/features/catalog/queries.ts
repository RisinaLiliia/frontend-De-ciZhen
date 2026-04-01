// src/features/catalog/queries.ts
import { useQuery } from '@tanstack/react-query';
import { qk } from '@/lib/query/keys';
import { listCities, listServiceCategories, listServices } from '@/lib/api/catalog';
import { mapCity, mapCategory, mapService } from './mappers';
import type { City, Service, ServiceCategory } from './model';

export type UseCitiesOptions = {
  enabled?: boolean;
  query?: string;
  limit?: number;
  ids?: string[];
};

function normalizeUseCitiesOptions(optionsOrEnabled?: boolean | UseCitiesOptions): Required<UseCitiesOptions> {
  if (typeof optionsOrEnabled === 'boolean') {
    return {
      enabled: optionsOrEnabled,
      query: '',
      limit: 50,
      ids: [],
    };
  }

  return {
    enabled: optionsOrEnabled?.enabled ?? true,
    query: optionsOrEnabled?.query?.trim() ?? '',
    limit: optionsOrEnabled?.limit ?? 50,
    ids: Array.from(new Set((optionsOrEnabled?.ids ?? []).map((id) => id.trim()).filter(Boolean))).sort(),
  };
}

export function useCities(countryCode: string, optionsOrEnabled?: boolean | UseCitiesOptions) {
  const options = normalizeUseCitiesOptions(optionsOrEnabled);

  return useQuery<City[]>({
    queryKey: [...qk.cities(countryCode), options.query, options.limit, options.ids],
    queryFn: async () =>
      (
        await listCities(countryCode, {
          query: options.query || undefined,
          limit: options.limit,
          ids: options.ids,
        })
      ).map(mapCity),
    staleTime: 60_000,
    enabled: options.enabled,
  });
}

export function useServiceCategories(enabled = true) {
  return useQuery<ServiceCategory[]>({
    queryKey: qk.categories(),
    queryFn: async () => (await listServiceCategories()).map(mapCategory),
    staleTime: 60_000,
    enabled,
  });
}

export function useServices(categoryKey?: string, enabled = true) {
  return useQuery<Service[]>({
    queryKey: qk.services(categoryKey),
    queryFn: async () => (await listServices(categoryKey)).map(mapService),
    staleTime: 60_000,
    enabled,
  });
}
