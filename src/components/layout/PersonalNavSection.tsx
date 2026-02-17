'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ActivityInsight } from '@/components/ui/ActivityInsight';
import { CountBadge } from '@/components/ui/CountBadge';
import { RatingSummary } from '@/components/ui/RatingSummary';

export type PersonalNavItem = {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
  value?: string | number;
  hint?: string;
  onClick?: () => void;
  rating?: {
    value: string | number;
    reviewsCount: string | number;
    reviewsLabel: string;
    href?: string;
  };
  forceActive?: boolean;
  match?: 'exact' | 'prefix';
};

type PersonalNavSectionProps = {
  title?: string;
  insightText?: string;
  progressPercent?: number;
  items: PersonalNavItem[];
  className?: string;
};

export function PersonalNavSection({
  title,
  insightText,
  progressPercent,
  items,
  className,
}: PersonalNavSectionProps) {
  const pathname = usePathname();

  const isActive = (item: PersonalNavItem) => {
    if (typeof item.forceActive === 'boolean') return item.forceActive;
    if (item.match === 'prefix') return pathname === item.href || pathname.startsWith(`${item.href}/`);
    return pathname === item.href;
  };

  return (
    <section className={`panel personal-nav ${className ?? ''}`.trim()}>
      {title ? <h2 className="personal-nav__title">{title}</h2> : null}
      <div className="personal-nav__track">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`personal-nav__item ${isActive(item) ? 'is-active' : ''}`.trim()}
            onClick={item.onClick}
          >
            <span className="personal-nav__top">
              <i className="personal-nav__icon" aria-hidden="true">
                {item.icon}
              </i>
              <span className="personal-nav__label">{item.label}</span>
              {item.value !== undefined && !item.rating ? (
                <CountBadge as="strong" className="personal-nav__value" value={item.value} />
              ) : null}
            </span>
            {item.rating ? (
              <RatingSummary
                className="personal-nav__rating"
                rating={item.rating.value}
                reviewsCount={item.rating.reviewsCount}
                reviewsLabel={item.rating.reviewsLabel}
                href={item.rating.href}
              />
            ) : item.hint ? (
              <span className="personal-nav__hint">{item.hint}</span>
            ) : null}
          </Link>
        ))}
      </div>
      {insightText ? (
        <ActivityInsight text={insightText} progressPercent={progressPercent ?? 0} />
      ) : null}
    </section>
  );
}
