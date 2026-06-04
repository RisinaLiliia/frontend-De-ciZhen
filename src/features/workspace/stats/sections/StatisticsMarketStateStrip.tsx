'use client';

import { workspaceStatCardShell, workspaceStatsChartPanelShell } from '@/features/workspace/shared';

type MarketStateMetric = {
  key: string;
  label: string;
  value: string;
  delta?: string | null;
  tone?: 'positive' | 'neutral' | 'warning';
};

type StatisticsMarketStateStripProps = {
  title: string;
  subtitle: string;
  metrics: MarketStateMetric[];
};

export function StatisticsMarketStateStrip({
  title,
  subtitle,
  metrics,
}: StatisticsMarketStateStripProps) {
  if (metrics.length === 0) return null;

  return (
    <section
      className={workspaceStatsChartPanelShell('workspace-statistics-market-state')}
      aria-labelledby="workspace-statistics-market-state-title"
    >
      <div className="workspace-statistics-market-state__head">
        <div>
          <p id="workspace-statistics-market-state-title" className="section-title">
            {title}
          </p>
          <p className="section-subtitle">{subtitle}</p>
        </div>
      </div>

      <ul className="workspace-statistics-market-state__grid" aria-label={title}>
        {metrics.map((item) => (
          <li
            key={item.key}
            className={workspaceStatCardShell(
              'workspace-statistics-market-state__metric',
              `is-${item.tone ?? 'neutral'}`,
            )}
          >
            <span className="workspace-statistics-market-state__metric-label">{item.label}</span>
            <strong className="workspace-statistics-market-state__metric-value">{item.value}</strong>
            {item.delta ? (
              <span className="workspace-statistics-market-state__metric-delta">{item.delta}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
