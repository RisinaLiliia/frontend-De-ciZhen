import { IconPin } from '@/components/ui/icons/icons';

type LocationMetaProps = {
  label: string;
  className?: string;
};

export function LocationMeta({ label, className }: LocationMetaProps) {
  const safeLabel = label.trim();
  if (!safeLabel) return null;

  return (
    <span
      className={`request-meta-item location-meta ${className ?? ''}`.trim()}
      data-meta-item="true"
      title={safeLabel}
    >
      <IconPin />
      <span>{safeLabel}</span>
    </span>
  );
}
