'use client';

import type { ReactNode } from 'react';

export type KpiCardTone = 'neutral' | 'accent' | 'success' | 'positive';
export type KpiCardVariant = 'soft' | 'plain';
export type KpiCardTrendDirection = 'up' | 'down' | 'flat';

export type KpiCardTrend = {
  direction: KpiCardTrendDirection;
  percent: number;
};

type KpiCardProps = {
  label: string;
  value: string;
  meta?: string;
  tone?: KpiCardTone;
  icon?: ReactNode;
  variant?: KpiCardVariant;
  interactive?: boolean;
  focusable?: boolean;
  className?: string;
  trend?: KpiCardTrend;
};

export function KpiCard({
  label,
  value,
  meta,
  tone = 'neutral',
  icon,
  variant = 'soft',
  interactive = false,
  focusable = false,
  className,
  trend,
}: KpiCardProps) {
  const resolvedTone = tone === 'positive' ? 'accent' : tone;
  const trendDirection = trend?.direction ?? 'flat';
  const trendPercent = Math.round(Math.abs(trend?.percent ?? 0));
  const trendSign = trendDirection === 'up' ? '+' : trendDirection === 'down' ? '-' : '';

  return (
    <article
      className={[
        'kpi-card',
        variant === 'plain' ? 'kpi-card--plain' : '',
        tone === 'positive' ? 'kpi-card--positive' : '',
        interactive ? 'stat-link' : '',
        className ?? '',
      ].join(' ').trim()}
      tabIndex={interactive || focusable ? 0 : undefined}
    >
      <div className="kpi-card__top">
        <span className="kpi-card__label-wrap">
          {icon ? (
            <span className="stat-icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <span className="kpi-card__label">{label}</span>
        </span>
      </div>
      <strong className="kpi-card__value">{value}</strong>
      {meta || trend ? (
        <div className="kpi-card__bottom">
          {meta ? <span className={`kpi-card__meta is-${resolvedTone}`.trim()}>{meta}</span> : null}
          {trend ? (
            <span className={`kpi-card__trend is-${trendDirection}`.trim()} aria-label={`Trend ${trendSign}${trendPercent}%`}>
              <span className="kpi-card__trend-icon" aria-hidden="true">
                {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '•'}
              </span>
              <span className="kpi-card__trend-value">{`${trendSign}${trendPercent}%`}</span>
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
