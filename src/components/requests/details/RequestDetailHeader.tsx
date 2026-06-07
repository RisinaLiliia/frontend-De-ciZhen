// src/components/requests/details/RequestDetailHeader.tsx
import { Badge } from '@/components/ui/Badge';
import type { ReactNode } from 'react';
import { RequestDetailPrice } from './RequestDetailPrice';

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
              {badgeLabel ? (
                <Badge variant="neutral" size="sm" tone="soft" className="request-detail__badge">
                  {badgeLabel}
                </Badge>
              ) : null}
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
          <RequestDetailPrice
            priceLabel={priceLabel}
            pricePrefixLabel={pricePrefixLabel}
            priceSuffixLabel={priceSuffixLabel}
            priceTrend={priceTrend}
            priceTrendLabel={priceTrendLabel}
          />
        ) : null}
      </div>
      {showTags ? (
        <div className="request-detail__tags">
          {tags.map((tag) => (
            <Badge key={tag} variant="neutral" size="sm" tone="outline" className="request-tag">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}
    </header>
  );
}
