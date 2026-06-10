// src/hooks/useCatalogIndex.ts
'use client';

import * as React from 'react';

type ServiceItem = { key: string; categoryKey: string; i18n: Record<string, string> };
type CategoryItem = { key: string; i18n: Record<string, string> };
type CityItem = { id: string; i18n: Record<string, string> };

export function useCatalogIndex({
  enabled = true,
  services,
  categories,
  cities,
}: {
  enabled?: boolean;
  services: ServiceItem[];
  categories: CategoryItem[];
  cities: CityItem[];
}) {
  const serviceByKey = React.useMemo(
    () => (enabled ? new Map(services.map((service) => [service.key, service])) : new Map()),
    [enabled, services],
  );
  const categoryByKey = React.useMemo(
    () => (enabled ? new Map(categories.map((category) => [category.key, category])) : new Map()),
    [categories, enabled],
  );
  const cityById = React.useMemo(
    () => (enabled ? new Map(cities.map((city) => [city.id, city])) : new Map()),
    [cities, enabled],
  );

  return { serviceByKey, categoryByKey, cityById };
}
