import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { RatingSummary } from '@/components/ui/RatingSummary';
import { StatusDot } from '@/components/ui/StatusDot';
import { LocationMeta } from '@/components/ui/LocationMeta';
import { ProviderDecisionMetrics } from '@/components/ui/ProviderDecisionMetrics';
import { IconCheck } from '@/components/ui/icons/icons';
import { buildApiUrl } from '@/lib/api/url';
import { getUserDominantMode, type UserDominantStats } from '@/lib/users/dominantMode';

type UserHeaderCardProps = {
  name: string;
  avatarUrl?: string | null;
  subtitle?: string;
  secondaryBadge?: ReactNode;
  cityLabel?: string;
  responseTime?: string;
  responseTimeLabel?: string;
  responseRate?: number;
  responseRateLabel?: string;
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
  reviewPreview?: string;
  aboutPreview?: string;
  showRating?: boolean;
  ratingPlacement?: 'main' | 'avatar';
  isVerified?: boolean;
  className?: string;
};

export function UserHeaderCard({
  name,
  avatarUrl,
  subtitle,
  secondaryBadge,
  cityLabel,
  responseTime,
  responseTimeLabel,
  responseRate,
  responseRateLabel,
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
  reviewPreview,
  showRating = true,
  ratingPlacement = 'main',
  isVerified = false,
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
  const reviewText = reviewPreview?.trim();
  const cityNode = cityLabel ? <LocationMeta label={cityLabel} className="provider-avatar-city" /> : null;
  const reviewNode = reviewText ? (
    <p className="provider-main-review request-card__excerpt" title={reviewText}>
      &ldquo;{reviewText}
    </p>
  ) : null;
  const ratingNode = showRating ? (
    <RatingSummary
      rating={rating}
      reviewsCount={reviewsCount}
      reviewsLabel={reviewsLabel}
      href={reviewsHref}
      className="provider-rating-summary"
    />
  ) : null;

  const card = adaptiveDesktop ? (
    <div className="provider-info user-header-card user-header-card--adaptive">
      <div className="user-header-card__identity">
        <div className="provider-avatar-stack">
          <div className="provider-avatar-wrap">
            <span className={avatarClass}>
              {safeAvatarUrl ? (
                <Image src={safeAvatarUrl} alt={name} width={48} height={48} />
              ) : (
                avatarInitial
              )}
            </span>
            {status && statusLabel ? <StatusDot status={status} label={statusLabel} /> : null}
          </div>
          {ratingPlacement === 'avatar' ? ratingNode : null}
        </div>
        <div className="provider-main">
          {subtitle || secondaryBadge ? (
            <div className="provider-sub-row">
              {subtitle ? <p className="provider-sub request-category">{subtitle}</p> : null}
              {secondaryBadge ? <span className="provider-sub-row__badge">{secondaryBadge}</span> : null}
            </div>
          ) : null}
          <p className="provider-name">
            <span>{name}</span>
            {isVerified ? (
              <span
                className={`provider-verified-icon ${status === 'online' ? 'is-online' : ''}`.trim()}
                title="Verified"
                aria-hidden="true"
              >
                <IconCheck />
              </span>
            ) : null}
            {isVerified ? <span className="sr-only">Verified</span> : null}
          </p>
          {cityNode}
          <ProviderDecisionMetrics
            responseTime={responseTime}
            responseRate={responseRate}
            responseTimeLabel={responseTimeLabel}
            responseRateLabel={responseRateLabel}
          />
          {reviewNode}
        </div>
      </div>
      {ratingPlacement !== 'avatar' ? (
        <div className="provider-rating-stack user-header-card__rating">
          {ratingNode}
        </div>
      ) : null}
    </div>
  ) : (
    <div className="provider-info user-header-card">
      <div className="provider-avatar-stack">
        <div className="provider-avatar-wrap">
          <span className={avatarClass}>
          {safeAvatarUrl ? (
            <Image src={safeAvatarUrl} alt={name} width={48} height={48} />
          ) : (
            avatarInitial
          )}
          </span>
          {status && statusLabel ? <StatusDot status={status} label={statusLabel} /> : null}
        </div>
        {ratingPlacement === 'avatar' ? ratingNode : null}
      </div>
      <div className="provider-main">
        {subtitle || secondaryBadge ? (
          <div className="provider-sub-row">
            {subtitle ? <p className="provider-sub request-category">{subtitle}</p> : null}
            {secondaryBadge ? <span className="provider-sub-row__badge">{secondaryBadge}</span> : null}
          </div>
        ) : null}
        <p className="provider-name">
          <span>{name}</span>
          {isVerified ? (
            <span
              className={`provider-verified-icon ${status === 'online' ? 'is-online' : ''}`.trim()}
              title="Verified"
              aria-hidden="true"
            >
              <IconCheck />
            </span>
          ) : null}
          {isVerified ? <span className="sr-only">Verified</span> : null}
        </p>
        {cityNode}
        <ProviderDecisionMetrics
          responseTime={responseTime}
          responseRate={responseRate}
          responseTimeLabel={responseTimeLabel}
          responseRateLabel={responseRateLabel}
        />
        {reviewNode}
        {ratingPlacement !== 'avatar' && showRating ? (
          <div className="provider-rating-stack">
            {ratingNode}
          </div>
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
