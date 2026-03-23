'use client';

import * as React from 'react';

import {
  focusIfPresent,
  getTrapFocusTarget,
  resolveInitialFocusTarget,
} from '@/lib/a11y/focusTrap';
import {
  WORKSPACE_MOBILE_NAV_OPEN_ATTR,
  WORKSPACE_MOBILE_NAV_OPEN_EVENT,
} from '@/lib/workspaceMobileNavigation';

export function useWorkspaceMobileSectionSheet() {
  const panelRef = React.useRef<HTMLElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = React.useState(false);

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

  return {
    open,
    setOpen,
    panelRef,
    closeButtonRef,
  };
}
