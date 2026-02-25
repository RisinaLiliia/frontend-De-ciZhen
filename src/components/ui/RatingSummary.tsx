import Link from 'next/link';
import * as React from 'react';

type RatingSummaryProps = {
  rating: string | number;
  reviewsCount: string | number;
  reviewsLabel: string;
  href?: string;
  className?: string;
  trailing?: React.ReactNode;
};

export function RatingSummary({
  rating,
  reviewsCount,
  reviewsLabel,
  href,
  className,
  trailing,
}: RatingSummaryProps) {
  const numericRating = Number(rating);
  const clampedRating = Number.isFinite(numericRating)
    ? Math.max(0, Math.min(5, numericRating))
    : 0;
  const starsFillWidth = `${(clampedRating / 5) * 100}%`;

  const content = (
    <>
      <div className="rating-summary__line">
        <span className="rating-summary__stars" aria-hidden="true">
          <span className="rating-summary__stars-base">★★★★★</span>
          <span className="rating-summary__stars-fill" style={{ width: starsFillWidth }}>
            ★★★★★
          </span>
        </span>
        <span className="rating-summary__value">{rating}</span>
      </div>
      <span className="rating-summary__reviews-row">
        <span className="rating-summary__reviews">
          {reviewsCount} {reviewsLabel}
        </span>
        {trailing ? <span className="rating-summary__trailing">{trailing}</span> : null}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`rating-summary ${className ?? ''}`.trim()}>
        {content}
      </Link>
    );
  }

  return <div className={`rating-summary ${className ?? ''}`.trim()}>{content}</div>;
}
