'use client';

export type StatisticsStatusBadgeTone =
  | 'very-high'
  | 'good'
  | 'balanced'
  | 'competitive'
  | 'low';

export function StatisticsStatusBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: StatisticsStatusBadgeTone;
  className?: string;
}) {
  return (
    <span
      className={[
        'workspace-statistics-status-badge',
        `is-${tone}`,
        className,
      ].filter(Boolean).join(' ')}
    >
      {label}
    </span>
  );
}
