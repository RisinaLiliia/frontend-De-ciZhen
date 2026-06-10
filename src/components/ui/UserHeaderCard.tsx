import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { RatingSummary } from '@/components/ui/RatingSummary';
import { StatusDot } from '@/components/ui/StatusDot';
import { LocationMeta } from '@/components/ui/LocationMeta';
import { ProfileDecisionMetrics } from '@/components/ui/ProfileDecisionMetrics';
import { IconCalendar, IconCheck } from '@/components/ui/icons/icons';
import { buildApiUrl } from '@/lib/api/url';
import { getUserDominantMode, type UserDominantStats } from '@/lib/users/dominantMode';

type UserHeaderCardProps = {
  name: string;
  avatarUrl?: string | null;
  avatarOverlay?: ReactNode;
  avatarTopSlot?: ReactNode;
  eyebrowLeading?: ReactNode;
  subtitle?: string;
  secondaryBadge?: ReactNode;
  headerAction?: ReactNode;
  cityLabel?: string;
  responseTime?: string;
  responseTimeLabel?: string;
  responseRate?: number;
  responseRateLabel?: string;
  showInlineMetricLabels?: boolean;
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
  layoutVariant?: 'default' | 'detail';
  isVerified?: boolean;
  className?: string;
};

export function UserHeaderCard({
  name,
  avatarUrl,
  avatarOverlay,
  avatarTopSlot,
  eyebrowLeading,
  subtitle,
  secondaryBadge,
  headerAction,
  cityLabel,
  responseTime,
  responseTimeLabel,
  responseRate,
  responseRateLabel,
  showInlineMetricLabels = false,
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
  layoutVariant = 'default',
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
    'profile-avatar',
    safeAvatarUrl ? '' : 'profile-avatar--placeholder',
    !safeAvatarUrl && resolvedAvatarRole === 'client' ? 'profile-avatar--placeholder-client' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const aboutText = aboutPreview?.trim() || '';
  const reviewText = reviewPreview?.trim() || '';
  const hasStructuredInsights = Boolean(availabilityDateLabel || pricingValueLabel);
  const cityNode = cityLabel ? <LocationMeta label={cityLabel} className="profile-city" /> : null;
  const hasEyebrowContent = Boolean(eyebrowLeading || subtitle || secondaryBadge);
  const hasMetaContent = Boolean(cityNode || responseTime || typeof responseRate === 'number');
  const hasAboutContent = Boolean(aboutText);
  const hasReviewContent = Boolean(reviewText);
  const isInlineProofLayout = ratingPlacement === 'avatar';
  const metaRow = isInlineProofLayout ? (
    <div className="profile-main__meta-row">
      {cityNode ? <span className="profile-main__meta-location">{cityNode}</span> : null}
      <ProfileDecisionMetrics
        responseTime={responseTime}
        responseRate={responseRate}
        responseTimeLabel={showInlineMetricLabels ? responseTimeLabel : undefined}
        responseRateLabel={showInlineMetricLabels ? responseRateLabel : undefined}
        className="profile-main__meta-metrics"
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
      className="profile-rating-summary"
    />
  ) : null;
  const reviewsNode = reviewsHref ? (
    <Link href={reviewsHref} prefetch={false} className="profile-main__trust-reviews">
      {reviewsCount} {reviewsLabel}
    </Link>
  ) : (
    <span className="profile-main__trust-reviews">
      {reviewsCount} {reviewsLabel}
    </span>
  );
  const trustBlock =
    isInlineProofLayout && showRating ? (
      <div className="profile-main__trust">
        <div className="profile-main__trust-top">
          <div className="profile-main__trust-rating" aria-label={`${rating} out of 5`}>
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
            className="profile-main-review profile-rating-review profile-main__trust-quote"
            title={reviewText || undefined}
            aria-hidden={reviewText ? undefined : true}
          >
            {reviewText ? `“${reviewText}”` : ''}
          </p>
        </div>
      </div>
    ) : null;
  const proofRow = (
    <div className="profile-main__proof">
      <div className="profile-main__proof-review">
        <p
          className="profile-main-review profile-rating-review"
          title={reviewText || undefined}
          aria-hidden={reviewText ? undefined : true}
        >
          {hasReviewContent ? `“${reviewText}”` : ''}
        </p>
      </div>
    </div>
  );
  const aboutRow = (
    <p
      className="profile-main__about profile-main__excerpt"
      title={aboutText || undefined}
      aria-hidden={aboutText ? undefined : true}
    >
      {hasAboutContent ? aboutText : ''}
    </p>
  );
  const availabilityRow = hasStructuredInsights ? (
    <div className="profile-main__detail-row profile-main__detail-row--availability">
      <span className="profile-main__detail-icon" aria-hidden="true">
        <IconCalendar />
      </span>
      <span className="profile-main__detail-text profile-main__availability">
        {availabilityDatePrefix ? (
          <span className="profile-main__availability-prefix">{availabilityDatePrefix}:</span>
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
    <div className="profile-main__detail-row profile-main__detail-row--price">
      <span className="profile-main__detail-text profile-main__detail-text--price">
        {pricingPrefixLabel ? (
          <span className="profile-main__price-prefix">{pricingPrefixLabel}</span>
        ) : null}
        {pricingValueLabel ? <span className="proof-price">{pricingValueLabel}</span> : null}
        {pricingSuffixLabel ? (
          <span className="profile-main__price-suffix">{pricingSuffixLabel}</span>
        ) : null}
      </span>
    </div>
  ) : null;
  const footerRow = hasStructuredInsights ? (
    <div className="profile-main__footer-row">
      {availabilityRow}
      {priceRow}
    </div>
  ) : null;
  const avatarNode = (
    <div className="profile-avatar-stack">
      {avatarTopSlot ? <div className="profile-avatar-stack__top">{avatarTopSlot}</div> : null}
      <div className="profile-avatar-wrap">
        <span className={avatarClass}>
          {safeAvatarUrl ? (
            <Image src={safeAvatarUrl} alt={name} width={80} height={80} />
          ) : (
            avatarInitial
          )}
        </span>
        {avatarOverlay}
        {status && statusLabel ? <StatusDot status={status} label={statusLabel} /> : null}
      </div>
    </div>
  );
  const mainContent = (
    <div className="profile-main">
      {hasEyebrowContent ? (
        <div className="profile-sub-row profile-main__eyebrow">
          <div className="profile-sub-row__main">
            {eyebrowLeading ? (
              <span className="profile-sub-row__leading">{eyebrowLeading}</span>
            ) : null}
            {subtitle ? <p className="profile-subtitle">{subtitle}</p> : null}
          </div>
          {secondaryBadge ? <span className="profile-sub-row__badge">{secondaryBadge}</span> : null}
        </div>
      ) : null}
      <p className="profile-name">
        <span>{name}</span>
        {isVerified ? (
          <span
            className={`profile-verified-icon ${status === 'online' ? 'is-online' : ''}`.trim()}
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
          {cityNode ? <div className="profile-main__city">{cityNode}</div> : null}
          {hasMetaContent ? (
            <div className="profile-main__metrics">
              <ProfileDecisionMetrics
                responseTime={responseTime}
                responseRate={responseRate}
                responseTimeLabel={responseTimeLabel}
                responseRateLabel={responseRateLabel}
              />
            </div>
          ) : null}
        </>
      )}
      {hasAboutContent ? aboutRow : null}
      {!isInlineProofLayout && hasReviewContent ? proofRow : null}
      {!isInlineProofLayout && showRating && !adaptiveDesktop ? (
        <div className="profile-rating-stack">{ratingNode}</div>
      ) : null}
      {!isInlineProofLayout ? footerRow : null}
    </div>
  );
  const mainRow = (
    <div className="profile-card-layout__main-row user-header-card__main-row">
      {avatarNode}
      {mainContent}
    </div>
  );
  const detailVariantClasses =
    layoutVariant === 'detail'
      ? [
          'user-header-card--detail',
          resolvedAvatarRole === 'provider'
            ? 'user-header-card--detail-provider'
            : 'user-header-card--detail-client',
        ]
      : [];

  const card = isInlineProofLayout ? (
    <div
      className={[
        'profile-card',
        'user-header-card',
        'user-header-card--inline-proof',
        ...detailVariantClasses,
      ].join(' ')}
    >
      {headerAction ? <div className="user-header-card__header-action">{headerAction}</div> : null}
      {mainRow}
      {trustBlock}
      {footerRow}
    </div>
  ) : adaptiveDesktop ? (
    <div
      className={[
        'profile-card',
        'user-header-card',
        'user-header-card--adaptive',
        ...detailVariantClasses,
      ].join(' ')}
    >
      {headerAction ? <div className="user-header-card__header-action">{headerAction}</div> : null}
      <div className="user-header-card__identity">
        {avatarNode}
        {mainContent}
      </div>
      {showRating ? (
        <div className="profile-rating-stack user-header-card__rating">{ratingNode}</div>
      ) : null}
    </div>
  ) : (
    <div className={['profile-card', 'user-header-card', ...detailVariantClasses].join(' ')}>
      {headerAction ? <div className="user-header-card__header-action">{headerAction}</div> : null}
      {avatarNode}
      {mainContent}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        prefetch={false}
        className={`user-header-card__link ${className ?? ''}`.trim()}
      >
        {card}
      </Link>
    );
  }

  return <div className={className}>{card}</div>;
}
