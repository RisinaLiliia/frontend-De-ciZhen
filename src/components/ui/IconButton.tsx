// src/components/ui/IconButton.tsx
import { cn } from '@/lib/utils/cn';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export function IconButton({ className, label, ...props }: Props) {
  return (
    <button
      aria-label={label}
      className={cn(
        'icon-button h-10 w-10 inline-flex items-center justify-center rounded-md',
        className,
      )}
      {...props}
    />
  );
}
