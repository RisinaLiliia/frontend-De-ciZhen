import Image from 'next/image';
import Link from 'next/link';

import { RatingSummary } from '@/components/ui/RatingSummary';
import { StatusDot } from '@/components/ui/StatusDot';
import { buildApiUrl } from '@/lib/api/url';
import { getUserDominantMode, type UserDominantStats } from '@/lib/users/dominantMode';

type UserHeaderCardProps = {
  name: string;
  avatarUrl?: string | null;
  subtitle?: string;
  href?: string | null;
  avatarRole?: 'provider' | 'client';
  stats?: UserDominantStats;
  hasProviderProfile?: boolean;
  adaptiveDesktop?: boolean;
  status?: 'online' | 'offline';
  statusLabel?: string;
  rating: string | number;
  reviewsCount: number;
  reviewsLabel: string;
  reviewsHref?: string;
  showRating?: boolean;
  className?: string;
};

export function UserHeaderCard({
  name,
  avatarUrl,
  subtitle,
  href,
  avatarRole,
  stats,
  hasProviderProfile,
  adaptiveDesktop = false,
  status,
  statusLabel,
  rating,
  reviewsCount,
  reviewsLabel,
  reviewsHref,
  showRating = true,
  className,
}: UserHeaderCardProps) {
  const avatarInitial = (name.trim().charAt(0) || 'U').toUpperCase();
  const safeAvatarUrl = (() => {
    const raw = avatarUrl?.trim();
    if (!raw) return null;

    // Backend default placeholder is often not publicly available in Next assets.
    if (raw === '/avatars/default.png' || raw.endsWith('/avatars/default.png')) return null;

    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:image/')) {
      return raw;
    }

    if (raw.startsWith('/')) return raw.startsWith('/api/') ? raw : buildApiUrl(raw);
    return raw;
  })();

  const resolvedAvatarRole = avatarRole ?? getUserDominantMode(stats, hasProviderProfile);

  const avatarClass = [
    'provider-avatar',
    safeAvatarUrl ? '' : 'provider-avatar--placeholder',
    !safeAvatarUrl && resolvedAvatarRole === 'client' ? 'provider-avatar--placeholder-client' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const card = adaptiveDesktop ? (
    <div className="provider-info user-header-card user-header-card--adaptive">
      <div className="user-header-card__identity">
        <div className="provider-avatar-wrap">
          <span className={avatarClass}>
            {safeAvatarUrl ? (
              <Image src={safeAvatarUrl} alt={name} width={52} height={52} />
            ) : (
              avatarInitial
            )}
          </span>
          {status && statusLabel ? <StatusDot status={status} label={statusLabel} /> : null}
        </div>
        <div className="provider-main">
          <p className="provider-name">{name}</p>
          {subtitle ? <p className="provider-sub">{subtitle}</p> : null}
        </div>
      </div>
      {showRating ? (
        <RatingSummary
          rating={rating}
          reviewsCount={reviewsCount}
          reviewsLabel={reviewsLabel}
          href={reviewsHref}
          className="provider-rating-summary user-header-card__rating"
        />
      ) : null}
    </div>
  ) : (
    <div className="provider-info user-header-card">
      <div className="provider-avatar-wrap">
        <span className={avatarClass}>
          {safeAvatarUrl ? (
            <Image src={safeAvatarUrl} alt={name} width={52} height={52} />
          ) : (
            avatarInitial
          )}
        </span>
        {status && statusLabel ? <StatusDot status={status} label={statusLabel} /> : null}
      </div>
      <div className="provider-main">
        <p className="provider-name">{name}</p>
        {subtitle ? <p className="provider-sub">{subtitle}</p> : null}
        {showRating ? (
          <RatingSummary
            rating={rating}
            reviewsCount={reviewsCount}
            reviewsLabel={reviewsLabel}
            href={reviewsHref}
            className="provider-rating-summary"
          />
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={`user-header-card__link ${className ?? ''}`.trim()}>
        {card}
      </Link>
    );
  }

  return <div className={className}>{card}</div>;
}
