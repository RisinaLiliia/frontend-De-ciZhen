// src/components/requests/details/RequestDetailHeader.tsx
import type { ReactNode } from 'react';

type RequestDetailHeaderProps = {
  title: string;
  eyebrowLabel?: string;
  priceLabel: string;
  pricePrefixLabel?: string;
  priceSuffixLabel?: string;
  priceTrend?: 'up' | 'down' | null;
  priceTrendLabel?: string | null;
  tags: string[];
  badgeLabel?: string;
  statusBadge?: ReactNode;
  headerAction?: ReactNode;
  showPrice?: boolean;
  showTags?: boolean;
  showIdentity?: boolean;
};

export function RequestDetailHeader({
  title,
  eyebrowLabel,
  priceLabel,
  pricePrefixLabel,
  priceSuffixLabel,
  priceTrend = null,
  priceTrendLabel = null,
  tags,
  badgeLabel,
  statusBadge,
  headerAction,
  showPrice = true,
  showTags = true,
  showIdentity = true,
}: RequestDetailHeaderProps) {
  return (
    <header className="request-detail__header">
      <div className="request-detail__title-row">
        <div className="request-detail__title-wrap">
          <div className="request-detail__header-top">
            <div className="request-detail__badges">
              {badgeLabel ? <span className="badge request-detail__badge">{badgeLabel}</span> : null}
              {statusBadge}
            </div>
            {headerAction ? <div className="request-detail__header-action">{headerAction}</div> : null}
          </div>
          {showIdentity ? (
            <>
              {eyebrowLabel ? <p className="request-category request-detail__eyebrow">{eyebrowLabel}</p> : null}
              {title ? <h1 className="request-detail__title">{title}</h1> : null}
            </>
          ) : null}
        </div>
        {showPrice ? (
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
        ) : null}
      </div>
      {showTags ? (
        <div className="request-detail__tags">
          {tags.map((tag) => (
            <span key={tag} className="request-tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </header>
  );
}
