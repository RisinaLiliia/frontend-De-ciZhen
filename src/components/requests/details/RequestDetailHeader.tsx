// src/components/requests/details/RequestDetailHeader.tsx
type RequestDetailHeaderProps = {
  title: string;
  priceLabel: string;
  tags: string[];
  badgeLabel?: string;
};

export function RequestDetailHeader({
  title,
  priceLabel,
  tags,
  badgeLabel,
}: RequestDetailHeaderProps) {
  return (
    <header className="request-detail__header">
      <div className="request-detail__title-row">
        <div className="request-detail__title-wrap">
          {badgeLabel ? <span className="badge request-detail__badge">{badgeLabel}</span> : null}
          <h1 className="request-detail__title">{title}</h1>
        </div>
        <div className="request-detail__price">
          <span className="proof-price">{priceLabel}</span>
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
