'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getPlatformActivity,
  type PlatformActivityPoint,
  type PlatformActivityRange,
} from '@/lib/api/analytics';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

type HomePlatformActivityPanelProps = {
  t: (key: I18nKey) => string;
  locale: string;
};

const RANGES: PlatformActivityRange[] = ['24h', '7d', '30d'];

export function HomePlatformActivityPanel({ t, locale }: HomePlatformActivityPanelProps) {
  const [range, setRange] = React.useState<PlatformActivityRange>('7d');
  const [activeIndex, setActiveIndex] = React.useState<number>(0);

  const query = useQuery({
    queryKey: ['home-platform-activity', range],
    queryFn: () => getPlatformActivity(range),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const points = query.data?.data ?? [];
  React.useEffect(() => {
    setActiveIndex(Math.max(0, points.length - 1));
  }, [points.length, range]);

  const active = points[activeIndex] ?? points[points.length - 1];
  const updatedAt = query.data?.updatedAt
    ? new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(query.data.updatedAt))
    : null;

  return (
    <section className="panel home-activity-panel">
      <div className="panel-header">
        <div className="section-heading">
          <p className="section-title">{t(I18N_KEYS.homePublic.activityTitle)}</p>
          <p className="section-subtitle">{t(I18N_KEYS.homePublic.activitySubtitle)}</p>
        </div>
        {query.data?.source === 'mock' ? (
          <span className="badge badge-live home-activity__demo">
            {t(I18N_KEYS.homePublic.activityDemo)}
          </span>
        ) : null}
      </div>

      <div className="home-activity__ranges mt-3">
        {RANGES.map((item) => (
          <button
            key={item}
            type="button"
            className={`home-activity__range ${range === item ? 'is-active' : ''}`.trim()}
            onClick={() => setRange(item)}
          >
            {t(
              item === '24h'
                ? I18N_KEYS.homePublic.activityRange24h
                : item === '7d'
                  ? I18N_KEYS.homePublic.activityRange7d
                  : I18N_KEYS.homePublic.activityRange30d,
            )}
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <div className="home-activity__loading mt-3">
          <div className="skeleton h-28 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      ) : query.isError ? (
        <div className="home-activity__state mt-3">{t(I18N_KEYS.homePublic.activityError)}</div>
      ) : points.length === 0 ? (
        <div className="home-activity__state mt-3">{t(I18N_KEYS.homePublic.activityEmpty)}</div>
      ) : (
        <>
          <MiniLineChart points={points} activeIndex={activeIndex} onHover={setActiveIndex} />
          {active ? (
            <div className="home-activity__meta">
              <div className="home-activity__point-time">{formatPointTime(active.timestamp, range, locale)}</div>
              <div className="home-activity__legend">
                <span className="home-activity__metric is-requests">
                  {t(I18N_KEYS.homePublic.activityRequests)}: <strong>{active.requests}</strong>
                </span>
                <span className="home-activity__metric is-offers">
                  {t(I18N_KEYS.homePublic.activityOffers)}: <strong>{active.offers}</strong>
                </span>
              </div>
              {updatedAt ? (
                <div className="home-activity__updated">
                  {t(I18N_KEYS.homePublic.activityUpdated)}: {updatedAt}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

function MiniLineChart({
  points,
  activeIndex,
  onHover,
}: {
  points: PlatformActivityPoint[];
  activeIndex: number;
  onHover: (index: number) => void;
}) {
  const width = 100;
  const height = 100;
  const maxValue = Math.max(1, ...points.flatMap((point) => [point.requests, point.offers]));
  const step = width / Math.max(points.length - 1, 1);

  const toY = React.useCallback((value: number) => {
    const top = 10;
    const bottom = 85;
    return bottom - (value / maxValue) * (bottom - top);
  }, [maxValue]);

  const requestsPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point.requests)}`)
    .join(' ');
  const offersPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point.offers)}`)
    .join(' ');

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const progress = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const index = Math.round(progress * Math.max(points.length - 1, 0));
    onHover(index);
  };

  return (
    <div className="home-activity__chart mt-3">
      <svg
        className="home-activity__svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        onPointerMove={handlePointerMove}
      >
        <line x1="0" y1="85" x2={String(width)} y2="85" className="home-activity__axis" />
        <path d={offersPath} className="home-activity__line is-offers" />
        <path d={requestsPath} className="home-activity__line is-requests" />
        {points.map((point, index) => (
          <g key={`${point.timestamp}-${index}`}>
            <circle
              cx={index * step}
              cy={toY(point.requests)}
              r={activeIndex === index ? 1.8 : 0.85}
              className="home-activity__dot is-requests"
            />
            <circle
              cx={index * step}
              cy={toY(point.offers)}
              r={activeIndex === index ? 1.8 : 0.85}
              className="home-activity__dot is-offers"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

function formatPointTime(timestamp: string, range: PlatformActivityRange, locale: string): string {
  const date = new Date(timestamp);
  const isGerman = locale === 'de';
  if (Number.isNaN(date.getTime())) return timestamp;
  if (range === '24h') {
    return new Intl.DateTimeFormat(isGerman ? 'de-DE' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
  return new Intl.DateTimeFormat(isGerman ? 'de-DE' : 'en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date);
}
