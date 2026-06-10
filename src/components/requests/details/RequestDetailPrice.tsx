import type { ReactNode } from 'react';

type RequestDetailPriceProps = {
  priceLabel: string;
  pricePrefixLabel?: string;
  priceSuffixLabel?: string;
  priceTrend?: 'up' | 'down' | null;
  priceTrendLabel?: string | null;
  className?: string;
  trailingContent?: ReactNode;
};

export function RequestDetailPrice({
  priceLabel,
  pricePrefixLabel,
  priceSuffixLabel,
  priceTrend = null,
  priceTrendLabel = null,
  className,
  trailingContent,
}: RequestDetailPriceProps) {
  return (
    <div className={`request-detail__price ${className ?? ''}`.trim()}>
      {pricePrefixLabel ? (
        <span className="request-detail__price-prefix">{pricePrefixLabel}</span>
      ) : null}
      <span className="proof-price">{priceLabel}</span>
      {priceSuffixLabel ? (
        <span className="request-detail__price-suffix">{priceSuffixLabel}</span>
      ) : null}
      {priceTrend ? (
        <span
          className={`status-badge ${priceTrend === 'up' ? 'status-badge--success' : 'status-badge--warning'}`}
        >
          {priceTrend === 'down' ? '↓' : '↑'} {priceTrendLabel}
        </span>
      ) : null}
      {trailingContent}
    </div>
  );
}
