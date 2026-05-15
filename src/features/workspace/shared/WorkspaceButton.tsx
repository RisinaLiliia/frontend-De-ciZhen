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
    'bg-[var(--dc-primary)] text-white hover:bg-[var(--dc-primary-hover)] border border-transparent',
  secondary:
    'bg-[var(--dc-surface)] text-[var(--dc-text)] border border-[var(--dc-border)] hover:bg-[var(--dc-surface-muted)]',
  ghost:
    'bg-transparent text-[var(--dc-text-muted)] hover:bg-[var(--dc-surface-muted)] border border-transparent',
  softActive:
    'bg-[var(--dc-primary-soft)] text-[var(--dc-primary)] border border-[var(--dc-border-soft)] hover:bg-[var(--dc-primary-soft)]',
};

const sizeClasses: Record<WorkspaceButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-3',
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
        'inline-flex items-center justify-center font-semibold rounded-[var(--dc-radius-md)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dc-primary-soft)] disabled:opacity-60 disabled:pointer-events-none',
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
