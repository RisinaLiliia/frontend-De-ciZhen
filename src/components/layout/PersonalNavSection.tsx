'use client';

import * as React from 'react';
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
  badgeValue?: number;
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
  subtitle?: string;
  headerSlot?: ReactNode;
  insightText?: string;
  progressPercent?: number;
  items: PersonalNavItem[];
  className?: string;
};

export function PersonalNavSection({
  title,
  subtitle,
  headerSlot,
  insightText,
  progressPercent,
  items,
  className,
}: PersonalNavSectionProps) {
  const pathname = usePathname();
  const dockTrackRef = React.useRef<HTMLDivElement | null>(null);
  const [dockIndicatorStyle, setDockIndicatorStyle] = React.useState<React.CSSProperties | null>(null);

  const isActive = (item: PersonalNavItem) => {
    if (item.disabled) return false;
    if (typeof item.forceActive === 'boolean') return item.forceActive;
    if (item.match === 'prefix') return pathname === item.href || pathname.startsWith(`${item.href}/`);
    return pathname === item.href;
  };

  const hasTieredLayout = items.some((item) => item.tier === 'primary' || item.tier === 'secondary');
  const primaryItems = hasTieredLayout ? items.filter((item) => item.tier !== 'secondary') : items;
  const secondaryItems = hasTieredLayout ? items.filter((item) => item.tier === 'secondary') : [];
  const dockItems = hasTieredLayout ? [...primaryItems, ...secondaryItems] : items;
  const activeDockKey = dockItems.find((item) => isActive(item))?.key ?? '';

  const syncDockIndicator = React.useCallback(() => {
    const track = dockTrackRef.current;
    if (!track) return;
    const activeItem = track.querySelector<HTMLElement>('.personal-nav__item.is-active');
    if (!activeItem) {
      setDockIndicatorStyle(null);
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    setDockIndicatorStyle({
      transform: `translate3d(${itemRect.left - trackRect.left}px, ${itemRect.top - trackRect.top}px, 0)`,
      width: `${itemRect.width}px`,
      height: `${itemRect.height}px`,
    });
  }, []);

  React.useEffect(() => {
    if (!hasTieredLayout) return;

    syncDockIndicator();
    const raf = window.requestAnimationFrame(syncDockIndicator);

    const onResize = () => syncDockIndicator();
    window.addEventListener('resize', onResize);

    const track = dockTrackRef.current;
    const observer = typeof ResizeObserver !== 'undefined' && track ? new ResizeObserver(syncDockIndicator) : null;
    if (observer && track) observer.observe(track);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
    };
  }, [hasTieredLayout, pathname, activeDockKey, syncDockIndicator]);

  const parseNumericValue = (value: PersonalNavItem['value']) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.max(0, Math.round(value));
    }
    if (typeof value !== 'string') return null;
    const digits = value.replace(/[^\d]/g, '');
    if (!digits) return null;
    const parsed = Number(digits);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : null;
  };

  const resolveDockBadgeValue = (item: PersonalNavItem) => {
    const count = typeof item.badgeValue === 'number' ? Math.max(0, Math.round(item.badgeValue)) : parseNumericValue(item.value);
    if (count === null) return null;

    const key = item.key;
    const showAlways = key === 'public-requests' || key === 'public-providers' || key === 'public-stats' || key === 'my-requests';
    const showWhenPositive = key === 'my-offers' || key === 'my-favorites' || key === 'reviews';

    if (showAlways) return count;
    if (showWhenPositive) return count > 0 ? count : null;
    return null;
  };

  const formatDockBadgeValue = (value: number) => (value > 99 ? '99+' : String(value));

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
    const dockBadgeValue = hasTieredLayout ? resolveDockBadgeValue(item) : null;
    const regularValue = !hasTieredLayout && item.value !== undefined && !item.rating ? item.value : null;

    const topContent = (
      <span className="personal-nav__top">
        <i className="personal-nav__icon" aria-hidden="true">
          {item.icon}
        </i>
        <span className="personal-nav__label">{item.label}</span>
        {dockBadgeValue !== null ? (
          <CountBadge as="strong" size="sm" className="personal-nav__value personal-nav__value--dock" value={formatDockBadgeValue(dockBadgeValue)} />
        ) : regularValue !== null ? (
          <CountBadge as="strong" className="personal-nav__value" value={regularValue} />
        ) : null}
      </span>
    );

    if (item.disabled && !item.lockedHref) {
      return (
        <span
          key={item.key}
          className={itemClassName}
          data-nav-key={item.key}
          aria-disabled="true"
        >
          {topContent}
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
          {topContent}
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
        {topContent}
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
      {subtitle ? <p className="personal-nav__subtitle">{subtitle}</p> : null}
      {hasTieredLayout ? (
        <div className="personal-nav__tracks">
          <div className="personal-nav__track personal-nav__track--dock" ref={dockTrackRef}>
            {dockIndicatorStyle ? <span className="personal-nav__dock-indicator" aria-hidden="true" style={dockIndicatorStyle} /> : null}
            {dockItems.map(renderItem)}
          </div>
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
