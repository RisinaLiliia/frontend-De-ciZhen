'use client';

type StatisticsMetricSignalCardProps = {
  as?: 'div' | 'li';
  className?: string;
  label: string;
  value: string;
  hint: string;
  tone: 'positive' | 'neutral' | 'warning';
};

export function StatisticsMetricSignalCard({
  as = 'div',
  className,
  label,
  value,
  hint,
  tone,
}: StatisticsMetricSignalCardProps) {
  const Component = as;

  return (
    <Component
      className={`stat-card workspace-statistics__activity-signal is-${tone}${tone === 'positive' ? ' dc-glow' : ''}${className ? ` ${className}` : ''}`.trim()}
    >
      <span className="workspace-statistics__activity-signal-label">{label}</span>
      <strong className="workspace-statistics__activity-signal-value">{value}</strong>
      <span className="workspace-statistics__activity-signal-hint">{hint}</span>
    </Component>
  );
}
