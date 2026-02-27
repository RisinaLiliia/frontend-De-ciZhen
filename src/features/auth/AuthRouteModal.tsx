'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { focusIfPresent, getTrapFocusTarget, resolveInitialFocusTarget } from '@/lib/a11y/focusTrap';

type Props = {
  title: string;
  subtitle?: string;
  closeLabel?: string;
  children: React.ReactNode;
};

export function AuthRouteModal({ title, subtitle, closeLabel = 'Close', children }: Props) {
  const router = useRouter();
  const panelRef = React.useRef<HTMLElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const titleId = React.useId();

  const close = React.useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.replace('/');
  }, [router]);

  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

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
        close();
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
      document.removeEventListener('keydown', onKeyDown);
      focusIfPresent(previouslyFocused);
    };
  }, [close]);

  return (
    <div className="dc-modal auth-route-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        className="dc-modal__backdrop auth-route-modal__backdrop"
        aria-label={closeLabel}
        onClick={close}
      />
      <section ref={panelRef} className="dc-modal__panel dc-modal__panel--compact auth-route-modal__panel">
        <header className="auth-route-modal__header">
          <div className="auth-route-modal__title-wrap">
            <h1 id={titleId} className="auth-route-modal__title">{title}</h1>
            {subtitle ? <p className="auth-route-modal__subtitle">{subtitle}</p> : null}
          </div>
          <button ref={closeButtonRef} type="button" className="auth-route-modal__close" aria-label={closeLabel} onClick={close}>
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
