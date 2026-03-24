'use client';

import * as React from 'react';

import {
  createDemandClusterIndex,
  getDemandClusterExpansionZoom,
  getDemandClusterItems,
  type DemandClusterItem,
} from './mapClustering';
import { MAP_MAX_ZOOM, MAP_MIN_ZOOM, type DemandCityActivity } from './mapHelpers';

type LeafletModule = typeof import('leaflet');

type UseWorkspacePublicDemandLeafletMapParams = {
  cities: DemandCityActivity[];
  hasCoordinates: boolean;
  formatNumber: Intl.NumberFormat;
  activeRequestsLabel: string;
  onSelectCity?: (cityId: string) => void;
};

const GERMANY_CENTER: [number, number] = [51.1657, 10.4515];
const GERMANY_BOUNDS: [[number, number], [number, number]] = [
  [46.2, 4.5],
  [56.8, 16.8],
];
const CLUSTER_MIN_CITY_POINTS = 7;

export function useWorkspacePublicDemandLeafletMap({
  cities,
  hasCoordinates,
  formatNumber,
  activeRequestsLabel,
  onSelectCity,
}: UseWorkspacePublicDemandLeafletMapParams) {
  const mapHostRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<import('leaflet').Map | null>(null);
  const markersLayerRef = React.useRef<import('leaflet').LayerGroup | null>(null);
  const leafletRef = React.useRef<LeafletModule | null>(null);
  const renderMarkersRef = React.useRef<() => void>(() => {});
  const resizeObserverRef = React.useRef<ResizeObserver | null>(null);
  const invalidateFrameRef = React.useRef<number | null>(null);
  const clusterIndex = React.useMemo(() => createDemandClusterIndex(cities), [cities]);

  renderMarkersRef.current = () => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();
    if (!hasCoordinates) return;

    const bounds = map.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];
    const shouldCluster = cities.length >= CLUSTER_MIN_CITY_POINTS;
    const items: DemandClusterItem[] = shouldCluster
      ? getDemandClusterItems(clusterIndex, bbox, map.getZoom())
      : cities
          .map((city) => ({
            kind: 'city' as const,
            id: city.id,
            cityId: city.id,
            name: city.name,
            lat: city.lat,
            lng: city.lng,
            count: city.count,
          }))
          .sort((a, b) => b.count - a.count);
    const maxCount = items[0]?.count ?? 1;

    items.forEach((item, index) => {
      if (item.kind === 'cluster') {
        const clusterSize = Math.round(24 + (item.count / Math.max(1, maxCount)) * 16);
        const clusterLabel = formatNumber.format(item.count);
        const clusterIcon = L.divIcon({
          className: 'workspace-demand-cluster-marker-icon',
          iconSize: [clusterSize, clusterSize],
          iconAnchor: [clusterSize / 2, clusterSize / 2],
          tooltipAnchor: [0, -(clusterSize / 2 + 4)],
          html: `<span class="workspace-demand-cluster-marker" style="--cluster-size:${clusterSize}px"><span class="workspace-demand-cluster-marker__value">${clusterLabel}</span></span>`,
        });

        const marker = L.marker([item.lat, item.lng], {
          icon: clusterIcon,
          keyboard: true,
          title: `${clusterLabel} ${activeRequestsLabel}`,
        });
        marker.bindTooltip(createTooltipNode(`${clusterLabel} ${activeRequestsLabel}`), {
          direction: 'top',
          opacity: 0.96,
          className: 'workspace-demand-map-tooltip',
        });
        marker.on('click', () => {
          const expandedZoom = getDemandClusterExpansionZoom(clusterIndex, item.clusterId, MAP_MAX_ZOOM);
          map.setView([item.lat, item.lng], expandedZoom, { animate: true });
        });
        marker.addTo(layer);
        return;
      }

      renderCityMarker({
        L,
        layer,
        item,
        index,
        maxCount,
        formatNumber,
        activeRequestsLabel,
        onSelectCity,
      });
    });
  };

  React.useEffect(() => {
    let isCancelled = false;
    let destroy: (() => void) | null = null;

    (async () => {
      if (!mapHostRef.current || mapRef.current) return;
      const L = await import('leaflet');
      if (isCancelled || !mapHostRef.current || mapRef.current) return;

      const map = L.map(mapHostRef.current, {
        zoomControl: true,
        attributionControl: false,
        minZoom: MAP_MIN_ZOOM,
        maxZoom: MAP_MAX_ZOOM,
        preferCanvas: true,
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
      });

      map.setView(GERMANY_CENTER, 6);
      map.fitBounds(GERMANY_BOUNDS, { padding: [12, 12] });
      map.setMaxBounds(GERMANY_BOUNDS);
      const attribution = L.control.attribution({
        position: 'topright',
        prefix: false,
      });
      attribution.addTo(map);
      attribution.addAttribution('&copy; OpenStreetMap contributors');

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      const handleViewportEnd = () => {
        renderMarkersRef.current();
      };
      map.on('zoomend', handleViewportEnd);
      map.on('moveend', handleViewportEnd);

      leafletRef.current = L;
      mapRef.current = map;
      markersLayerRef.current = markersLayer;
      renderMarkersRef.current();

      const invalidateSize = () => {
        if (invalidateFrameRef.current !== null) {
          cancelAnimationFrame(invalidateFrameRef.current);
        }
        invalidateFrameRef.current = requestAnimationFrame(() => {
          invalidateFrameRef.current = null;
          if (!mapRef.current) return;
          mapRef.current.invalidateSize({ pan: false, debounceMoveend: true });
        });
      };

      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => {
          invalidateSize();
        });
        observer.observe(mapHostRef.current);
        resizeObserverRef.current = observer;
      }

      invalidateSize();

      destroy = () => {
        resizeObserverRef.current?.disconnect();
        resizeObserverRef.current = null;
        if (invalidateFrameRef.current !== null) {
          cancelAnimationFrame(invalidateFrameRef.current);
          invalidateFrameRef.current = null;
        }
        map.off('zoomend', handleViewportEnd);
        map.off('moveend', handleViewportEnd);
        map.stop();
        markersLayer.clearLayers();
        map.remove();
        markersLayerRef.current = null;
        mapRef.current = null;
        leafletRef.current = null;
      };
    })();

    return () => {
      isCancelled = true;
      destroy?.();
    };
  }, []);

  React.useEffect(() => {
    renderMarkersRef.current();
  }, [activeRequestsLabel, clusterIndex, formatNumber, hasCoordinates, onSelectCity]);

  return {
    mapHostRef,
  };
}

