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

type WorkspaceBadgeStyle = React.CSSProperties & Record<string, string>;

const WORKSPACE_BADGE_STYLE_MAP: Record<WorkspaceBadgeVariant, WorkspaceBadgeStyle> = {
  neutral: {
    '--badge-bg': 'var(--dc-surface-muted)',
    '--badge-border': 'var(--dc-border)',
    '--badge-text': 'var(--dc-text-muted)',
    '--badge-accent': 'var(--dc-text-muted)',
  },
  info: {
    '--badge-bg': 'var(--dc-blue-soft)',
    '--badge-border': 'var(--color-info-border)',
    '--badge-text': 'var(--dc-blue)',
    '--badge-accent': 'var(--dc-blue)',
  },
  success: {
    '--badge-bg': 'var(--dc-sage-soft)',
    '--badge-border': 'var(--color-success-border)',
    '--badge-text': 'var(--dc-sage)',
    '--badge-accent': 'var(--dc-sage)',
  },
  warning: {
    '--badge-bg': 'var(--dc-sand-soft)',
    '--badge-border': 'var(--color-warning-border)',
    '--badge-text': 'var(--dc-sand)',
    '--badge-accent': 'var(--dc-sand)',
  },
  priority: {
    '--badge-bg': 'var(--dc-primary-soft)',
    '--badge-border': 'var(--color-primary-border)',
    '--badge-text': 'var(--dc-primary)',
    '--badge-accent': 'var(--dc-primary)',
  },
  risk: {
    '--badge-bg': 'var(--dc-danger-soft)',
    '--badge-border': 'var(--color-danger-border)',
    '--badge-text': 'var(--dc-danger)',
    '--badge-accent': 'var(--dc-danger)',
  },
  opportunity: {
    '--badge-bg': 'var(--dc-blue-soft)',
    '--badge-border': 'var(--color-info-border)',
    '--badge-text': 'var(--dc-blue)',
    '--badge-accent': 'var(--dc-blue)',
  },
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
  style,
  ...props
}: WorkspaceBadgeProps) {
  return (
    <Badge
      variant={WORKSPACE_BADGE_VARIANT_MAP[variant]}
      size={size}
      tone={tone}
      style={{
        ...WORKSPACE_BADGE_STYLE_MAP[variant],
        ...style,
      }}
      {...props}
    />
  );
}
