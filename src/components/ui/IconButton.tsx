// src/components/ui/IconButton.tsx
import { cn } from '@/lib/utils/cn';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export function IconButton({ className, label, children, ...props }: Props) {
  return (
    <button
      type={props.type ?? 'button'}
      aria-label={label}
      className={cn(
        'icon-button icon-button--md inline-flex items-center justify-center',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
