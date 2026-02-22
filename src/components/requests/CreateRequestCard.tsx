'use client';

import Link from 'next/link';
import type { MouseEventHandler } from 'react';

type CreateRequestCardProps = {
  href?: string;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'compact';
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function CreateRequestCard({
  href = '/request/create',
  title = 'Neue Anfrage erstellen',
  subtitle = 'Kostenlos · mehrere Angebote',
  variant = 'default',
  className,
  onClick,
}: CreateRequestCardProps) {
  const classes = ['request-create-card', `request-create-card--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Link href={href} className={classes} aria-label={title} onClick={onClick}>
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
