// src/components/requests/details/RequestDetailHeader.tsx
import type { ReactNode } from 'react';

type RequestDetailHeaderProps = {
  title: string;
  priceLabel: string;
  pricePrefixLabel?: string;
  priceSuffixLabel?: string;
  priceTrend?: 'up' | 'down' | null;
  priceTrendLabel?: string | null;
  tags: string[];
  badgeLabel?: string;
  statusBadge?: ReactNode;
};

export function RequestDetailHeader({
  title,
  priceLabel,
  pricePrefixLabel,
  priceSuffixLabel,
  priceTrend = null,
  priceTrendLabel = null,
  tags,
  badgeLabel,
  statusBadge,
}: RequestDetailHeaderProps) {
  return (
    <header className="request-detail__header">
      <div className="request-detail__title-row">
        <div className="request-detail__title-wrap">
          <div className="request-detail__badges">
            {badgeLabel ? <span className="badge request-detail__badge">{badgeLabel}</span> : null}
            {statusBadge}
          </div>
          {title ? <h1 className="request-detail__title">{title}</h1> : null}
        </div>
        <div className="request-detail__price">
          {pricePrefixLabel ? <span className="request-detail__price-prefix">{pricePrefixLabel}</span> : null}
          <span className="proof-price">{priceLabel}</span>
          {priceSuffixLabel ? <span className="request-detail__price-suffix">{priceSuffixLabel}</span> : null}
          {priceTrend ? (
            <span className={`status-badge ${priceTrend === 'up' ? 'status-badge--success' : 'status-badge--warning'}`}>
              {priceTrend === 'down' ? '↓' : '↑'} {priceTrendLabel}
            </span>
          ) : null}
        </div>
      </div>
      <div className="request-detail__tags">
        {tags.map((tag) => (
          <span key={tag} className="request-tag">
            {tag}
          </span>
        ))}
      </div>
    </header>
  );
}
