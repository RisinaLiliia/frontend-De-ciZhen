import Link from 'next/link';
import { IconHeart } from '@/components/ui/icons/icons';
import { ProviderBadge, type ProviderBadgeSize, type ProviderBadgeType } from '@/components/ui/ProviderBadge';
import { UserHeaderCard } from '@/components/ui/UserHeaderCard';

export type ProviderBadgeItem = {
  type: ProviderBadgeType;
  size: ProviderBadgeSize;
  label: string;
  tooltip?: string;
};

export type ProviderCardItem = {
  id: string;
  badges: ProviderBadgeItem[];
  isVerified?: boolean;
  status: 'online' | 'offline';
  statusLabel: string;
  avatarUrl?: string | null;
  name: string;
  role: string;
  cityLabel?: string;
  rating: string;
  responseTime?: string;
  responseTimeLabel?: string;
  responseRate?: number;
  responseRateLabel?: string;
  aboutPreview?: string;
  reviewsCount: number;
  reviewsLabel: string;
  reviewPreview?: string;
  pricingLabel?: string;
  availabilityLabel?: string;
  servicePreview?: string[];
  ctaLabel: string;
  profileHref: string;
  reviewsHref: string;
};

type ProviderCardProps = {
  provider: ProviderCardItem;
  variant?: 'list' | 'grid';
  canToggleFavorite?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (providerId: string) => void;
  className?: string;
};

export function ProviderCard({
  provider,
  variant = 'list',
  canToggleFavorite = false,
  isFavorite = false,
  onToggleFavorite,
  className,
}: ProviderCardProps) {
  const primaryBadge = provider.badges[0] ?? null;
  const secondaryBadge = provider.badges[1] ?? null;
  const showCornerBadge = Boolean(primaryBadge);

  return (
    <div
      className={`provider-card ${variant === 'grid' ? 'is-grid' : 'is-list'} ${canToggleFavorite ? 'has-favorite-toggle' : ''} ${showCornerBadge ? 'has-corner-badge' : ''} ${className ?? ''}`.trim()}
    >
      <Link href={provider.profileHref} className="provider-card__overlay-link" aria-label={provider.name} />
      {canToggleFavorite ? (
        <button
          type="button"
          className={`provider-card__favorite request-card__favorite-btn ${isFavorite ? 'is-active' : ''}`}
          aria-label={`Favorite ${provider.name}`}
          onClick={() => onToggleFavorite?.(provider.id)}
        >
          <IconHeart />
        </button>
      ) : null}

      {showCornerBadge && primaryBadge ? (
        <div className="provider-badges provider-badges--corner">
          <ProviderBadge
            type={primaryBadge.type}
            size={primaryBadge.size}
            label={primaryBadge.label}
            tooltip={primaryBadge.tooltip}
          />
          {secondaryBadge ? (
            <ProviderBadge
              type={secondaryBadge.type}
              size={secondaryBadge.size}
              label={secondaryBadge.label}
              tooltip={secondaryBadge.tooltip}
            />
          ) : null}
        </div>
      ) : null}

      <UserHeaderCard
        className="provider-card__top"
        name={provider.name}
        avatarUrl={provider.avatarUrl}
        avatarRole="provider"
        hasProviderProfile
        isVerified={provider.isVerified}
        subtitle={provider.role}
        cityLabel={provider.cityLabel}
        responseTime={provider.responseTime}
        responseTimeLabel={provider.responseTimeLabel}
        responseRate={provider.responseRate}
        responseRateLabel={provider.responseRateLabel}
        status={provider.status}
        statusLabel={provider.statusLabel}
        rating={provider.rating}
        reviewsCount={provider.reviewsCount}
        reviewsLabel={provider.reviewsLabel}
        reviewsHref={provider.reviewsHref}
        reviewPreview={provider.reviewPreview}
        aboutPreview={provider.aboutPreview}
        ratingPlacement="avatar"
      />
    </div>
  );
}
