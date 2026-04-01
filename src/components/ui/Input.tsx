// src/components/ui/Input.tsx
import { cn } from '@/lib/utils/cn';
import * as React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, Props>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn('field', className)} {...props} />;
});
