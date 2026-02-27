// src/components/orders/OrderCard.tsx
'use client';

import Image from 'next/image';
import * as React from 'react';
import { useRouter } from 'next/navigation';

export type OrderCardProps = {
  href: string;
  badges: string[];
  category: string;
  title: string;
  excerpt?: string | null;
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
  statusSlot?: React.ReactNode;
  overlaySlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
  prefetch?: boolean;
};

export function OrderCard({
  href,
  badges,
  category,
  title,
  excerpt = null,
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
  statusSlot,
  overlaySlot,
  actionSlot,
  prefetch = false,
}: OrderCardProps) {
  const router = useRouter();
  const hasImage = Boolean(imageSrc);
  const visibleBadges = badges.slice(0, 1);
  const safeImageSrc = imageSrc ?? '';
  const isLinkMode = mode === 'link';
  const cardClassName = `request-card request-card--media-right order-card-link ${
    !hasImage ? 'request-card--no-media' : ''
  } ${isActive ? 'is-active' : ''} ${isLinkMode ? 'request-card--link' : ''}`.trim();

  const isInteractiveTarget = React.useCallback((target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest('a,button,input,textarea,select,[role=\"button\"],[data-card-action=\"true\"]'),
    );
  }, []);

  const openCard = React.useCallback(() => {
    if (!href) return;
    router.push(href);
  }, [href, router]);

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

  const cardContent = (
    <>
      {overlaySlot ? <div className="request-card__overlay">{overlaySlot}</div> : null}
      {visibleBadges.length && hasImage ? (
        <div className="order-badges order-badges--media" aria-hidden="true">
          {visibleBadges.map((badge) => (
            <span key={badge} className="order-badge">
              {badge}
            </span>
          ))}
        </div>
      ) : null}
      {hasImage ? (
        <div className="request-card__media">
          <Image
            src={safeImageSrc}
            alt={imageAlt ?? category}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="request-card__image"
          />
        </div>
      ) : null}
      <div className="request-card__body">
        <div className="order-category-row">
          <div className="order-category">{category}</div>
          {statusSlot ? <span className="order-top__status">{statusSlot}</span> : null}
        </div>
        <div className="request-card__title">{title}</div>
        {excerpt ? <p className="request-card__excerpt">{excerpt}</p> : null}

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

        {visibleBadges.length && !hasImage ? (
          <div className="order-badges" aria-hidden="true">
            {visibleBadges.map((badge) => (
              <span key={badge} className="order-badge">
                {badge}
              </span>
            ))}
          </div>
        ) : null}

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

        {actionSlot ? <div className="request-card__actions">{actionSlot}</div> : null}
      </div>
    </>
  );

  return (
    <article
      className={cardClassName}
      aria-label={ariaLabel ?? title}
      role={isLinkMode ? 'link' : undefined}
      tabIndex={isLinkMode ? 0 : undefined}
      onClick={isLinkMode ? handleClick : undefined}
      onKeyDown={isLinkMode ? handleKeyDown : undefined}
      data-prefetch={prefetch ? 'true' : 'false'}
    >
      {cardContent}
    </article>
  );
}
