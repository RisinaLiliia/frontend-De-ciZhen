// src/components/ui/Button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import { Spinner } from '@/components/ui/Spinner';

const buttonVariants = cva('inline-flex items-center justify-center font-semibold transition disabled:opacity-60 disabled:pointer-events-none', {
  variants: {
    variant: {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
    },
    size: {
      sm: 'text-xs',
      md: '',
      lg: 'text-base',
    },
    fullWidth: {
      true: 'w-full',
      false: 'w-fit',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    fullWidth: true,
  },
});

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
  loading?: boolean;
};

export function Button({
  className,
  variant,
  size,
  fullWidth,
  loading,
  children,
  type,
  ...props
}: Props) {
  const isDisabled = props.disabled || loading;

  return (
    <button
      type={type ?? 'button'}
      className={cn(buttonVariants({ variant, size, fullWidth }), loading && 'cursor-progress gap-2', className)}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      <span className={cn('inline-flex items-center justify-center gap-2', loading && 'min-w-[80px]')}>
        {loading ? (
          <>
            <span aria-hidden="true">
              <Spinner size={14} />
            </span>
            <span className="sr-only">Loading</span>
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}
