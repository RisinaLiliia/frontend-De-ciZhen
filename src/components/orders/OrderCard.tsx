// src/components/orders/OrderCard.tsx
import Link from 'next/link';
import Image from 'next/image';

export type OrderCardProps = {
  href: string;
  badges: string[];
  category: string;
  title: string;
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
  const hasImage = Boolean(imageSrc);
  const visibleBadges = badges.slice(0, 1);
  const safeImageSrc = imageSrc ?? '';
  const cardClassName = `request-card request-card--media-right order-card-link ${
    !hasImage ? 'request-card--no-media' : ''
  } ${isActive ? 'is-active' : ''}`.trim();
  const isLinkMode = mode === 'link';

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

        <div className="request-card__meta">
          {meta.map((item, index) =>
            typeof item === 'string' ? (
              <span key={`${item}-${index}`} className="request-meta-item">
                {item}
              </span>
            ) : (
              <span key={`node-${index}`} className="request-meta-item">
                {item}
              </span>
            ),
          )}
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

  if (isLinkMode) {
    return (
      <Link href={href} prefetch={prefetch} aria-label={ariaLabel ?? title} className={`${cardClassName} request-card--link`}>
        {cardContent}
      </Link>
    );
  }

  return (
    <article className={cardClassName} aria-label={ariaLabel ?? title}>
      {cardContent}
    </article>
  );
}
