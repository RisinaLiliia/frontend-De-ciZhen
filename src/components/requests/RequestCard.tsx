// src/components/requests/RequestCard.tsx
'use client';

import Image from 'next/image';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Badge, type BadgeSize, type BadgeTone, type BadgeVariant } from '@/components/ui/Badge';
import { normalizeAppImageSrc, shouldBypassNextImageOptimization } from '@/lib/requests/images';

export type RequestCardBadge = {
  label: string;
  variant?: BadgeVariant;
  tone?: BadgeTone;
  size?: BadgeSize;
  className?: string;
  title?: string;
  ariaLabel?: string;
};

export type RequestCardProps = {
  href: string;
  badges: Array<string | RequestCardBadge>;
  className?: string;
  category: string;
  title: string;
  titleClassName?: string;
  excerpt?: string | null;
  excerptClassName?: string;
  meta: Array<React.ReactNode>;
  bottomMeta?: Array<React.ReactNode>;
  priceLabel: string;
  priceTrend?: 'up' | 'down' | null;
  priceTrendLabel?: string | null;
  isActive?: boolean;
  ariaLabel?: string;
  imageSrc?: string | null;
  imageAlt?: string;
  tags?: Array<React.ReactNode>;
  mode?: 'link' | 'static';
  topSlot?: React.ReactNode;
  statusSlot?: React.ReactNode;
  overlaySlot?: React.ReactNode;
  contentSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
  prefetch?: boolean;
  imagePriority?: boolean;
  imageQuality?: number;
  imageSizes?: string;
  hideFooterPrice?: boolean;
  mediaPlacement?: 'shell' | 'body';
  pricePlacement?: 'footer' | 'body';
  onOpen?: () => void;
};

