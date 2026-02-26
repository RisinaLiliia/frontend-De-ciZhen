// src/components/ui/Popover.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  align?: 'start' | 'end';
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export function Popover({
  open,
  onOpenChange,
  align = 'start',
  trigger,
  children,
  className,
  disabled = false,
}: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const panelId = React.useId();
  const toggle = React.useCallback(() => {
    if (disabled) return;
    onOpenChange(!open);
  }, [disabled, onOpenChange, open]);

  React.useEffect(() => {
    if (!open) return;

    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onOpenChange(false);
    };

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };

    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className={cn('dc-popover', className)}>
      <div
        className="dc-popover-trigger"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-disabled={disabled}
      >
        {trigger}
      </div>

      {open ? (
        <div id={panelId} className="dc-popover-panel" data-align={align} role="dialog" aria-modal="false">
          {children}
        </div>
      ) : null}
    </div>
  );
}
