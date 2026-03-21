'use client';

import * as React from 'react';
import { focusIfPresent, getTrapFocusTarget, resolveInitialFocusTarget } from '@/lib/a11y/focusTrap';

type WorkspaceMobileFiltersSheetProps = {
  title: string;
  closeLabel: string;
  triggerLabel: string;
  summary: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function WorkspaceMobileFiltersSheet({
  title,
  closeLabel,
  triggerLabel,
  summary,
  children,
  className,
}: WorkspaceMobileFiltersSheetProps) {
  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';

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
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      focusIfPresent(previouslyFocused);
    };
  }, [open]);

  return (
    <>
      <div className={['workspace-mobile-filters', className].filter(Boolean).join(' ')}>
        <button
          type="button"
          className="workspace-mobile-filters__trigger"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={triggerLabel}
        >
          <span className="workspace-mobile-filters__summary">{summary}</span>
          <span className="workspace-mobile-filters__cta">{triggerLabel}</span>
        </button>
      </div>
      {open ? (
        <div className="workspace-mobile-filters-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button
            type="button"
            className="workspace-mobile-filters-sheet__backdrop"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
          />
          <section ref={panelRef} className="workspace-mobile-filters-sheet__surface">
            <header className="workspace-mobile-filters-sheet__header">
              <h2 id={titleId} className="workspace-mobile-filters-sheet__title">{title}</h2>
              <button
                ref={closeButtonRef}
                type="button"
                className="workspace-mobile-filters-sheet__close"
                aria-label={closeLabel}
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </header>
            <div className="workspace-mobile-filters-sheet__body">
              {children}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
