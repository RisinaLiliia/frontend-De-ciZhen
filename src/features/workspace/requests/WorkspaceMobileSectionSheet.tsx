'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { CountBadge } from '@/components/ui/CountBadge';
import { focusIfPresent, getTrapFocusTarget, resolveInitialFocusTarget } from '@/lib/a11y/focusTrap';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';
import {
  WORKSPACE_MOBILE_NAV_OPEN_ATTR,
  WORKSPACE_MOBILE_NAV_OPEN_EVENT,
} from '@/lib/workspaceMobileNavigation';
import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';

function parseNumericValue(value: PersonalNavItem['value']) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  if (typeof value !== 'string') return null;
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : null;
}

function resolveBadgeValue(item: PersonalNavItem) {
  const count = typeof item.badgeValue === 'number'
    ? Math.max(0, Math.round(item.badgeValue))
    : parseNumericValue(item.value);
  if (count === null) return null;

  const showAlways = item.key === 'public-requests' || item.key === 'public-providers' || item.key === 'public-stats' || item.key === 'my-requests';
  const showWhenPositive = item.key === 'my-offers' || item.key === 'my-favorites' || item.key === 'reviews';

  if (showAlways) return count;
  if (showWhenPositive) return count > 0 ? count : null;
  return null;
}

function formatBadgeValue(value: number) {
  return value > 99 ? '99+' : String(value);
}

export function WorkspaceMobileSectionSheet({
  items,
}: {
  items: PersonalNavItem[];
}) {
  const t = useT();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const panelRef = React.useRef<HTMLElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const titleId = React.useId();
  const primaryItems = React.useMemo(
    () => items.filter((item) => item.tier !== 'secondary'),
    [items],
  );
  const secondaryItems = React.useMemo(
    () => items.filter((item) => item.tier === 'secondary'),
    [items],
  );

  const hasHrefMatch = React.useCallback(
    (item: PersonalNavItem) => {
      const href = String(item.href ?? '').trim();
      if (!href) return false;

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

  const isActive = React.useCallback((item: PersonalNavItem) => {
    if (item.disabled) return false;
    if (item.forceActive === true) return true;
    if (hasHrefMatch(item)) return true;
    if (item.forceActive === false) return false;
    if (item.match === 'prefix') return pathname === item.href || pathname.startsWith(`${item.href}/`);
    return pathname === item.href;
  }, [hasHrefMatch, pathname]);

  React.useEffect(() => {
    const openSheet = () => setOpen(true);
    window.addEventListener(WORKSPACE_MOBILE_NAV_OPEN_EVENT, openSheet);

    return () => {
      window.removeEventListener(WORKSPACE_MOBILE_NAV_OPEN_EVENT, openSheet);
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const root = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyLeft = body.style.left;
    const previousBodyRight = body.style.right;
    const previousBodyWidth = body.style.width;
    const previousRootOverflow = root.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root.setAttribute(WORKSPACE_MOBILE_NAV_OPEN_ATTR, 'true');
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';

    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      );

    window.requestAnimationFrame(() => {
      const target = resolveInitialFocusTarget(closeButtonRef.current, getFocusable());
      focusIfPresent(target);
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      const active = document.activeElement as HTMLElement | null;
      const target = getTrapFocusTarget({
        focusable,
        activeElement: active,
        container: panel,
        shiftKey: event.shiftKey,
      });
      if (target) {
        event.preventDefault();
        target.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      root.removeAttribute(WORKSPACE_MOBILE_NAV_OPEN_ATTR);
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.left = previousBodyLeft;
      body.style.right = previousBodyRight;
      body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
      document.removeEventListener('keydown', onKeyDown);
      focusIfPresent(previouslyFocused);
    };
  }, [open]);

  const renderItem = (item: PersonalNavItem) => {
    const active = isActive(item);
    const badgeValue = resolveBadgeValue(item);
    const content = (
      <>
        <span className="workspace-mobile-nav-sheet__card-head">
          <span className="workspace-mobile-nav-sheet__card-icon" aria-hidden="true">
            {item.icon}
          </span>
          {badgeValue !== null ? (
            <CountBadge
              as="strong"
              size="sm"
              className="workspace-mobile-nav-sheet__card-badge"
              value={formatBadgeValue(badgeValue)}
            />
          ) : null}
        </span>
        <span className="workspace-mobile-nav-sheet__card-label">{item.label}</span>
      </>
    );

    const className = [
      'workspace-mobile-nav-sheet__card',
      item.tier === 'secondary' ? 'workspace-mobile-nav-sheet__card--secondary' : null,
      active ? 'is-active' : null,
      item.disabled ? 'is-disabled' : null,
    ]
      .filter(Boolean)
      .join(' ');

    if (item.disabled && !item.lockedHref) {
      return (
        <span key={item.key} className={className} aria-disabled="true">
          {content}
        </span>
      );
    }

    const href = item.disabled && item.lockedHref ? item.lockedHref : item.href;

    return (
      <Link
        key={item.key}
        href={href}
        prefetch={false}
        className={className}
        aria-current={active ? 'page' : undefined}
        onClick={() => {
          item.onClick?.();
          setOpen(false);
        }}
      >
        {content}
      </Link>
    );
  };

  if (!open) return null;

  return (
    <div className="workspace-mobile-nav-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        className="workspace-mobile-nav-sheet__backdrop"
        aria-label={t(I18N_KEYS.auth.closeDialog)}
        onClick={() => setOpen(false)}
      />
      <section ref={panelRef} className="workspace-mobile-nav-sheet__surface">
        <header className="workspace-mobile-nav-sheet__header">
          <div className="workspace-mobile-nav-sheet__copy">
            <h2 id={titleId} className="workspace-mobile-nav-sheet__title">{t(I18N_KEYS.auth.workspaceLabel)}</h2>
            <p className="workspace-mobile-nav-sheet__subtitle">{t(I18N_KEYS.auth.navigationLabel)}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="workspace-mobile-nav-sheet__close"
            aria-label={t(I18N_KEYS.auth.closeDialog)}
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </header>
        <div className="workspace-mobile-nav-sheet__body">
          {primaryItems.length ? (
            <section className="workspace-mobile-nav-sheet__section">
              <div className="workspace-mobile-nav-sheet__grid">
                {primaryItems.map(renderItem)}
              </div>
            </section>
          ) : null}
          {secondaryItems.length ? (
            <section className="workspace-mobile-nav-sheet__section workspace-mobile-nav-sheet__section--secondary">
              <div className="workspace-mobile-nav-sheet__grid">
                {secondaryItems.map(renderItem)}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}
