'use client';

import * as React from 'react';

type GeoRegionOptions = {
  cacheKey?: string;
  cacheTtlMs?: number;
  endpoint?: string;
  enabled?: boolean;
  timeoutMs?: number;
  failCooldownMs?: number;
};

const DEFAULT_CACHE_KEY = 'dc_geo_region';
const DEFAULT_TTL = 24 * 60 * 60 * 1000;
const DEFAULT_FAIL_COOLDOWN = 6 * 60 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 1800;
const DEFAULT_ENDPOINT = 'https://ipapi.co/json/';
const DEFAULT_ENABLED = process.env.NEXT_PUBLIC_GEOIP_ENABLE === '1';

let memoryRegion: string | null | undefined;
let inFlightRegionRequest: Promise<string | null> | null = null;

function requestGeoRegion(endpoint: string, timeoutMs: number) {
  if (inFlightRegionRequest) return inFlightRegionRequest;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  inFlightRegionRequest = fetch(endpoint, { signal: controller.signal })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data) return null;
      const city =
        data.city || data.region || data.country_name || data.country || data.org || null;
      return city && typeof city === 'string' ? city : null;
    })
    .catch((error) => {
      if (error?.name === 'AbortError') return null;
      return null;
    })
    .finally(() => {
      window.clearTimeout(timeoutId);
      inFlightRegionRequest = null;
    });

  return inFlightRegionRequest;
}

export function useGeoRegion(options: GeoRegionOptions = {}) {
  const cacheKey = options.cacheKey ?? DEFAULT_CACHE_KEY;
  const cacheTsKey = `${cacheKey}_ts`;
  const failTsKey = `${cacheKey}_fail_ts`;
  const cacheTtlMs = options.cacheTtlMs ?? DEFAULT_TTL;
  const failCooldownMs = options.failCooldownMs ?? DEFAULT_FAIL_COOLDOWN;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
  const enabled = options.enabled ?? DEFAULT_ENABLED;

  const [region, setRegion] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return;
    if (memoryRegion !== undefined) {
      setRegion(memoryRegion);
      return;
    }

    const cached = localStorage.getItem(cacheKey);
    const cachedAt = Number(localStorage.getItem(cacheTsKey) ?? 0);
    if (cached && Date.now() - cachedAt < cacheTtlMs) {
      memoryRegion = cached;
      setRegion(cached);
      return;
    }
    const failedAt = Number(localStorage.getItem(failTsKey) ?? 0);
    if (failedAt && Date.now() - failedAt < failCooldownMs) {
      memoryRegion = null;
      return;
    }

    let isMounted = true;
    void requestGeoRegion(endpoint, timeoutMs).then((city) => {
      if (!isMounted) return;
      memoryRegion = city;
      setRegion(city);
      if (city) {
        localStorage.setItem(cacheKey, city);
        localStorage.setItem(cacheTsKey, String(Date.now()));
        localStorage.removeItem(failTsKey);
      } else {
        localStorage.setItem(failTsKey, String(Date.now()));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [cacheKey, cacheTsKey, cacheTtlMs, enabled, endpoint, failCooldownMs, failTsKey, timeoutMs]);

  return region;
}
