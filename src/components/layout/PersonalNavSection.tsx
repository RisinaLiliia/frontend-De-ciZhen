'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { ActivityInsight } from '@/components/ui/ActivityInsight';
import { CountBadge } from '@/components/ui/CountBadge';
import { RatingSummary } from '@/components/ui/RatingSummary';
import { IconChevronLeft, IconChevronRight } from '@/components/ui/icons/icons';
import { useSlidingIndicator } from '@/hooks/useSlidingIndicator';

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
  hideDockBadges?: boolean;
  className?: string;
  surface?: 'panel' | 'embedded';
};

export const PersonalNavSection = React.memo(function PersonalNavSection({
  title,
  subtitle,
  headerSlot,
  insightText,
  progressPercent,
  items,
  hideDockBadges = false,
  className,
  surface = 'panel',
}: PersonalNavSectionProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasHrefMatch = React.useCallback(
    (item: PersonalNavItem) => {
      const href = String(item.href ?? '').trim();
      if (!href) return false;

      // `item.href` may include `?section=...` / `?tab=...`; match both path and query subset.
      const [hrefPath, hrefQuery = ''] = href.split('?');
      const normalizedHrefPath = hrefPath || '';
      if (normalizedHrefPath && normalizedHrefPath !== pathname) {
        if (item.match === 'prefix') {
          if (!(pathname === normalizedHrefPath || pathname.startsWith(`${normalizedHrefPath}/`))) return false;
        } else {
          return false;
        }
      }

      if (!hrefQuery) return normalizedHrefPath ? normalizedHrefPath === pathname : false;

      const hrefParams = new URLSearchParams(hrefQuery);
      for (const [key, value] of hrefParams.entries()) {
        if (searchParams.get(key) !== value) return false;
      }
      return true;
    },
    [pathname, searchParams],
  );

  const isActive = (item: PersonalNavItem) => {
    if (item.disabled) return false;
    if (item.forceActive === true) return true;
    if (hasHrefMatch(item)) return true;
    if (item.forceActive === false) return false;
    if (item.match === 'prefix') return pathname === item.href || pathname.startsWith(`${item.href}/`);
    return pathname === item.href;
  };

  const hasTieredLayout = items.some((item) => item.tier === 'primary' || item.tier === 'secondary');
  const primaryItems = hasTieredLayout ? items.filter((item) => item.tier !== 'secondary') : items;
  const secondaryItems = hasTieredLayout ? items.filter((item) => item.tier === 'secondary') : [];
  const dockItems = hasTieredLayout ? [...primaryItems, ...secondaryItems] : items;
  const activeDockKey = dockItems.find((item) => isActive(item))?.key ?? '';
  const { containerRef: dockTrackRef, indicatorStyle: dockIndicatorStyle } = useSlidingIndicator<HTMLDivElement>({
    activeSelector: '.personal-nav__item.is-active',
    enabled: hasTieredLayout,
    watchKey: `${pathname}|${activeDockKey}|${dockItems.length}`,
  });
  const dockViewportRef = React.useRef<HTMLDivElement | null>(null);
  const [dockScrollState, setDockScrollState] = React.useState({
    canScrollPrev: false,
    canScrollNext: false,
  });

  const syncDockScrollState = React.useCallback(() => {
    const viewport = dockViewportRef.current;
    if (!viewport || !hasTieredLayout) {
      setDockScrollState((current) => (
        current.canScrollPrev || current.canScrollNext
          ? { canScrollPrev: false, canScrollNext: false }
          : current
      ));
      return;
    }

    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const nextState = {
      canScrollPrev: viewport.scrollLeft > 1,
      canScrollNext: viewport.scrollLeft < maxScrollLeft - 1,
    };
    setDockScrollState((current) => (
      current.canScrollPrev === nextState.canScrollPrev && current.canScrollNext === nextState.canScrollNext
        ? current
        : nextState
    ));
  }, [hasTieredLayout]);

  const scrollDockBy = React.useCallback((direction: -1 | 1) => {
    const viewport = dockViewportRef.current;
    const track = dockTrackRef.current;
    if (!viewport || !track) return;

    const navItems = Array.from(track.querySelectorAll<HTMLElement>('.personal-nav__item'));
    if (navItems.length === 0) return;

    const viewportLeft = viewport.scrollLeft;
    const viewportRight = viewportLeft + viewport.clientWidth;
    const threshold = 12;
    const targetItem =
      direction === 1
        ? navItems.find((item) => item.offsetLeft + item.offsetWidth > viewportRight + threshold) ?? navItems.at(-1) ?? null
        : [...navItems].reverse().find((item) => item.offsetLeft < viewportLeft - threshold) ?? navItems[0] ?? null;

    if (!targetItem) return;

    const targetLeft =
      direction === 1
        ? Math.max(0, targetItem.offsetLeft - threshold)
        : Math.max(0, targetItem.offsetLeft - Math.max(threshold, viewport.clientWidth - targetItem.offsetWidth - threshold));

    viewport.scrollTo({
      left: targetLeft,
      behavior: 'smooth',
    });
  }, [dockTrackRef]);

  const handleDockKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollDockBy(-1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollDockBy(1);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      dockViewportRef.current?.scrollTo({
        left: 0,
        behavior: 'smooth',
      });
    }

    if (event.key === 'End') {
      const viewport = dockViewportRef.current;
      if (!viewport) return;
      event.preventDefault();
      viewport.scrollTo({
        left: viewport.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [scrollDockBy]);

  React.useEffect(() => {
    if (!hasTieredLayout) return;

    const viewport = dockViewportRef.current;
    if (!viewport) return;

    syncDockScrollState();
    const handleScroll = () => syncDockScrollState();
    viewport.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    const track = dockTrackRef.current;
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => syncDockScrollState())
        : null;

    observer?.observe(viewport);
    if (track) observer?.observe(track);

    return () => {
      viewport.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      observer?.disconnect();
    };
  }, [dockItems.length, dockTrackRef, hasTieredLayout, syncDockScrollState]);

  React.useEffect(() => {
    if (!hasTieredLayout) return;

    const viewport = dockViewportRef.current;
    const activeItem = dockTrackRef.current?.querySelector<HTMLElement>('.personal-nav__item.is-active');
    if (!viewport || !activeItem) return;

    const frame = window.requestAnimationFrame(() => {
      const viewportRect = viewport.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const offset = 12;
      const isOutOfViewLeft = itemRect.left < viewportRect.left + offset;
      const isOutOfViewRight = itemRect.right > viewportRect.right - offset;

      if (isOutOfViewLeft || isOutOfViewRight) {
        activeItem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }

      syncDockScrollState();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeDockKey, hasTieredLayout, pathname, syncDockScrollState, searchParams, dockTrackRef]);

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
    const itemIsActive = !item.disabled && isActive(item);
    const itemClassName = [
      'personal-nav__item',
      item.tier === 'secondary' ? 'personal-nav__item--secondary' : null,
      item.disabled ? 'is-disabled' : null,
      item.disabled && item.lockedHref ? 'is-locked' : null,
      itemIsActive ? 'is-active' : null,
    ]
      .filter(Boolean)
      .join(' ');
    const dockBadgeValue = hasTieredLayout && !hideDockBadges ? resolveDockBadgeValue(item) : null;
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
          aria-current={itemIsActive ? 'page' : undefined}
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
        aria-current={itemIsActive ? 'page' : undefined}
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
    <section className={`${surface === 'panel' ? 'panel ' : ''}personal-nav${surface === 'embedded' ? ' personal-nav--embedded' : ''} ${className ?? ''}`.trim()}>
      {title ? (
        <div className="personal-nav__title-row">
          {headerSlot ? <div className="personal-nav__header-slot">{headerSlot}</div> : null}
          <div className="personal-nav__title-copy">
            <h2 className="personal-nav__title">{title}</h2>
            {subtitle ? <p className="personal-nav__subtitle">{subtitle}</p> : null}
          </div>
        </div>
      ) : headerSlot ? (
        <div className="personal-nav__header-slot">{headerSlot}</div>
      ) : null}
      {hasTieredLayout ? (
        <div className="personal-nav__dock-shell" role="group" aria-label="Workspace navigation tabs">
          <button
            type="button"
            className="personal-nav__dock-arrow"
            aria-label="Scroll navigation left"
            title="Scroll navigation left"
            onClick={() => scrollDockBy(-1)}
            disabled={!dockScrollState.canScrollPrev}
          >
            <IconChevronLeft />
          </button>
          <div
            ref={dockViewportRef}
            className="personal-nav__dock-viewport"
            onKeyDown={handleDockKeyDown}
            tabIndex={0}
            aria-label="Scrollable workspace navigation"
            data-can-scroll-prev={dockScrollState.canScrollPrev ? 'true' : 'false'}
            data-can-scroll-next={dockScrollState.canScrollNext ? 'true' : 'false'}
          >
            <div className="personal-nav__track personal-nav__track--dock" ref={dockTrackRef}>
              {dockIndicatorStyle ? <span className="personal-nav__dock-indicator" aria-hidden="true" style={dockIndicatorStyle} /> : null}
              {dockItems.map(renderItem)}
            </div>
          </div>
          <button
            type="button"
            className="personal-nav__dock-arrow"
            aria-label="Scroll navigation right"
            title="Scroll navigation right"
            onClick={() => scrollDockBy(1)}
            disabled={!dockScrollState.canScrollNext}
          >
            <IconChevronRight />
          </button>
        </div>
      ) : (
        <div className="personal-nav__track">{items.map(renderItem)}</div>
      )}
      {insightText ? (
        <ActivityInsight text={insightText} progressPercent={progressPercent ?? 0} />
      ) : null}
    </section>
  );
});
