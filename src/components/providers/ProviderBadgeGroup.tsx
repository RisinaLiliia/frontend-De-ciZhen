import { type BadgeSize, type BadgeTone } from '@/components/ui/Badge';
import {
  WorkspaceBadge,
  type WorkspaceBadgeVariant,
} from '@/features/workspace/shared/WorkspaceBadge';

export type ProviderBadgeItem = {
  variant: WorkspaceBadgeVariant;
  size: BadgeSize;
  label: string;
  tone?: BadgeTone;
  tooltip?: string;
};

type ProviderBadgeGroupProps = {
  providerId: string;
  badges: ProviderBadgeItem[];
  limit?: number;
  className?: string;
};

export function ProviderBadgeGroup({
  providerId,
  badges,
  limit = 2,
  className,
}: ProviderBadgeGroupProps) {
  const visibleBadges = badges.slice(0, limit);
  if (visibleBadges.length === 0) return null;

  return (
    <span
      className={['workspace-list-card__badge-group', className ?? ''].filter(Boolean).join(' ')}
    >
      {visibleBadges.map((badge) => (
        <WorkspaceBadge
          key={`${providerId}-${badge.label}`}
          variant={badge.variant}
          tone={badge.tone ?? 'soft'}
          size={badge.size}
          title={badge.tooltip}
          aria-label={badge.tooltip ?? badge.label}
        >
          {badge.label}
        </WorkspaceBadge>
      ))}
    </span>
  );
}
