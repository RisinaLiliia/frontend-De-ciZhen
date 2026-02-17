type ProofReviewCardProps = {
  title: string;
  info: string;
  review: string;
  rating: string;
  price: string;
  isActive?: boolean;
  hideMobile?: boolean;
};

export function ProofReviewCard({
  title,
  info,
  review,
  rating,
  price,
  isActive = true,
  hideMobile = false,
}: ProofReviewCardProps) {
  return (
    <article className={`proof-card ${isActive ? 'is-active' : 'is-dim'} ${hideMobile ? 'hide-mobile' : ''}`.trim()}>
      <div className="proof-header">
        <div className="proof-avatars">
          <span className="proof-avatar avatar-spark" />
          <span className="proof-avatar avatar-ember" />
        </div>
        <div className="proof-title">{title}</div>
        <span className="proof-price">{price}</span>
      </div>
      <p className="proof-info">{info}</p>
      <div className="proof-rating">
        <span className="proof-stars">★★★★★</span>
        <span className="proof-score">{rating}</span>
      </div>
      <p className="proof-review">{review}</p>
    </article>
  );
}
