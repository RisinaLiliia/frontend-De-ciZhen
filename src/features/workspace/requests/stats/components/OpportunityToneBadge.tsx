'use client';

export type OpportunityToneBadgeTone =
  | 'very-high'
  | 'good'
  | 'balanced'
  | 'competitive'
  | 'low';

export function OpportunityToneBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: OpportunityToneBadgeTone;
  className?: string;
}) {
  return (
    <span
      className={[
        'workspace-opportunity-tone-badge',
        `is-${tone}`,
        className,
      ].filter(Boolean).join(' ')}
    >
      {label}
    </span>
  );
}
