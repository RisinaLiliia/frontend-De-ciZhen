import { describe, expect, it } from 'vitest';

import type { DemandCityActivity } from './mapHelpers';
import {
  createDemandClusterIndex,
  getDemandClusterExpansionZoom,
  getDemandClusterItems,
} from './mapClustering';

const WORLD_BBOX: [number, number, number, number] = [-180, -90, 180, 90];

function buildNearbyCities(): DemandCityActivity[] {
  return [
    { id: 'a', name: 'A', count: 5, lat: 49.4875, lng: 8.466 },
    { id: 'b', name: 'B', count: 3, lat: 49.488, lng: 8.4666 },
    { id: 'c', name: 'C', count: 2, lat: 49.4886, lng: 8.4672 },
  ];
}

describe('mapClustering', () => {
  it('returns cluster item on low zoom for nearby points', () => {
    const index = createDemandClusterIndex(buildNearbyCities(), {
      radius: 80,
      maxZoom: 11,
      minPoints: 2,
    });

    const items = getDemandClusterItems(index, WORLD_BBOX, 6);
    const cluster = items.find((item) => item.kind === 'cluster');

    expect(cluster).toBeTruthy();
    expect(cluster && cluster.count).toBe(3);
  });

  it('returns city points on high zoom after cluster expansion threshold', () => {
    const index = createDemandClusterIndex(buildNearbyCities(), {
      radius: 80,
      maxZoom: 11,
      minPoints: 2,
    });

    const items = getDemandClusterItems(index, WORLD_BBOX, 12);
    const pointItems = items.filter((item) => item.kind === 'city');

    expect(pointItems).toHaveLength(3);
    expect(pointItems.map((item) => item.id).sort()).toEqual(['a', 'b', 'c']);
  });

  it('calculates safe expansion zoom for cluster', () => {
    const index = createDemandClusterIndex(buildNearbyCities(), {
      radius: 80,
      maxZoom: 11,
      minPoints: 2,
    });
    const items = getDemandClusterItems(index, WORLD_BBOX, 6);
    const cluster = items.find((item) => item.kind === 'cluster');
    expect(cluster && cluster.kind).toBe('cluster');
    if (!cluster || cluster.kind !== 'cluster') return;

    const expansionZoom = getDemandClusterExpansionZoom(index, cluster.clusterId, 12);
    expect(expansionZoom).toBeGreaterThanOrEqual(6);
    expect(expansionZoom).toBeLessThanOrEqual(12);
  });
});
