// src/components/ui/Input.tsx
import { cn } from '@/lib/utils/cn';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return <input className={cn('field', className)} {...props} />;
}
