'use client';

import Link from 'next/link';

import { KpiCard } from '@/components/ui/KpiCard';
import {
  buildMiniChartPath,
  clampStatsProgressValue,
} from '@/components/requests/requestsStatsPanel.model';
import type { ChartPoint, PayloadViewModel } from '@/components/requests/requestsStatsPanel.types';

export function RequestsStatsPanelBody({ viewModel }: { viewModel: PayloadViewModel }) {
  const { payload, hasData, chartPoints } = viewModel;

  if (!hasData) {
    return (
      <div className="requests-stats__empty">
        <p className="typo-small">{payload.emptyTitle}</p>
        <Link href={payload.emptyCtaHref} prefetch={false} className="btn-ghost is-primary">
          {payload.emptyCtaLabel}
        </Link>
      </div>
    );
  }

  return (
    <>
      {payload.showKpis !== false && payload.kpis.length > 0 ? (
        <div className="requests-stats__kpi-grid kpi-grid kpi-grid--decision">
          {payload.kpis.map((kpi) => (
            <KpiCard
              key={kpi.key}
              label={kpi.label}
              value={kpi.value}
              meta={kpi.delta}
              tone={kpi.tone ?? 'neutral'}
              trend={kpi.trend}
            />
          ))}
        </div>
      ) : null}

      <section className="requests-stats-chart">
        <div className="requests-stats-chart__header">
          <p className="requests-stats-chart__title">{payload.chartTitle}</p>
          {payload.chartDelta ? (
            <span className="requests-stats-chart__delta">{payload.chartDelta}</span>
          ) : null}
        </div>
        <MiniChart points={chartPoints} />
      </section>

      <section className="requests-stats-secondary">
        <div className="requests-stats-secondary__top">
          <span>
            <strong>{payload.secondary.leftValue}</strong> {payload.secondary.leftLabel}
          </span>
          <span>
            <strong>{payload.secondary.centerValue}</strong> {payload.secondary.centerLabel}
          </span>
          <span>
            <strong>{payload.secondary.rightValue}</strong> {payload.secondary.rightLabel}
          </span>
        </div>
        <div className="requests-stats-secondary__progress">
          <div className="requests-stats-secondary__progress-label">
            {payload.secondary.progressLabel}{' '}
            <strong>{payload.secondary.progressValue}%</strong>
          </div>
          <div className="requests-stats-secondary__track">
            <span
              className="requests-stats-secondary__fill"
              style={{
                width: `${clampStatsProgressValue(payload.secondary.progressValue)}%`,
              }}
            />
          </div>
        </div>
        <div className="requests-stats-secondary__response">
          {payload.secondary.responseLabel} <strong>{payload.secondary.responseValue}</strong>
        </div>
      </section>

      {payload.showHint !== false ? (
        <section className="requests-stats-hint">
          <p className="requests-stats-hint__text">{payload.hint.text}</p>
          <Link href={payload.hint.ctaHref} prefetch={false} className="btn-ghost is-primary">
            {payload.hint.ctaLabel}
          </Link>
        </section>
      ) : null}
    </>
  );
}

function MiniChart({ points }: { points: ChartPoint[] }) {
  const maxBar = Math.max(1, ...points.map((point) => point.bars));
  const linePath = buildMiniChartPath(points);

  return (
    <div className="requests-mini-chart">
      <div className="requests-mini-chart__plot">
        {points.map((point, index) => (
          <div key={`${point.label}-${index}`} className="requests-mini-chart__column">
            <span
              className="requests-mini-chart__bar"
              style={{ height: `${Math.max(6, (point.bars / maxBar) * 100)}%` }}
            />
            <span className="requests-mini-chart__label">{point.label}</span>
          </div>
        ))}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="requests-mini-chart__line"
        >
          <path d={linePath} />
        </svg>
      </div>
    </div>
  );
}
