// src/hooks/useCatalogIndex.ts
'use client';

import * as React from 'react';

type ServiceItem = { key: string; categoryKey: string; i18n: Record<string, string> };
type CategoryItem = { key: string; i18n: Record<string, string> };
type CityItem = { id: string; i18n: Record<string, string> };

export function useCatalogIndex({
  services,
  categories,
  cities,
}: {
  services: ServiceItem[];
  categories: CategoryItem[];
  cities: CityItem[];
}) {
  const serviceByKey = React.useMemo(
    () => new Map(services.map((service) => [service.key, service])),
    [services],
  );
  const categoryByKey = React.useMemo(
    () => new Map(categories.map((category) => [category.key, category])),
    [categories],
  );
  const cityById = React.useMemo(() => new Map(cities.map((city) => [city.id, city])), [cities]);

  return { serviceByKey, categoryByKey, cityById };
}
