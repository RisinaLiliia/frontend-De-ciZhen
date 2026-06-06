import Supercluster from 'supercluster';

import { MAP_MAX_ZOOM, MAP_MIN_ZOOM, type DemandCityActivity } from './mapHelpers';

export type DemandClusterPointProps = {
  cityId: string;
  name: string;
  count: number;
  lat: number;
  lng: number;
};

export type DemandClusterItem =
  | {
      kind: 'cluster';
      clusterId: number;
      id: string;
      lat: number;
      lng: number;
      count: number;
      abbreviatedCount: string | number;
    }
  | {
      kind: 'city';
      id: string;
      cityId: string;
      name: string;
      lat: number;
      lng: number;
      count: number;
    };

export type DemandClusterIndex = Supercluster<DemandClusterPointProps, Supercluster.AnyProps>;

type DemandClusterOptions = Pick<Supercluster.Options<DemandClusterPointProps, Supercluster.AnyProps>, 'radius' | 'maxZoom' | 'minPoints'>;

const DEFAULT_CLUSTER_OPTIONS: DemandClusterOptions = {
  radius: 58,
  maxZoom: MAP_MAX_ZOOM - 1,
  minPoints: 2,
};

export function createDemandClusterIndex(
  cities: DemandCityActivity[],
  options: Partial<DemandClusterOptions> = {},
): DemandClusterIndex {
  const clusterIndex = new Supercluster<DemandClusterPointProps, Supercluster.AnyProps>({
    ...DEFAULT_CLUSTER_OPTIONS,
    ...options,
  });

  const features: Array<Supercluster.PointFeature<DemandClusterPointProps>> = cities.map((city) => ({
    type: 'Feature',
    properties: {
      cityId: city.id,
      name: city.name,
      count: city.count,
      lat: city.lat,
      lng: city.lng,
    },
    geometry: {
      type: 'Point',
      coordinates: [city.lng, city.lat],
    },
  }));

  clusterIndex.load(features);
  return clusterIndex;
}

function clampZoom(zoom: number): number {
  return Math.max(MAP_MIN_ZOOM, Math.min(MAP_MAX_ZOOM, Math.round(zoom)));
}

function isClusterFeature(
  feature: Supercluster.ClusterFeature<Supercluster.AnyProps> | Supercluster.PointFeature<DemandClusterPointProps>,
): feature is Supercluster.ClusterFeature<Supercluster.AnyProps> {
  return 'cluster' in feature.properties && feature.properties.cluster === true;
}

export function getDemandClusterItems(
  clusterIndex: DemandClusterIndex,
  bbox: [number, number, number, number],
  zoom: number,
): DemandClusterItem[] {
  const safeZoom = clampZoom(zoom);
  const features = clusterIndex.getClusters(bbox, safeZoom);

  return features
    .map((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      if (isClusterFeature(feature)) {
        return {
          kind: 'cluster' as const,
          clusterId: feature.properties.cluster_id,
          id: `cluster-${feature.properties.cluster_id}`,
          lat,
          lng,
          count: feature.properties.point_count,
          abbreviatedCount: feature.properties.point_count_abbreviated,
        };
      }

      return {
        kind: 'city' as const,
        id: feature.properties.cityId,
        cityId: feature.properties.cityId,
        name: feature.properties.name,
        lat,
        lng,
        count: feature.properties.count,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export function getDemandClusterExpansionZoom(
  clusterIndex: DemandClusterIndex,
  clusterId: number,
  maxZoom: number = MAP_MAX_ZOOM,
): number {
  return Math.min(maxZoom, clusterIndex.getClusterExpansionZoom(clusterId));
}
