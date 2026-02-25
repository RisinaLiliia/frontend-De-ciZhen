'use client';

import Link from 'next/link';
import type { MouseEventHandler } from 'react';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

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
  title,
  subtitle,
  variant = 'default',
  className,
  onClick,
}: CreateRequestCardProps) {
  const t = useT();
  const resolvedTitle = title ?? t(I18N_KEYS.requestsPage.heroPrimaryCta);
  const resolvedSubtitle = subtitle ?? t(I18N_KEYS.homePublic.heroAnimatedCreateSubtitle);
  const classes = ['request-create-card', `request-create-card--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Link href={href} className={classes} aria-label={resolvedTitle} onClick={onClick}>
      <div className="request-create-card__body">
        <p className="request-create-card__title">{resolvedTitle}</p>
        <p className="request-create-card__subtitle">{resolvedSubtitle}</p>
      </div>
      <div className="request-create-card__media" aria-hidden="true">
        <span className="request-create-card__plus">+</span>
      </div>
    </Link>
  );
}
