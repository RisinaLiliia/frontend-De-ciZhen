// src/components/ui/FormLabel.tsx
import { cn } from '@/lib/utils/cn';

type FormLabelProps = {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  requiredHint?: string;
  className?: string;
};

export function FormLabel({
  htmlFor,
  children,
  required = false,
  requiredHint,
  className,
}: FormLabelProps) {
  return (
    <label htmlFor={htmlFor} className={cn('typo-small form-label', className)}>
      <span>{children}</span>
      {required ? (
        <span
          className="form-label__required"
          title={requiredHint}
          aria-label={requiredHint}
          role="note"
        >
          *
        </span>
      ) : null}
    </label>
  );
}
