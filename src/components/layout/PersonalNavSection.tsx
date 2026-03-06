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
  tier?: 'primary' | 'secondary';
  disabled?: boolean;
  lockedHref?: string;
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
  headerSlot?: ReactNode;
  insightText?: string;
  progressPercent?: number;
  items: PersonalNavItem[];
  className?: string;
};

export function PersonalNavSection({
  title,
  headerSlot,
  insightText,
  progressPercent,
  items,
  className,
}: PersonalNavSectionProps) {
  const pathname = usePathname();

  const isActive = (item: PersonalNavItem) => {
    if (item.disabled) return false;
    if (typeof item.forceActive === 'boolean') return item.forceActive;
    if (item.match === 'prefix') return pathname === item.href || pathname.startsWith(`${item.href}/`);
    return pathname === item.href;
  };

  const hasTieredLayout = items.some((item) => item.tier === 'primary' || item.tier === 'secondary');
  const primaryItems = hasTieredLayout ? items.filter((item) => item.tier !== 'secondary') : items;
  const secondaryItems = hasTieredLayout ? items.filter((item) => item.tier === 'secondary') : [];

  const renderItem = (item: PersonalNavItem) => {
    const itemClassName = [
      'personal-nav__item',
      item.tier === 'secondary' ? 'personal-nav__item--secondary' : null,
      item.disabled ? 'is-disabled' : null,
      item.disabled && item.lockedHref ? 'is-locked' : null,
      !item.disabled && isActive(item) ? 'is-active' : null,
    ]
      .filter(Boolean)
      .join(' ');

    if (item.disabled && !item.lockedHref) {
      return (
        <span
          key={item.key}
          className={itemClassName}
          data-nav-key={item.key}
          aria-disabled="true"
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
        </span>
      );
    }

    if (item.disabled && item.lockedHref) {
      return (
        <Link
          key={item.key}
          href={item.lockedHref}
          prefetch={false}
          className={itemClassName}
          data-nav-key={item.key}
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
      );
    }

    return (
      <Link
        key={item.key}
        href={item.href}
        prefetch={false}
        className={itemClassName}
        data-nav-key={item.key}
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
    );
  };

  return (
    <section className={`panel personal-nav ${className ?? ''}`.trim()}>
      {headerSlot ? <div className="personal-nav__header-slot">{headerSlot}</div> : null}
      {title ? <h2 className="personal-nav__title">{title}</h2> : null}
      {hasTieredLayout ? (
        <div className="personal-nav__tracks">
          <div className="personal-nav__track personal-nav__track--primary">{primaryItems.map(renderItem)}</div>
          {secondaryItems.length > 0 ? (
            <div className="personal-nav__track personal-nav__track--secondary">{secondaryItems.map(renderItem)}</div>
          ) : null}
        </div>
      ) : (
        <div className="personal-nav__track">{items.map(renderItem)}</div>
      )}
      {insightText ? (
        <ActivityInsight text={insightText} progressPercent={progressPercent ?? 0} />
      ) : null}
    </section>
  );
}
