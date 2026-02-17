'use client';

import Link from 'next/link';

type CreateRequestCardProps = {
  href?: string;
  title?: string;
  subtitle?: string;
};

export function CreateRequestCard({
  href = '/request/create',
  title = 'Neue Anfrage erstellen',
  subtitle = 'Kostenlos · mehrere Angebote',
}: CreateRequestCardProps) {
  return (
    <Link href={href} className="request-create-card" aria-label={title}>
      <div className="request-create-card__body">
        <p className="request-create-card__title">{title}</p>
        <p className="request-create-card__subtitle">{subtitle}</p>
      </div>
      <div className="request-create-card__media" aria-hidden="true">
        <span className="request-create-card__plus">+</span>
      </div>
    </Link>
  );
}
