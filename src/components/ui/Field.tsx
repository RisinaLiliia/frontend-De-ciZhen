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
    <div className={cn('relative w-full', className)}>
      {leftIcon ? (
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--c-muted)' }}
          aria-hidden
        >
          {leftIcon}
        </div>
      ) : null}

      <div
        className={cn(
          'w-full',
          leftIcon ? '[&_.field]:pl-11' : '',
          rightIcon ? '[&_.field]:pr-11' : '',
        )}
      >
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
