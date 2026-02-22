import Link from 'next/link';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import { IconHeart } from '@/components/ui/icons/icons';
import { UserHeaderCard } from '@/components/ui/UserHeaderCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

export type TopProviderItem = {
  id: string;
  badges: string[];
  status: 'online' | 'offline';
  statusLabel: string;
  avatarLetter: string;
  avatarUrl?: string | null;
  name: string;
  role: string;
  rating: string;
  responseTime?: string;
  responseTimeLabel?: string;
  reviewsCount: number;
  reviewsLabel: string;
  ctaLabel: string;
  profileHref: string;
  reviewsHref: string;
};

type TopProvidersPanelProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  providers: ReadonlyArray<TopProviderItem>;
  className?: string;
  favoriteProviderIds?: Set<string>;
  onToggleFavorite?: (providerId: string) => void;
};

export function TopProvidersPanel({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  providers,
  className,
  favoriteProviderIds,
  onToggleFavorite,
}: TopProvidersPanelProps) {
  return (
    <Card className={`hide-mobile top-providers-panel ${className ?? ''}`.trim()}>
      <CardHeader className="home-panel-header">
        <div className="home-panel-heading">
          <CardTitle className="home-panel-title">{title}</CardTitle>
          <p className="home-panel-subtitle">{subtitle}</p>
        </div>
      </CardHeader>
      <div className="provider-list">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className={`provider-card ${onToggleFavorite ? 'has-favorite-toggle' : ''}`.trim()}
          >
            {onToggleFavorite ? (
              <button
                type="button"
                className={`provider-card__favorite ${favoriteProviderIds?.has(provider.id) ? 'is-active' : ''}`}
                aria-label={provider.name}
                onClick={() => onToggleFavorite(provider.id)}
              >
                <IconHeart />
              </button>
            ) : null}
            {provider.badges.length ? (
              <div className="provider-badges provider-badges--corner">
                {provider.badges.map((badge, index) => (
                  <span key={`${provider.id}-badge-${index}`} className="provider-badge">
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}
            <UserHeaderCard
              name={provider.name}
              avatarUrl={provider.avatarUrl}
              hasProviderProfile
              subtitle={provider.role}
              responseTime={provider.responseTime}
              responseTimeLabel={provider.responseTimeLabel}
              status={provider.status}
              statusLabel={provider.statusLabel}
              rating={provider.rating}
              reviewsCount={provider.reviewsCount}
              reviewsLabel={provider.reviewsLabel}
              reviewsHref={provider.reviewsHref}
            />
            <Link href={provider.profileHref} className="top-providers__cta home-cta provider-cta">
              {provider.ctaLabel}
            </Link>
          </div>
        ))}
      </div>

      <div className="top-providers-footer flex justify-center">
        <MoreDotsLink href={ctaHref} label={ctaLabel} />
      </div>
    </Card>
  );
}
