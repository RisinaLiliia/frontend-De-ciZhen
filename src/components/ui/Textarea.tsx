// src/components/ui/Textarea.tsx
import { cn } from '@/lib/utils/cn';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: Props) {
  return <textarea className={cn('field field-textarea', className)} {...props} />;
}
