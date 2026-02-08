import Link from 'next/link';

export type OrderCardProps = {
  href: string;
  dateLabel: string;
  badges: string[];
  category: string;
  title: string;
  meta: string[];
  bottomMeta?: string[];
  priceLabel: string;
  inlineCta?: string;
  isActive?: boolean;
  ariaLabel?: string;
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
}: OrderCardProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel ?? title}
      className={`order-card order-card-link ${isActive ? 'is-active' : ''}`}
    >
      <div className="order-top">
        <span className="order-date">
          <span className="order-live-dot" aria-hidden="true" />
          {dateLabel}
        </span>
        <div className="order-badges">
        {badges.map((badge, index) => (
          <span key={`${badge}-${index}`} className="order-badge">
            {badge}
          </span>
        ))}
      </div>
    </div>
      <div className="order-category">{category}</div>
      <div className="order-title">{title}</div>
      <div className="order-meta">
        {meta.map((item, index) => (
          <span key={`${item}-${index}`} className="meta-item">
            {item}
          </span>
        ))}
      </div>
      <div className="order-bottom">
        <div className="order-bottom__meta">
          {bottomMeta.map((item, index) => (
            <span key={`${item}-${index}`} className="meta-item">
              {item}
            </span>
          ))}
        </div>
        <span className="proof-price">{priceLabel}</span>
      </div>
      {inlineCta ? (
        <span className="order-inline-cta" aria-hidden="true">
          {inlineCta}
        </span>
      ) : null}
    </Link>
  );
}
