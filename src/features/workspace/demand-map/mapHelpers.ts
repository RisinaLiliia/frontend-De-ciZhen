import type { WorkspacePublicCityActivityItemDto } from '@/lib/api/dto/workspace';

export type DemandCityActivity = {
  id: string;
  name: string;
  count: number;
  lat: number;
  lng: number;
};

export const MAP_MIN_ZOOM = 5;
export const MAP_MAX_ZOOM = 12;

type LooseCityActivityLocation = {
  lat?: unknown;
  lng?: unknown;
  lon?: unknown;
};

type LooseCityActivityItem = Partial<WorkspacePublicCityActivityItemDto> & {
  slug?: unknown;
  name?: unknown;
  city?: unknown;
  cityLabel?: unknown;
  id?: unknown;
  latitude?: unknown;
  lon?: unknown;
  longitude?: unknown;
  location?: LooseCityActivityLocation | null;
  activeRequests?: unknown;
  requests?: unknown;
  count?: unknown;
  total?: unknown;
};

const CITY_COORDINATE_FALLBACK: Record<string, { lat: number; lng: number }> = {
  hamburg: { lat: 53.5511, lng: 9.9937 },
  berlin: { lat: 52.52, lng: 13.405 },
  bremen: { lat: 53.0793, lng: 8.8017 },
  hannover: { lat: 52.3759, lng: 9.732 },
  dortmund: { lat: 51.5136, lng: 7.4653 },
  duisburg: { lat: 51.4344, lng: 6.7623 },
  essen: { lat: 51.4556, lng: 7.0116 },
  dusseldorf: { lat: 51.2277, lng: 6.7735 },
  koln: { lat: 50.9375, lng: 6.9603 },
  bonn: { lat: 50.7374, lng: 7.0982 },
  mannheim: { lat: 49.4875, lng: 8.466 },
  heidelberg: { lat: 49.3988, lng: 8.6724 },
  karlsruhe: { lat: 49.0069, lng: 8.4037 },
  ludwigshafen: { lat: 49.4774, lng: 8.4452 },
  darmstadt: { lat: 49.8728, lng: 8.6512 },
  frankfurt: { lat: 50.1109, lng: 8.6821 },
  wiesbaden: { lat: 50.0782, lng: 8.2398 },
  mainz: { lat: 49.9929, lng: 8.2473 },
  stuttgart: { lat: 48.7758, lng: 9.1829 },
  nurnberg: { lat: 49.4521, lng: 11.0767 },
  leipzig: { lat: 51.3397, lng: 12.3731 },
  dresden: { lat: 51.0504, lng: 13.7373 },
  augsburg: { lat: 48.3705, lng: 10.8978 },
  munchen: { lat: 48.1351, lng: 11.582 },
};

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function pickFirstNonEmptyString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return '';
}

function readLocation(value: unknown): LooseCityActivityLocation | null {
  if (!value || typeof value !== 'object') return null;
  return value as LooseCityActivityLocation;
}

function toFiniteCoord(value: unknown, min: number, max: number): number | null {
  const num = toFiniteNumber(value);
  if (num === null) return null;
  if (num < min || num > max) return null;
  return num;
}

function isZeroCoordinatePair(lat: number | null, lng: number | null): boolean {
  return lat === 0 && lng === 0;
}

export function normalizeCityToken(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function sortCitiesByActivity(cities: DemandCityActivity[]): DemandCityActivity[] {
  return [...cities].sort((a, b) => b.count - a.count);
}

export function normalizeCityActivity(items: WorkspacePublicCityActivityItemDto[]): DemandCityActivity[] {
  const normalized = items
    .map((entry, index) => {
      const rawEntry = entry as LooseCityActivityItem;
      const location = readLocation(rawEntry.location);
      const rawCitySlug = pickFirstNonEmptyString(rawEntry.citySlug, rawEntry.slug);
      const rawCityName = pickFirstNonEmptyString(rawEntry.cityName, rawEntry.name, rawEntry.city, rawEntry.cityLabel);
      const citySlugToken = normalizeCityToken(rawCitySlug);
      const cityNameToken = normalizeCityToken(rawCityName);
      const fallbackCoords =
        (citySlugToken ? CITY_COORDINATE_FALLBACK[citySlugToken] : undefined) ??
        (cityNameToken ? CITY_COORDINATE_FALLBACK[cityNameToken] : undefined);
      const latRaw =
        toFiniteCoord(rawEntry.lat ?? rawEntry.latitude, -90, 90) ??
        toFiniteCoord(location?.lat, -90, 90);
      const lngRaw =
        toFiniteCoord(rawEntry.lng ?? rawEntry.lon ?? rawEntry.longitude, -180, 180) ??
        toFiniteCoord(location?.lng, -180, 180) ??
        toFiniteCoord(location?.lon, -180, 180);
      const shouldUseFallbackCoords = isZeroCoordinatePair(latRaw, lngRaw);
      const lat = (shouldUseFallbackCoords ? null : latRaw) ?? fallbackCoords?.lat ?? null;
      const lng = (shouldUseFallbackCoords ? null : lngRaw) ?? fallbackCoords?.lng ?? null;
      if (lat === null || lng === null) return null;

      const rawCount =
        toFiniteNumber(rawEntry.requestCount) ??
        toFiniteNumber(rawEntry.activeRequests) ??
        toFiniteNumber(rawEntry.requests) ??
        toFiniteNumber(rawEntry.count) ??
        toFiniteNumber(rawEntry.total) ??
        0;
      const count = Math.max(0, Math.round(rawCount));
      if (count <= 0) return null;

      const fallbackName = rawCityName || rawCitySlug || `City ${index + 1}`;
      const rawKey = rawEntry.cityId ?? rawEntry.id ?? rawCitySlug;
      const keyBase = String(rawKey || fallbackName).trim();
      return {
        id: `${keyBase}-${index}`,
        name: fallbackName,
        count,
        lat,
        lng,
      };
    })
    .filter((city): city is DemandCityActivity => city !== null);

  return sortCitiesByActivity(normalized);
}
