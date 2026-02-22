import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva('inline-flex items-center justify-center rounded-full border font-semibold whitespace-nowrap', {
  variants: {
    variant: {
      default: 'badge',
      info: 'status-badge status-badge--info',
      success: 'status-badge status-badge--success',
      warning: 'status-badge status-badge--warning',
      danger: 'status-badge status-badge--danger',
    },
    size: {
      sm: 'text-[11px] px-2 py-0.5',
      md: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
