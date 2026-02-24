// src/components/requests/details/RequestDetailHeader.tsx
import type { ReactNode } from 'react';

type RequestDetailHeaderProps = {
  title: string;
  priceLabel: string;
  priceTrend?: 'up' | 'down' | null;
  priceTrendLabel?: string | null;
  tags: string[];
  badgeLabel?: string;
  statusBadge?: ReactNode;
};

export function RequestDetailHeader({
  title,
  priceLabel,
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
          <h1 className="request-detail__title">{title}</h1>
        </div>
        <div className="request-detail__price">
          <span className="proof-price">{priceLabel}</span>
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
