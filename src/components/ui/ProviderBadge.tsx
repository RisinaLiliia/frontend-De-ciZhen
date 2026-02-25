export type ProviderBadgeType = 'top' | 'service' | 'fast';
export type ProviderBadgeSize = 'md' | 'sm';

type ProviderBadgeProps = {
  type: ProviderBadgeType;
  label: string;
  tooltip?: string;
  size?: ProviderBadgeSize;
};

export function ProviderBadge({ type, label, tooltip, size = 'md' }: ProviderBadgeProps) {
  return (
    <span
      className={`provider-badge provider-badge--${type} provider-badge--${size}`.trim()}
      title={tooltip}
      aria-label={tooltip ?? label}
    >
      {label}
    </span>
  );
}
