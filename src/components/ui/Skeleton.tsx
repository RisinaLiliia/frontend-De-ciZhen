// src/components/ui/Skeleton.tsx
import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md", className)}
      style={{ background: "color-mix(in oklab, var(--c-border) 55%, transparent)" }}
    />
  );
}