export function RequestCard({
  href,
  badges,
  className,
  category,
  title,
  titleClassName,
  excerpt = null,
  excerptClassName,
  meta,
  bottomMeta = [],
  priceLabel,
  priceTrend = null,
  priceTrendLabel = null,
  isActive,
  ariaLabel,
  imageSrc,
  imageAlt,
  mode = 'link',
  topSlot,
  statusSlot,
  overlaySlot,
  contentSlot,
  actionSlot,
  prefetch = false,
  imagePriority = false,
  imageQuality = 62,
  imageSizes = '(max-width: 640px) 96px, (max-width: 1024px) 140px, 180px',
  hideFooterPrice = false,
  mediaPlacement = 'shell',
  pricePlacement = 'footer',
  onOpen,
}: RequestCardProps) {
  const router = useRouter();
  const hasImage = Boolean(imageSrc);
  const visibleBadges = badges
    .slice(0, 1)
    .map<RequestCardBadge>((badge) => (
      typeof badge === 'string'
        ? { label: badge, variant: 'neutral', tone: 'outline', size: 'sm' }
        : {
            size: 'sm',
            tone: 'soft',
            variant: 'neutral',
            ...badge,
          }
    ));
  const excerptText = excerpt?.trim() ?? '';
  const safeImageSrc = normalizeAppImageSrc(imageSrc);
  const shouldBypassOptimization = shouldBypassNextImageOptimization(safeImageSrc);
  const isLinkMode = mode === 'link';
  const usesInlineMedia = hasImage && mediaPlacement === 'body';
  const showsBodyPrice = !hideFooterPrice && pricePlacement === 'body';
  const showsFooterPrice = !hideFooterPrice && pricePlacement !== 'body';
  const hasInlineBadges = visibleBadges.length > 0 && !hasImage;
  const hasContentSection = hasInlineBadges || Boolean(contentSlot);
  const cardClassName = `request-card request-card--media-right request-card-link ${
    !hasImage ? 'request-card--no-media' : ''
  } ${usesInlineMedia ? 'request-card--media-inline' : ''} ${isActive ? 'is-active' : ''} ${isLinkMode ? 'request-card--link' : ''} ${className ?? ''}`.trim();
  const prefetchedRef = React.useRef(false);

  const isInteractiveTarget = React.useCallback((target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest('a,button,input,textarea,select,[role="button"],[data-card-action="true"]'),
    );
  }, []);

  const openCard = React.useCallback(() => {
    if (onOpen) {
      onOpen();
      return;
    }
    if (!href) return;
    router.push(href);
  }, [href, onOpen, router]);

  const prefetchCard = React.useCallback(() => {
    if (onOpen) return;
    if (!prefetch || !href || prefetchedRef.current) return;
    prefetchedRef.current = true;
    router.prefetch(href);
  }, [href, onOpen, prefetch, router]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (isInteractiveTarget(event.target)) return;
      openCard();
    },
    [isInteractiveTarget, openCard],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (isInteractiveTarget(event.target)) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openCard();
    },
    [isInteractiveTarget, openCard],
  );

  const mainCopyContent = (
    <>
      <div className="request-category-row">
        <div className="request-category">{category}</div>
        {statusSlot ? <span className="request-top__status">{statusSlot}</span> : null}
      </div>
      <div className={['request-card__title', titleClassName ?? ''].filter(Boolean).join(' ')}>
        {title}
      </div>
      <p
        className={['request-card__excerpt', excerptClassName ?? ''].filter(Boolean).join(' ')}
        title={excerptText || undefined}
        aria-hidden={excerptText ? undefined : true}
      >
        {excerptText}
      </p>

      <div className="request-card__meta">
        {meta.map((item, index) => {
          if (typeof item === 'string') {
            return (
              <span key={`${item}-${index}`} className="request-meta-item">
                {item}
              </span>
            );
          }
          if (
            React.isValidElement<{ 'data-meta-item'?: boolean }>(item) &&
            item.props?.['data-meta-item']
          ) {
            return <React.Fragment key={`node-${index}`}>{item}</React.Fragment>;
          }
          return (
            <span key={`node-${index}`} className="request-meta-item">
              {item}
            </span>
          );
        })}
      </div>

      {hasContentSection ? (
        <div className="request-card__content">
          {hasInlineBadges ? (
            <div className="request-badges" aria-hidden="true">
              {visibleBadges.map((badge) => (
                <Badge
                  key={badge.label}
                  variant={badge.variant}
                  tone={badge.tone}
                  size={badge.size}
                  className={badge.className}
                  title={badge.title}
                  aria-label={badge.ariaLabel}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          ) : null}
          {contentSlot}
        </div>
      ) : null}
      {showsBodyPrice ? (
        <div className="request-card__price">
          <span className="proof-price">{priceLabel}</span>
          {priceTrend ? (
            <span
              className={`request-card__price-trend ${
                priceTrend === 'down' ? 'is-down' : 'is-up'
              }`.trim()}
              title={priceTrendLabel ?? undefined}
            >
              <span aria-hidden="true">{priceTrend === 'down' ? '↓' : '↑'}</span>
              {priceTrendLabel ? <span>{priceTrendLabel}</span> : null}
            </span>
          ) : null}
          {bottomMeta.length ? (
            <span className="request-card__sub">
              {bottomMeta.map((item, index) => (
                <span key={`bottom-${index}`} className="meta-item">
                  {item}
                </span>
              ))}
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  const cardContent = (
    <>
      {overlaySlot ? <div className="request-card__overlay">{overlaySlot}</div> : null}
      {visibleBadges.length && hasImage ? (
        <div className="request-badges request-badges--media" aria-hidden="true">
          {visibleBadges.map((badge) => (
            <Badge
              key={badge.label}
              variant={badge.variant}
              tone={badge.tone}
              size={badge.size}
              className={badge.className}
              title={badge.title}
              aria-label={badge.ariaLabel}
            >
              {badge.label}
            </Badge>
          ))}
        </div>
      ) : null}
      {hasImage && !usesInlineMedia ? (
        <div className="request-card__media">
          <Image
            src={safeImageSrc}
            alt={imageAlt ?? ''}
            fill
            sizes={imageSizes}
            quality={imageQuality}
            priority={imagePriority}
            unoptimized={shouldBypassOptimization}
            className="request-card__image"
          />
        </div>
      ) : null}
      <div className="request-card__body">
        {topSlot ? <div className="request-card__top">{topSlot}</div> : null}
        {usesInlineMedia ? (
          <div className="request-card__main request-card__main--with-media">
            <div className="request-card__copy">{mainCopyContent}</div>
            <div className="request-card__media request-card__media--inline">
              <Image
                src={safeImageSrc}
                alt={imageAlt ?? ''}
                fill
                sizes={imageSizes}
                quality={imageQuality}
                priority={imagePriority}
                unoptimized={shouldBypassOptimization}
                className="request-card__image"
              />
            </div>
          </div>
        ) : (
          mainCopyContent
        )}

        {(actionSlot || showsFooterPrice || (bottomMeta.length && !showsBodyPrice)) ? (
          <div className="request-card__footer">
            {showsFooterPrice ? (
              <div className="request-card__price">
                <span className="proof-price">{priceLabel}</span>
                {priceTrend ? (
                  <span
                    className={`request-card__price-trend ${
                      priceTrend === 'down' ? 'is-down' : 'is-up'
                    }`.trim()}
                    title={priceTrendLabel ?? undefined}
                  >
                    <span aria-hidden="true">{priceTrend === 'down' ? '↓' : '↑'}</span>
                    {priceTrendLabel ? <span>{priceTrendLabel}</span> : null}
                  </span>
                ) : null}
                {bottomMeta.length ? (
                  <span className="request-card__sub">
                    {bottomMeta.map((item, index) => (
                      <span key={`bottom-${index}`} className="meta-item">
                        {item}
                      </span>
                    ))}
                  </span>
                ) : null}
              </div>
            ) : null}
            {actionSlot ? <div className="request-card__actions">{actionSlot}</div> : null}
          </div>
        ) : null}
      </div>
    </>
  );

  if (!isLinkMode) {
    return (
      <article className={cardClassName} aria-label={ariaLabel}>
        {cardContent}
      </article>
    );
  }

  return (
    <article
      className={cardClassName}
      aria-label={ariaLabel}
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerEnter={prefetchCard}
      onFocus={prefetchCard}
    >
      {cardContent}
    </article>
  );
}
