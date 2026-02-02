// src/components/ui/Spinner.tsx
export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <span
      aria-label="Loading"
      className="inline-block animate-spin rounded-full"
      style={{
        width: size,
        height: size,
        border: "2px solid var(--c-border)",
        borderTopColor: "var(--c-primary)",
      }}
    />
  );
}
