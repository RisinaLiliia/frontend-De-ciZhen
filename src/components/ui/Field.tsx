// src/components/ui/Field.tsx
import { cn } from '@/lib/utils/cn';

type Props = {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function Field({ leftIcon, rightIcon, children, className }: Props) {
  return (
    <div
      className={cn(
        'field-shell relative w-full',
        leftIcon ? 'field-shell--with-left-icon' : '',
        rightIcon ? 'field-shell--with-right-icon' : '',
        className,
      )}
    >
      {leftIcon ? (
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--c-muted)' }}
          aria-hidden
        >
          {leftIcon}
        </div>
      ) : null}

      <div className="w-full">
        {children}
      </div>

      {rightIcon ? (
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--c-muted)' }}
          aria-hidden
        >
          {rightIcon}
        </div>
      ) : null}
    </div>
  );
}
