// src/components/requests/details/RequestDetailAbout.tsx
type RequestDetailAboutProps = {
  title: string;
  description: string;
};

export function RequestDetailAbout({ title, description }: RequestDetailAboutProps) {
  return (
    <div className="request-detail__section request-detail__section--grow">
      <h2 className="request-detail__section-title">{title}</h2>
      <p className="request-detail__text">{description}</p>
    </div>
  );
}
