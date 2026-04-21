'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

import { focusIfPresent, getTrapFocusTarget, resolveInitialFocusTarget } from '@/lib/a11y/focusTrap';
import type { Locale } from '@/lib/i18n/t';

function getFocusableElements(container: HTMLElement) {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(','))).filter(
    (element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
  );
}

function WorkspaceInlineErrorState({
  locale,
  title,
  body,
}: {
  locale: Locale;
  title: string;
  body: string;
}) {
  return (
    <div className="my-request-inline-state my-request-inline-state--error" role="alert">
      <span className="my-request-inline-state__icon" aria-hidden="true">!</span>
      <div className="my-request-inline-state__copy">
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      <span className="my-request-inline-state__meta">
        {locale === 'de' ? 'Inline' : 'Inline'}
      </span>
    </div>
  );
}

export function WorkspaceRequestDialogShell({
  locale,
  ariaLabel,
  onClose,
  isLoading,
  isError,
  errorTitle,
  errorBody,
  bodyVariant = 'details',
  children,
}: {
  locale: Locale;
  ariaLabel: string;
  onClose: () => void;
  isLoading: boolean;
  isError: boolean;
  errorTitle: string;
  errorBody: string;
  bodyVariant?: 'details' | 'default';
  children: React.ReactNode;
}) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;

    const panel = panelRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    window.requestAnimationFrame(() => {
      if (!panel) return;
      const target = resolveInitialFocusTarget(closeButtonRef.current, getFocusableElements(panel));
      focusIfPresent(target);
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;

      const focusable = getFocusableElements(panel);
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
      document.body.style.paddingRight = previousPaddingRight;
      document.removeEventListener('keydown', onKeyDown);
      focusIfPresent(previouslyFocused);
    };
  }, [isMounted, onClose]);

  if (!isMounted) return null;

  return createPortal((
    <div className="dc-modal my-request-dialog" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <button
        type="button"
        className="dc-modal__backdrop"
        onClick={onClose}
        aria-label={locale === 'de' ? 'Dialog schließen' : 'Close dialog'}
      />
      <div
        ref={panelRef}
        className="dc-modal__panel dc-modal__panel--wide my-request-dialog__panel my-request-dialog__panel--details"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="my-request-dialog__close my-request-dialog__close--floating"
          onClick={onClose}
          aria-label={locale === 'de' ? 'Dialog schließen' : 'Close dialog'}
        >
          ×
        </button>

        {isLoading ? (
          <div className="my-request-dialog__state">
            <div className="skeleton h-8 w-56" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-10 w-40" />
          </div>
        ) : null}

        {!isLoading && isError ? (
          <div className="my-request-dialog__state">
            <WorkspaceInlineErrorState locale={locale} title={errorTitle} body={errorBody} />
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <div className={`my-request-dialog__body ${bodyVariant === 'details' ? 'my-request-dialog__body--details' : ''}`.trim()}>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  ), document.body);
}
