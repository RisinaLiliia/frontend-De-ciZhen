'use client';

import * as React from 'react';
import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';

type ActivityTrendPoint = {
  timestamp: string;
  label: string;
  requests: number;
  offers: number;
  clientActivity?: number | null;
  providerActivity?: number | null;
};

type ActivityTrendAxisLabel = {
  index: number;
  label: string;
};

type ActivityTrendSeries = {
  key: 'requests' | 'offers' | 'client-activity' | 'provider-activity';
  label: string;
  value: number;
  path: string | null;
  points: number[];
};

export function ActivityTrendChart({
  points,
  range,
  locale,
  requestsLabel,
  offersLabel,
  clientActivityLabel,
  providerActivityLabel,
  emptyLabel,
}: {
  points: ActivityTrendPoint[];
  range: WorkspaceStatisticsRange;
  locale: Locale;
  requestsLabel: string;
  offersLabel: string;
  clientActivityLabel: string;
  providerActivityLabel: string;
  emptyLabel: string;
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  React.useEffect(() => {
    setActiveIndex(Math.max(0, points.length - 1));
  }, [points]);

  if (points.length === 0) {
    return <p className="workspace-statistics__empty">{emptyLabel}</p>;
  }

  const width = 100;
  const height = 100;
  const plot = {
    left: 8,
    right: 98,
    top: 8,
    bottom: 76,
  };
  const plotWidth = plot.right - plot.left;
  const yMax = 100;
  const yTicks = Array.from({ length: 11 }, (_, index) => index * 10);
  const step = plotWidth / Math.max(points.length - 1, 1);
  const xAxisLabels = buildActivityAxisLabels(points, range, locale);
  const markerIndexes = new Set(
    range === '24h' || range === '7d'
      ? points.map((_, index) => index)
      : xAxisLabels.map((item) => item.index),
  );

  const toY = (value: number) => {
    const clampedValue = Math.min(yMax, Math.max(0, value));
    return plot.bottom - (clampedValue / yMax) * (plot.bottom - plot.top);
  };

  const toX = (index: number) => plot.left + index * step;
  const buildPath = (values: number[]) => values
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${toX(index)} ${toY(value)}`)
    .join(' ');
  const buildAreaPath = (values: number[]) => {
    const linePath = buildPath(values);
    return `${linePath} L ${toX(values.length - 1)} ${plot.bottom} L ${toX(0)} ${plot.bottom} Z`;
  };
  const requestsValues = points.map((point) => point.requests);
  const offersValues = points.map((point) => point.offers);
  const hasClientActivity = points.some((point) => typeof point.clientActivity === 'number' && point.clientActivity > 0);
  const hasProviderActivity = points.some(
    (point) => typeof point.providerActivity === 'number' && point.providerActivity > 0,
  );
  const clientActivityValues = points.map((point) => point.clientActivity ?? 0);
  const providerActivityValues = points.map((point) => point.providerActivity ?? 0);
  const allSeries: ActivityTrendSeries[] = [
    {
      key: 'requests',
      label: requestsLabel,
      value: requestsValues.reduce((sum, value) => sum + value, 0),
      path: buildPath(requestsValues),
      points: requestsValues,
    },
    {
      key: 'offers',
      label: offersLabel,
      value: offersValues.reduce((sum, value) => sum + value, 0),
      path: buildPath(offersValues),
      points: offersValues,
    },
    {
      key: 'client-activity',
      label: clientActivityLabel,
      value: clientActivityValues.reduce((sum, value) => sum + value, 0),
      path: hasClientActivity ? buildPath(clientActivityValues) : null,
      points: clientActivityValues,
    },
    {
      key: 'provider-activity',
      label: providerActivityLabel,
      value: providerActivityValues.reduce((sum, value) => sum + value, 0),
      path: hasProviderActivity ? buildPath(providerActivityValues) : null,
      points: providerActivityValues,
    },
  ];
  const series = allSeries.filter((item) => item.path !== null);

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const progress = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const index = Math.round(progress * Math.max(points.length - 1, 0));
    setActiveIndex(index);
  };

  return (
    <div className="home-activity__content workspace-statistics-chart">
      <div className="home-activity__chart">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="home-activity__svg"
          role="img"
          aria-label={`${requestsLabel} / ${offersLabel}`}
          onPointerMove={handlePointerMove}
        >
          {yTicks.map((tick) => {
            const y = toY(tick);
            return (
              <g key={`tick-${tick}`}>
                <line
                  x1={plot.left}
                  y1={y}
                  x2={plot.right}
                  y2={y}
                  className={tick % 20 === 0 ? 'home-activity__grid-line is-major' : 'home-activity__grid-line'}
                />
                <text x="0" y={y + 0.7} className="home-activity__axis-label">
                  {tick}
                </text>
              </g>
            );
          })}
          {points.map((point, index) => (
            <line
              key={`x-tick-${point.timestamp}-${index}`}
              x1={toX(index)}
              y1={plot.bottom}
              x2={toX(index)}
              y2={plot.bottom + (markerIndexes.has(index) ? 3.4 : 2)}
              className={markerIndexes.has(index) ? 'home-activity__x-tick is-major' : 'home-activity__x-tick'}
            />
          ))}
          <line x1={plot.left} y1={plot.bottom} x2={plot.right} y2={plot.bottom} className="home-activity__axis" />
          <path d={buildAreaPath(requestsValues)} className="home-activity__area is-requests" />
          {series.map((item) => (
            <path key={item.key} d={item.path ?? ''} className={`home-activity__line is-${item.key}`} />
          ))}
          {points.map((point, index) => (
            <g key={`${point.label}-${index}`}>
              {markerIndexes.has(index)
                ? series.map((item) => (
                  <circle
                    key={`${item.key}-${point.label}`}
                    cx={toX(index)}
                    cy={toY(item.points[index] ?? 0)}
                    r={activeIndex === index ? 1.3 : 1.1}
                    className={`home-activity__dot is-${item.key}`}
                  />
                ))
                : null}
            </g>
          ))}
          {xAxisLabels.map((item) => (
            <text key={`label-${item.label}-${item.index}`} x={toX(item.index)} y="93" className="home-activity__x-label">
              {item.label}
            </text>
          ))}
        </svg>
      </div>
      <div className="home-activity__meta">
        <div className="home-activity__legend" aria-hidden="true">
          {series.map((item) => (
            <span key={item.key} className={`home-activity__metric is-${item.key}`}>
              {item.label}
              <strong>{item.value}</strong>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildActivityAxisLabels(
  points: ActivityTrendPoint[],
  range: WorkspaceStatisticsRange,
  locale: Locale,
): ActivityTrendAxisLabel[] {
  if (points.length === 0) return [];

  if (range === '30d') {
    return buildChunkedAxisLabels(points, 7, locale);
  }

  if (range === '90d') {
    return buildMonthlyAxisLabels(points, locale);
  }

  const stride = range === '24h' ? Math.max(1, Math.ceil(points.length / 6)) : 1;
  return points
    .map((point, index) => ({ index, label: point.label }))
    .filter((_, index) => index === 0 || index === points.length - 1 || index % stride === 0);
}

function buildChunkedAxisLabels(
  points: ActivityTrendPoint[],
  chunkSize: number,
  locale: Locale,
): ActivityTrendAxisLabel[] {
  const labels: ActivityTrendAxisLabel[] = [];

  for (let start = 0; start < points.length; start += chunkSize) {
    const end = Math.min(points.length - 1, start + chunkSize - 1);
    const center = Math.round((start + end) / 2);
    const startPoint = points[start];
    const endPoint = points[end];
    if (!startPoint || !endPoint) continue;

    labels.push({
      index: center,
      label: formatActivityDateRange(startPoint.timestamp, endPoint.timestamp, locale),
    });
  }

  return labels;
}

function buildMonthlyAxisLabels(points: ActivityTrendPoint[], locale: Locale): ActivityTrendAxisLabel[] {
  const groups = new Map<string, number[]>();

  points.forEach((point, index) => {
    const date = new Date(point.timestamp);
    if (!Number.isFinite(date.getTime())) return;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    groups.set(key, [...(groups.get(key) ?? []), index]);
  });

  return Array.from(groups.entries()).map(([key, indexes]) => {
    const center = indexes[Math.floor(indexes.length / 2)] ?? indexes[0] ?? 0;
    const [year, month] = key.split('-').map(Number);
    const date = new Date(year ?? 0, month ?? 0, 1);
    return {
      index: center,
      label: formatActivityMonth(date, locale),
    };
  });
}

function formatActivityDateRange(from: string, to: string, locale: Locale) {
  const start = formatActivityDay(from, locale);
  const end = formatActivityDay(to, locale);
  return start === end ? start : `${start}–${end}`;
}

function formatActivityDay(timestamp: string, locale: Locale) {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return timestamp;
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

function formatActivityMonth(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    month: 'short',
  }).format(date);
}
