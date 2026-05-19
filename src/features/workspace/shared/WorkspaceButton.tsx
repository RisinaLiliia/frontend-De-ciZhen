import * as React from 'react';

import { cn } from '@/lib/utils/cn';

export type WorkspaceButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'softActive';

export type WorkspaceButtonSize = 'sm' | 'md' | 'lg';

type WorkspaceButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: WorkspaceButtonVariant;
  size?: WorkspaceButtonSize;
  fullWidth?: boolean;
};

const variantClasses: Record<WorkspaceButtonVariant, string> = {
  primary:
    'border border-transparent bg-[var(--dc-primary)] text-[var(--dc-primary-contrast)] hover:bg-[var(--dc-primary-hover)]',
  secondary:
    'border border-[var(--dc-border)] bg-[var(--dc-surface)] text-[var(--dc-text)] hover:border-[var(--color-primary-border)] hover:bg-[var(--dc-surface-muted)]',
  ghost:
    'border border-[var(--dc-border-soft)] bg-transparent text-[var(--dc-text-muted)] hover:bg-[var(--dc-surface-muted)] hover:text-[var(--dc-text)]',
  softActive:
    'border border-[var(--dc-primary-border)] bg-[var(--dc-primary-soft)] text-[var(--dc-primary)] hover:bg-[var(--dc-primary-soft)]',
};

const sizeClasses: Record<WorkspaceButtonSize, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-sm',
  md: 'min-h-10 px-4 py-2 text-sm',
  lg: 'min-h-11 px-5 py-3 text-base',
};

export function WorkspaceButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  style,
  type,
  ...props
}: WorkspaceButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--dc-radius-md)] font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dc-primary-soft)] disabled:pointer-events-none disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      style={style}
      {...props}
    />
  );
}
