'use client';

import type { ChartPoint, PayloadViewModel, TabPayload } from '@/components/requests/requestsStatsPanel.types';

export const FALLBACK_POINTS: ChartPoint[] = [
  { label: 'Nov', bars: 0, line: 0 },
  { label: 'Dez', bars: 0, line: 0 },
  { label: 'Jan', bars: 0, line: 0 },
  { label: 'Feb', bars: 0, line: 0 },
  { label: 'Mrz', bars: 0, line: 0 },
  { label: 'Apr', bars: 0, line: 0 },
];

export function toPayloadViewModel(payload: TabPayload): PayloadViewModel {
  return {
    payload,
    hasData: payload.hasData ?? payload.kpis.some((item) => item.value !== '0' && item.value !== '—'),
    chartPoints: payload.chartPoints.length > 0 ? payload.chartPoints : FALLBACK_POINTS,
  };
}

export function clampStatsProgressValue(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function buildMiniChartPath(points: ChartPoint[]) {
  const maxLine = Math.max(1, ...points.map((point) => point.line));
  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 100 - (point.line / maxLine) * 100;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}