function renderCityMarker({
  L,
  layer,
  item,
  index,
  maxCount,
  formatNumber,
  activeRequestsLabel,
  onSelectCity,
}: {
  L: LeafletModule;
  layer: import('leaflet').LayerGroup;
  item: Extract<DemandClusterItem, { kind: 'city' }>;
  index: number;
  maxCount: number;
  formatNumber: Intl.NumberFormat;
  activeRequestsLabel: string;
  onSelectCity?: (cityId: string) => void;
}) {
  const intensity = item.count / Math.max(1, maxCount);
  const dotSize = Math.round(10 + intensity * 12);
  const pulseSize = dotSize + 16;
  const icon = L.divIcon({
    className: 'workspace-demand-marker-icon',
    iconSize: [pulseSize, pulseSize],
    iconAnchor: [pulseSize / 2, pulseSize / 2],
    tooltipAnchor: [0, -(pulseSize / 2 + 4)],
    html: `<span class="workspace-demand-marker" style="--dot-size:${dotSize}px;--pulse-size:${pulseSize}px;--pulse-delay:${(index % 8) * 110}ms"><span class="workspace-demand-marker__pulse"></span><span class="workspace-demand-marker__dot"></span></span>`,
  });

  const marker = L.marker([item.lat, item.lng], {
    icon,
    keyboard: true,
    title: item.name,
  });

  marker.bindTooltip(createTooltipNode(`${item.name}: ${formatNumber.format(item.count)} ${activeRequestsLabel}`), {
    direction: 'top',
    opacity: 0.96,
    className: 'workspace-demand-map-tooltip',
  });

  marker.on('click', () => {
    if (onSelectCity) {
      onSelectCity(item.cityId);
      return;
    }
    marker.openTooltip();
  });
  marker.addTo(layer);
}

function createTooltipNode(text: string): HTMLSpanElement {
  const node = document.createElement('span');
  node.textContent = text;
  return node;
}
