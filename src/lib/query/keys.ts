// src/lib/query/keys.ts
export const qk = {
  cities: (countryCode: string) => ['catalog', 'cities', countryCode] as const,
  categories: () => ['catalog', 'service-categories'] as const,
  services: (categoryKey?: string) => ['catalog', 'services', categoryKey ?? 'all'] as const,
};
