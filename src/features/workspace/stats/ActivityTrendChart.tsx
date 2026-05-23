'use client';

import * as React from 'react';

 export function ActivityTrendChart({
  points,
  requestsLabel,
  offersLabel,
  clientActivityLabel,
  providerActivityLabel,
  emptyLabel,
}: {
  points: Array<{
    label: string;
    requests: number;
    offers: number;
    clientActivity?: number | null;
    providerActivity?: number | null;
  }>;
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
  const maxValue = Math.max(
    1,
    ...points.flatMap((point) => [
      point.requests,
      point.offers,
      point.clientActivity ?? 0,
      point.providerActivity ?? 0,
    ]),
  );
  const step = width / Math.max(points.length - 1, 1);
  const active = points[activeIndex] ?? points[points.length - 1];

  const toY = (value: number) => {
    const top = 10;
    const bottom = 85;
    return bottom - (value / maxValue) * (bottom - top);
  };

  const requestsPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point.requests)}`)
    .join(' ');
  const offersPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point.offers)}`)
    .join(' ');
  const hasClientActivity = points.some((point) => typeof point.clientActivity === 'number' && point.clientActivity > 0);
  const clientActivityPath = hasClientActivity
    ? points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point.clientActivity ?? 0)}`)
      .join(' ')
    : null;
  const hasProviderActivity = points.some(
    (point) => typeof point.providerActivity === 'number' && point.providerActivity > 0,
  );
  const providerActivityPath = hasProviderActivity
    ? points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point.providerActivity ?? 0)}`)
      .join(' ')
    : null;

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
          <line x1="0" y1="85" x2={String(width)} y2="85" className="home-activity__axis" />
          <path d={requestsPath} className="home-activity__line is-requests" />
          <path d={offersPath} className="home-activity__line is-offers" />
          {clientActivityPath ? <path d={clientActivityPath} className="home-activity__line is-client-activity" /> : null}
          {providerActivityPath ? <path d={providerActivityPath} className="home-activity__line is-provider-activity" /> : null}
          {points.map((point, index) => (
            <g key={`${point.label}-${index}`}>
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
              {clientActivityPath ? (
                <circle
                  cx={index * step}
                  cy={toY(point.clientActivity ?? 0)}
                  r={activeIndex === index ? 1.8 : 0.85}
                  className="home-activity__dot is-client-activity"
                />
              ) : null}
              {providerActivityPath ? (
                <circle
                  cx={index * step}
                  cy={toY(point.providerActivity ?? 0)}
                  r={activeIndex === index ? 1.8 : 0.85}
                  className="home-activity__dot is-provider-activity"
                />
              ) : null}
            </g>
          ))}
        </svg>
      </div>
      <div className="home-activity__meta">
        <div className="home-activity__point-time">{active?.label ?? '—'}</div>
        <div className="home-activity__legend" aria-hidden="true">
          <span className="home-activity__metric is-requests">
            {requestsLabel}: <strong>{active?.requests ?? 0}</strong>
          </span>
          <span className="home-activity__metric is-offers">
            {offersLabel}: <strong>{active?.offers ?? 0}</strong>
          </span>
          {clientActivityPath ? (
            <span className="home-activity__metric is-client-activity">
              {clientActivityLabel}: <strong>{active?.clientActivity ?? 0}</strong>
            </span>
          ) : null}
          {providerActivityPath ? (
            <span className="home-activity__metric is-provider-activity">
              {providerActivityLabel}: <strong>{active?.providerActivity ?? 0}</strong>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
