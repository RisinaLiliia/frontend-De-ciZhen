import Link from 'next/link';
import { UserHeaderCard } from '@/components/ui/UserHeaderCard';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { ProviderBadgeGroup, type ProviderBadgeItem } from '@/components/providers/ProviderBadgeGroup';

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
  availabilityDatePrefix?: string;
  availabilityDateLabel?: string;
  availabilityDateIso?: string;
  pricingPrefixLabel?: string;
  pricingValueLabel?: string;
  pricingSuffixLabel?: string;
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
  isFavoritePending?: boolean;
  favoriteAriaLabel?: string;
  onToggleFavorite?: (providerId: string) => void;
  className?: string;
};

export function ProviderCard({
  provider,
  variant = 'list',
  canToggleFavorite = false,
  isFavorite = false,
  isFavoritePending = false,
  favoriteAriaLabel,
  onToggleFavorite,
  className,
}: ProviderCardProps) {
  const favoriteSlot = canToggleFavorite ? (
    <FavoriteButton
      className="provider-card__favorite"
      variant="icon"
      isFavorite={isFavorite}
      isPending={isFavoritePending}
      ariaLabel={favoriteAriaLabel ?? `Favorite ${provider.name}`}
      onToggle={() => onToggleFavorite?.(provider.id)}
    />
  ) : null;
  const badgeSlot = <ProviderBadgeGroup providerId={provider.id} badges={provider.badges} />;

  return (
    <div
      className={`provider-card app-card workspace-list-card ${variant === 'grid' ? 'is-grid' : 'is-list'} ${canToggleFavorite ? 'has-favorite-toggle' : ''} ${className ?? ''}`.trim()}
    >
      <Link
        href={provider.profileHref}
        prefetch={false}
        className="provider-card__overlay-link"
        aria-label={provider.name}
      />
      <UserHeaderCard
        className="provider-card__top"
        name={provider.name}
        avatarUrl={provider.avatarUrl}
        avatarTopSlot={favoriteSlot}
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
        availabilityDatePrefix={provider.availabilityDatePrefix}
        availabilityDateLabel={provider.availabilityDateLabel}
        availabilityDateIso={provider.availabilityDateIso}
        pricingPrefixLabel={provider.pricingPrefixLabel}
        pricingValueLabel={provider.pricingValueLabel}
        pricingSuffixLabel={provider.pricingSuffixLabel}
        ratingPlacement="avatar"
        secondaryBadge={badgeSlot}
      />
    </div>
  );
}
