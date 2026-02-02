// src/components/ui/IconButton.tsx
import { cn } from "@/lib/utils/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export function IconButton({ className, label, ...props }: Props) {
  return (
    <button
      aria-label={label}
      className={cn(
        "h-10 w-10 inline-flex items-center justify-center rounded-md",
        "hover:bg-gray-100 dark:hover:bg-gray-900",
        "focus:outline-none focus:ring-2 focus:ring-(--c-primary)",
        className
      )}
      {...props}
    />
  );
}
