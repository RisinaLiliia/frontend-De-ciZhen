import * as React from 'react';

import {
  Badge,
  type BadgeSize,
  type BadgeTone,
  type BadgeVariant,
} from '@/components/ui/Badge';

export type WorkspaceBadgeVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'risk'
  | 'opportunity'
  | 'priority'
  | 'info';

const WORKSPACE_BADGE_VARIANT_MAP: Record<WorkspaceBadgeVariant, BadgeVariant> = {
  neutral: 'neutral',
  success: 'success',
  warning: 'warning',
  risk: 'risk',
  opportunity: 'opportunity',
  priority: 'warning',
  info: 'info',
};

type WorkspaceBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: WorkspaceBadgeVariant;
  size?: BadgeSize;
  tone?: BadgeTone;
};

export function WorkspaceBadge({
  variant = 'neutral',
  size = 'sm',
  tone = 'soft',
  ...props
}: WorkspaceBadgeProps) {
  return (
    <Badge
      variant={WORKSPACE_BADGE_VARIANT_MAP[variant]}
      size={size}
      tone={tone}
      {...props}
    />
  );
}
