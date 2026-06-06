'use client';

import { WorkspaceBadge, type WorkspaceBadgeVariant } from '@/features/workspace/shared/WorkspaceBadge';

export type OpportunityToneBadgeTone =
  | 'very-high'
  | 'good'
  | 'balanced'
  | 'competitive'
  | 'low';

const OPPORTUNITY_TONE_VARIANT_MAP: Record<OpportunityToneBadgeTone, WorkspaceBadgeVariant> = {
  'very-high': 'success',
  good: 'success',
  balanced: 'neutral',
  competitive: 'warning',
  low: 'warning',
};

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
    <WorkspaceBadge
      variant={OPPORTUNITY_TONE_VARIANT_MAP[tone]}
      size="sm"
      tone="soft"
      className={className}
    >
      {label}
    </WorkspaceBadge>
  );
}
