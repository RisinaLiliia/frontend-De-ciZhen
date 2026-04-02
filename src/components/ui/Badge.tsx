import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva('ui-badge', {
  variants: {
    variant: {
      default: 'ui-badge--neutral',
      neutral: 'ui-badge--neutral',
      info: 'ui-badge--info',
      success: 'ui-badge--success',
      warning: 'ui-badge--warning',
      danger: 'ui-badge--risk',
      risk: 'ui-badge--risk',
      opportunity: 'ui-badge--opportunity',
    },
    size: {
      sm: 'ui-badge--sm',
      md: 'ui-badge--md',
    },
    tone: {
      soft: 'ui-badge--soft',
      outline: 'ui-badge--outline',
      solid: 'ui-badge--solid',
    },
  },
  defaultVariants: {
    variant: 'neutral',
    size: 'md',
    tone: 'soft',
  },
});

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>['size']>;
export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, size, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size, tone }), className)} {...props} />;
}
