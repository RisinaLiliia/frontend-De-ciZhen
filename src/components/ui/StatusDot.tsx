type StatusDotProps = {
  status: "online" | "offline";
  label: string;
  className?: string;
};

export function StatusDot({ status, label, className }: StatusDotProps) {
  return (
    <>
      <span
        className={`provider-status-dot provider-status--${status} ${className ?? ""}`.trim()}
        data-status-label={label}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </>
  );
}
