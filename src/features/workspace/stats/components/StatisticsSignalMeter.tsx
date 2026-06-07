'use client';

import * as React from 'react';

export type StatisticsSignalTone =
  | 'very-high'
  | 'good'
  | 'high'
  | 'balanced'
  | 'competitive'
  | 'medium'
  | 'low';

export function StatisticsSignalMeter({
  label,
  value,
  progressPercent,
  semanticLabel,
  semanticTone,
  semanticAlign = 'center',
  className,
}: {
  label: string;
  value: string;
  progressPercent: number;
  semanticLabel?: string | null;
  semanticTone?: StatisticsSignalTone | null;
  semanticAlign?: 'center' | 'start';
  className?: string;
}) {
  return (
    <div className={['workspace-statistics-signal', className].filter(Boolean).join(' ')}>
      <div className="workspace-statistics-signal__head">
        <span className="workspace-statistics-signal__label">{label}</span>
        <strong className="workspace-statistics-signal__value">{value}</strong>
      </div>
      <div className="workspace-statistics-signal__track" aria-hidden="true">
        <span
          className="workspace-statistics-signal__fill"
          style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
        />
      </div>
      {semanticLabel ? (
        <p
          className={[
            'workspace-statistics-signal__semantic',
            semanticTone ? `is-${semanticTone}` : '',
            semanticAlign === 'start' ? 'is-start' : '',
          ].filter(Boolean).join(' ')}
        >
          {semanticLabel}
        </p>
      ) : null}
    </div>
  );
}
