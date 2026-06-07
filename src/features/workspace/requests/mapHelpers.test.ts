import { describe, expect, it } from 'vitest';

import {
  normalizeCityActivity,
  normalizeCityToken,
  sortCitiesByActivity,
  type DemandCityActivity,
} from './mapHelpers';

describe('mapHelpers', () => {
  it('normalizes city tokens for fallback coordinate lookup', () => {
    expect(normalizeCityToken('München')).toBe('munchen');
    expect(normalizeCityToken('  Düsseldorf  ')).toBe('dusseldorf');
    expect(normalizeCityToken('Karlsruhe/BW')).toBe('karlsruhebw');
  });

  it('normalizes and sorts city activity, skipping invalid points', () => {
    const result = normalizeCityActivity([
      {
        citySlug: 'berlin',
        cityName: 'Berlin',
        cityId: 'berlin-id',
        requestCount: 3,
        lat: null,
        lng: null,
      },
      {
        citySlug: '',
        cityName: 'Mannheim',
        cityId: null,
        requestCount: 5,
        lat: 49.4875,
        lng: 8.466,
      },
      {
        citySlug: 'no-coords',
        cityName: 'No Coords',
        cityId: null,
        requestCount: 4,
        lat: null,
        lng: null,
      },
      {
        citySlug: 'zero',
        cityName: 'Zero',
        cityId: null,
        requestCount: 0,
        lat: 50,
        lng: 9,
      },
    ]);

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.name)).toEqual(['Mannheim', 'Berlin']);
    expect(result[1]).toMatchObject({
      name: 'Berlin',
      count: 3,
      lat: 52.52,
      lng: 13.405,
    });
  });

  it('falls back to cityName coordinates when citySlug token is not mapped', () => {
    const result = normalizeCityActivity([
      {
        citySlug: 'de-berlin-10115',
        cityName: 'Berlin',
        cityId: 'berlin-id',
        requestCount: 2,
        lat: null,
        lng: null,
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'Berlin',
      lat: 52.52,
      lng: 13.405,
      count: 2,
    });
  });

  it('parses string coordinates and string request counts from backend payload', () => {
    const result = normalizeCityActivity([
      {
        citySlug: 'berlin',
        cityName: 'Berlin',
        cityId: 'berlin-id',
        requestCount: '3' as unknown as number,
        lat: '52.52' as unknown as number,
        lng: '13.405' as unknown as number,
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'Berlin',
      count: 3,
      lat: 52.52,
      lng: 13.405,
    });
  });

  it('supports alternate backend field names for geo/count payloads', () => {
    const result = normalizeCityActivity([
      {
        citySlug: '' as unknown as string,
        cityName: '' as unknown as string,
        cityId: null as unknown as string | null,
        requestCount: undefined as unknown as number,
        lat: null as unknown as number,
        lng: null as unknown as number,
        city: 'Karlsruhe',
        id: 'city-karlsruhe',
        activeRequests: 4,
        location: {
          lat: 49.0069,
          lon: 8.4037,
        },
      } as unknown as import('@/lib/api/dto/workspace').WorkspacePublicCityActivityItemDto,
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'city-karlsruhe-0',
      name: 'Karlsruhe',
      count: 4,
      lat: 49.0069,
      lng: 8.4037,
    });
  });

  it('treats empty string coordinates as missing and uses city fallback coords', () => {
    const result = normalizeCityActivity([
      {
        citySlug: 'berlin',
        cityName: 'Berlin',
        cityId: 'berlin-empty-coords',
        requestCount: 2,
        lat: '' as unknown as number,
        lng: '' as unknown as number,
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      lat: 52.52,
      lng: 13.405,
    });
  });

  it('treats 0,0 coordinates as missing and uses city fallback coords', () => {
    const result = normalizeCityActivity([
      {
        citySlug: 'mannheim',
        cityName: 'Mannheim',
        cityId: 'mannheim-zero',
        requestCount: 5,
        lat: 0,
        lng: 0,
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'Mannheim',
      lat: 49.4875,
      lng: 8.466,
      count: 5,
    });
  });

  it('sorts cities by descending activity', () => {
    const cities: DemandCityActivity[] = [
      { id: '1', name: 'A', count: 2, lat: 0, lng: 0 },
      { id: '2', name: 'B', count: 7, lat: 0, lng: 0 },
      { id: '3', name: 'C', count: 4, lat: 0, lng: 0 },
    ];

    expect(sortCitiesByActivity(cities).map((city) => city.id)).toEqual(['2', '3', '1']);
  });

});
