import type { WorkspaceStatisticsOverviewSourceDto } from './statisticsModel.types';
import { roundRatio } from './statisticsOpportunityMath';

type CityRow = NonNullable<WorkspaceStatisticsOverviewSourceDto['demand']['cities']>[number];

export function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceKm(from: CityRow | null, to: CityRow | null): number | null {
  if (!from || !to) return null;
  if (from.lat === null || from.lng === null || to.lat === null || to.lng === null) return null;

  const earthRadiusKm = 6371;
  const latDelta = toRadians(to.lat - from.lat);
  const lngDelta = toRadians(to.lng - from.lng);
  const originLat = toRadians(from.lat);
  const destinationLat = toRadians(to.lat);

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(lngDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return roundRatio(earthRadiusKm * c);
}
