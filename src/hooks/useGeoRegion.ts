'use client';

import * as React from 'react';

type GeoRegionOptions = {
  cacheKey?: string;
  cacheTtlMs?: number;
  endpoint?: string;
};

const DEFAULT_CACHE_KEY = 'dc_geo_region';
const DEFAULT_TTL = 24 * 60 * 60 * 1000;
const DEFAULT_ENDPOINT = 'https://ipapi.co/json/';

export function useGeoRegion(options: GeoRegionOptions = {}) {
  const cacheKey = options.cacheKey ?? DEFAULT_CACHE_KEY;
  const cacheTsKey = `${cacheKey}_ts`;
  const cacheTtlMs = options.cacheTtlMs ?? DEFAULT_TTL;
  const endpoint = options.endpoint ?? DEFAULT_ENDPOINT;

  const [region, setRegion] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const cached = localStorage.getItem(cacheKey);
    const cachedAt = Number(localStorage.getItem(cacheTsKey) ?? 0);
    if (cached && Date.now() - cachedAt < cacheTtlMs) {
      setRegion(cached);
      return;
    }

    const controller = new AbortController();

    fetch(endpoint, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const city =
          data.city || data.region || data.country_name || data.country || data.org || null;
        if (!city) return;
        setRegion(city);
        localStorage.setItem(cacheKey, city);
        localStorage.setItem(cacheTsKey, String(Date.now()));
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return;
      });

    return () => controller.abort();
  }, [cacheKey, cacheTsKey, cacheTtlMs, endpoint]);

  return region;
}
