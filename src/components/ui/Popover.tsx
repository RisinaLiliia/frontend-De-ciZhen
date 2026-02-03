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
};

export function Popover({
  open,
  onOpenChange,
  align = 'start',
  trigger,
  children,
  className,
}: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);

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
        onClick={() => onOpenChange(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onOpenChange(!open);
        }}
        role="button"
        tabIndex={0}
      >
        {trigger}
      </div>

      {open ? (
        <div className="dc-popover-panel" data-align={align} role="dialog" aria-modal="false">
          {children}
        </div>
      ) : null}
    </div>
  );
}
