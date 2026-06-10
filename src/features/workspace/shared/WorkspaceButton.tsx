import * as React from 'react';

import { cn } from '@/lib/utils/cn';

export type WorkspaceButtonVariant = 'primary' | 'secondary' | 'ghost' | 'softActive';

export type WorkspaceButtonSize = 'sm' | 'md' | 'lg';

type WorkspaceButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: WorkspaceButtonVariant;
  size?: WorkspaceButtonSize;
  fullWidth?: boolean;
};

const variantClasses: Record<WorkspaceButtonVariant, string> = {
  primary: 'app-button-primary',
  secondary: 'app-button-secondary',
  ghost: 'app-button-ghost',
  softActive: 'app-button-ghost is-primary',
};

const sizeClasses: Record<WorkspaceButtonSize, string> = {
  sm: 'app-control-sm px-3 py-1.5 text-sm',
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
        'font-semibold disabled:pointer-events-none disabled:opacity-60',
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
