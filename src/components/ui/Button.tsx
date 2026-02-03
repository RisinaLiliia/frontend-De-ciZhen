// src/components/ui/Button.tsx
import { cn } from '@/lib/utils/cn';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function Button({ className, loading, children, ...props }: Props) {
  return (
    <button
      className={cn('btn-primary', className)}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? '…' : children}
    </button>
  );
}
