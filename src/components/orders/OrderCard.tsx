// src/components/orders/OrderCard.tsx
import Link from 'next/link';
import Image from 'next/image';

export type OrderCardProps = {
  href: string;
  dateLabel: string;
  badges: string[];
  category: string;
  title: string;
  meta: Array<React.ReactNode>;
  bottomMeta?: Array<React.ReactNode>;
  priceLabel: string;
  inlineCta?: string;
  isActive?: boolean;
  ariaLabel?: string;
  imageSrc?: string | null;
  imageAlt?: string;
  tags?: Array<React.ReactNode>;
};

export function OrderCard({
  href,
  dateLabel,
  badges,
  category,
  title,
  meta,
  bottomMeta = [],
  priceLabel,
  inlineCta,
  isActive,
  ariaLabel,
  imageSrc,
  imageAlt,
}: OrderCardProps) {
  const hasImage = Boolean(imageSrc);
  const safeImageSrc = imageSrc ?? '';
  return (
    <Link
      href={href}
      aria-label={ariaLabel ?? title}
      className={`request-card request-card--link request-card--media-right order-card-link ${
        !hasImage ? 'request-card--no-media' : ''
      } ${isActive ? 'is-active' : ''}`}
    >
      {badges.length ? (
        <div className="order-badges order-badges--edge" aria-hidden="true">
          {badges.map((badge) => (
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
        <div className="order-top">
          <span className="order-date">
            <span className="order-live-dot" aria-hidden="true" />
            {dateLabel}
          </span>
        </div>

        <div className="order-category">{category}</div>
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

        <div className="request-card__price">
          <span className="proof-price">{priceLabel}</span>
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

        {inlineCta ? (
          <span className="request-card__cta" aria-hidden="true">
            {inlineCta} →
          </span>
        ) : null}
      </div>
    </Link>
  );
}
