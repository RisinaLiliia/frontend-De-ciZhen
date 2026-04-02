import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { RatingSummary } from '@/components/ui/RatingSummary';
import { StatusDot } from '@/components/ui/StatusDot';
import { LocationMeta } from '@/components/ui/LocationMeta';
import { ProviderDecisionMetrics } from '@/components/ui/ProviderDecisionMetrics';
import { IconCalendar, IconCheck } from '@/components/ui/icons/icons';
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
  availabilityDatePrefix?: string;
  availabilityDateLabel?: string;
  availabilityDateIso?: string;
  pricingPrefixLabel?: string;
  pricingValueLabel?: string;
  pricingSuffixLabel?: string;
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
  aboutPreview,
  availabilityDatePrefix,
  availabilityDateLabel,
  availabilityDateIso,
  pricingPrefixLabel,
  pricingValueLabel,
  pricingSuffixLabel,
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
  const aboutText = aboutPreview?.trim() || '';
  const reviewText = reviewPreview?.trim() || '';
  const hasStructuredInsights = Boolean(availabilityDateLabel || pricingValueLabel);
  const cityNode = cityLabel ? <LocationMeta label={cityLabel} className="provider-avatar-city" /> : null;
  const isInlineProofLayout = ratingPlacement === 'avatar';
  const metaRow = isInlineProofLayout ? (
    <div className="provider-main__meta-row">
      {cityNode ? <span className="provider-main__meta-location">{cityNode}</span> : null}
      <ProviderDecisionMetrics
        responseTime={responseTime}
        responseRate={responseRate}
        responseTimeLabel={undefined}
        responseRateLabel={undefined}
        className="provider-main__meta-metrics"
      />
    </div>
  ) : null;
  const numericRating = Number(rating);
  const clampedRating = Number.isFinite(numericRating)
    ? Math.max(0, Math.min(5, numericRating))
    : 0;
  const starsFillWidth = `${(clampedRating / 5) * 100}%`;
  const ratingNode = showRating ? (
    <RatingSummary
      rating={rating}
      reviewsCount={reviewsCount}
      reviewsLabel={reviewsLabel}
      href={reviewsHref}
      className="provider-rating-summary"
    />
  ) : null;
  const reviewsNode = reviewsHref ? (
    <Link href={reviewsHref} prefetch={false} className="provider-main__trust-reviews">
      {reviewsCount} {reviewsLabel}
    </Link>
  ) : (
    <span className="provider-main__trust-reviews">
      {reviewsCount} {reviewsLabel}
    </span>
  );
  const trustBlock = isInlineProofLayout && showRating ? (
    <div className="provider-main__trust">
      <div className="provider-main__trust-top">
        <div className="provider-main__trust-rating" aria-label={`${rating} out of 5`}>
          <span className="rating-summary__stars" aria-hidden="true">
            <span className="rating-summary__stars-base">★★★★★</span>
            <span className="rating-summary__stars-fill" style={{ width: starsFillWidth }}>
              ★★★★★
            </span>
          </span>
          <span className="rating-summary__value">{rating}</span>
          {reviewsNode}
        </div>
        <p
          className="provider-main-review provider-rating-review provider-main__trust-quote"
          title={reviewText || undefined}
          aria-hidden={reviewText ? undefined : true}
        >
          {reviewText ? `“${reviewText}”` : ''}
        </p>
      </div>
    </div>
  ) : null;
  const proofRow = (
    <div className="provider-main__proof">
      <div className="provider-main__proof-review">
        <p
          className="provider-main-review provider-rating-review"
          title={reviewText || undefined}
          aria-hidden={reviewText ? undefined : true}
        >
          {reviewText ? `“${reviewText}”` : ''}
        </p>
      </div>
    </div>
  );
  const aboutRow = (
    <p
      className="provider-main__about request-card__excerpt"
      title={aboutText || undefined}
      aria-hidden={aboutText ? undefined : true}
    >
      {aboutText}
    </p>
  );
  const availabilityRow = hasStructuredInsights ? (
    <div className="provider-main__detail-row provider-main__detail-row--availability">
      <span className="provider-main__detail-icon" aria-hidden="true">
        <IconCalendar />
      </span>
      <span className="provider-main__detail-text request-detail__availability-date">
        {availabilityDatePrefix ? (
          <span className="request-detail__availability-date-prefix">{availabilityDatePrefix}:</span>
        ) : null}
        {availabilityDateIso ? (
          <time dateTime={availabilityDateIso}>{availabilityDateLabel}</time>
        ) : (
          <span>{availabilityDateLabel}</span>
        )}
      </span>
    </div>
  ) : null;
  const priceRow = hasStructuredInsights ? (
    <div className="provider-main__detail-row provider-main__detail-row--price">
      <span className="provider-main__detail-text provider-main__detail-text--price">
        {pricingPrefixLabel ? <span className="request-detail__price-prefix">{pricingPrefixLabel}</span> : null}
        {pricingValueLabel ? <span className="proof-price">{pricingValueLabel}</span> : null}
        {pricingSuffixLabel ? <span className="request-detail__price-suffix">{pricingSuffixLabel}</span> : null}
      </span>
    </div>
  ) : null;
  const footerRow = hasStructuredInsights ? (
    <div className="provider-main__footer-row">
      {availabilityRow}
      {priceRow}
    </div>
  ) : null;
  const mainContent = (
    <div className="provider-main">
      <div className="provider-sub-row provider-main__eyebrow">
        {subtitle ? <p className="provider-sub request-category">{subtitle}</p> : null}
        {secondaryBadge ? <span className="provider-sub-row__badge">{secondaryBadge}</span> : null}
      </div>
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
      {isInlineProofLayout ? (
        metaRow
      ) : (
        <>
          <div className="provider-main__city">{cityNode}</div>
          <div className="provider-main__metrics">
            <ProviderDecisionMetrics
              responseTime={responseTime}
              responseRate={responseRate}
              responseTimeLabel={responseTimeLabel}
              responseRateLabel={responseRateLabel}
            />
          </div>
        </>
      )}
      {aboutRow}
      {!isInlineProofLayout ? proofRow : null}
      {!isInlineProofLayout && showRating ? (
        <div className="provider-rating-stack">
          {ratingNode}
        </div>
      ) : null}
      {!isInlineProofLayout ? footerRow : null}
    </div>
  );
  const mainRow = (
    <div className="provider-card-layout__main-row">
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
      </div>
      {mainContent}
    </div>
  );

  const card = isInlineProofLayout ? (
    <div className="provider-info user-header-card user-header-card--provider-card">
      {mainRow}
      {trustBlock}
      {footerRow}
    </div>
  ) : adaptiveDesktop ? (
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
        </div>
        {mainContent}
      </div>
      {showRating ? (
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
      </div>
      {mainContent}
    </div>
  );

  if (href) {
    return (
      <Link href={href} prefetch={false} className={`user-header-card__link ${className ?? ''}`.trim()}>
        {card}
      </Link>
    );
  }

  return <div className={className}>{card}</div>;
}
