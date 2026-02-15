import Link from 'next/link';

type RatingSummaryProps = {
  rating: string | number;
  reviewsCount: string | number;
  reviewsLabel: string;
  href?: string;
  className?: string;
};

export function RatingSummary({
  rating,
  reviewsCount,
  reviewsLabel,
  href,
  className,
}: RatingSummaryProps) {
  const content = (
    <>
      <div className="rating-summary__line">
        <span className="rating-summary__stars">★★★★★</span>
        <span className="rating-summary__value">{rating}</span>
      </div>
      <span className="rating-summary__reviews">
        {reviewsCount} {reviewsLabel}
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

