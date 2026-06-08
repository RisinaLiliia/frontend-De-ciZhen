'use client';

import type { ReactNode } from 'react';

type StatisticsMetricSignalCardProps = {
  as?: 'div' | 'li';
  className?: string;
  label: string;
  value: ReactNode;
  hint: string;
  tone: 'positive' | 'neutral' | 'warning';
  comparison?: {
    userLabel: string;
    userValue: ReactNode;
    marketLabel: string;
    marketValue: ReactNode;
    gapLabel?: string;
  } | null;
};

export function StatisticsMetricSignalCard({
  as = 'div',
  className,
  label,
  value,
  hint,
  tone,
  comparison = null,
}: StatisticsMetricSignalCardProps) {
  const Component = as;

  return (
    <Component
      className={`stat-card workspace-statistics__activity-signal is-${tone}${tone === 'positive' ? ' dc-glow' : ''}${className ? ` ${className}` : ''}`.trim()}
    >
      <span className="workspace-statistics__activity-signal-label">{label}</span>
      {comparison ? (
        <div className="workspace-statistics__activity-signal-compare">
          <span className="workspace-statistics__activity-signal-compare-row">
            <span className="workspace-statistics__activity-signal-compare-label">{comparison.userLabel}</span>
            <strong className="workspace-statistics__activity-signal-compare-value is-user">{comparison.userValue}</strong>
          </span>
          <span className="workspace-statistics__activity-signal-compare-row">
            <span className="workspace-statistics__activity-signal-compare-label">{comparison.marketLabel}</span>
            <strong className="workspace-statistics__activity-signal-compare-value is-market">{comparison.marketValue}</strong>
          </span>
        </div>
      ) : (
        <strong className="workspace-statistics__activity-signal-value">{value}</strong>
      )}
      <span className="workspace-statistics__activity-signal-hint">
        {comparison?.gapLabel ? <strong>{comparison.gapLabel}: </strong> : null}
        {hint}
      </span>
    </Component>
  );
}
