'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

import { StatisticsKiCard } from '@/features/workspace/requests/stats/components/StatisticsKiCard';
import { focusIfPresent, getTrapFocusTarget, resolveInitialFocusTarget } from '@/lib/a11y/focusTrap';

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

type WorkspaceDecisionRecommendationModalProps = {
  generatedLabel: string;
  assistantAvatarLabel: string;
  assistantName: string;
  assistantRole: string;
  loadingLabel: string;
  loadingBody: string;
  title: string;
  summaryLabel: string;
  closeLabel: string;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  titleContext?: string | null;
  children: React.ReactNode;
};

export function WorkspaceDecisionRecommendationModal({
  generatedLabel,
  assistantAvatarLabel,
  assistantName,
  assistantRole,
  loadingLabel,
  loadingBody,
  title,
  summaryLabel,
  closeLabel,
  isOpen,
  isLoading,
  onClose,
  titleContext,
  children,
}: WorkspaceDecisionRecommendationModalProps) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const panelRef = React.useRef<HTMLElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const [isRendered, setIsRendered] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;

    let timeoutId = 0;

    if (isOpen) {
      setIsRendered(true);
      return;
    }

    if (isRendered) {
      setIsVisible(false);
      timeoutId = window.setTimeout(() => {
        setIsRendered(false);
      }, 220);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isMounted, isOpen, isRendered]);

  React.useLayoutEffect(() => {
    if (!isMounted || !isOpen || !isRendered) return;
    setIsVisible(true);
  }, [isMounted, isOpen, isRendered]);

  React.useEffect(() => {
    if (!isRendered) return;

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
  }, [isRendered, onClose]);

  if (!isMounted || !isRendered) return null;

  return createPortal((
    <div
      className="dc-modal auth-route-modal workspace-statistics-layout workspace-statistics-price-modal"
      data-state={isVisible ? 'open' : 'closed'}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <button
        type="button"
        className="dc-modal__backdrop workspace-statistics-price-modal__backdrop"
        onClick={onClose}
        aria-label={closeLabel}
      />
      <section
        ref={panelRef}
        className="dc-modal__panel dc-modal__panel--compact auth-route-modal__panel workspace-statistics-price-modal__panel"
      >
        <div className="workspace-statistics-price-modal__intro" data-phase={isLoading ? 'loading' : 'ready'}>
          {isLoading ? (
            <div className="workspace-statistics-ki workspace-statistics-ki--meta workspace-statistics-price-modal__intro-loader" aria-live="polite">
              <span className="workspace-statistics-ki__stamp">{generatedLabel}</span>
              <div className="workspace-statistics-price-modal__intro-loader-head">
                <div className="workspace-statistics-price-modal__loading-visual" aria-hidden="true">
                  <div className="workspace-statistics-price-modal__loading-orb" />
                  <div className="workspace-statistics-price-modal__loading-beam" />
                </div>
                <div className="workspace-statistics-price-modal__intro-loader-copy">
                  <p className="workspace-statistics-price-modal__loading-title">{loadingLabel}</p>
                  <p className="workspace-statistics-price-modal__loading-text">{loadingBody}</p>
                </div>
              </div>
            </div>
          ) : (
            <StatisticsKiCard
              className="workspace-statistics__decision-ai"
              metaStamp
              stamp={generatedLabel}
              avatarLabel={assistantAvatarLabel}
              name={assistantName}
              role={assistantRole}
            />
          )}
        </div>
        <header className="workspace-statistics-price-modal__header">
          <div className="workspace-statistics-price-modal__title-wrap">
            {titleContext ? (
              <p className="workspace-statistics-price-modal__context">{titleContext}</p>
            ) : null}
            <h2 id={titleId} className="workspace-statistics-price-modal__title">{title}</h2>
            <p id={descriptionId} className="workspace-statistics-price-modal__range">{summaryLabel}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="auth-route-modal__close workspace-statistics-price-modal__close"
            aria-label={closeLabel}
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <div className="workspace-statistics-price-modal__body" data-phase={isLoading ? 'loading' : 'ready'}>
          {isLoading ? (
            <div className="workspace-statistics-price-modal__loading" aria-live="polite">
              <div className="workspace-statistics-price-modal__loading-lines" aria-hidden="true">
                <div className="skeleton h-10 w-full rounded-xl" />
                <div className="skeleton h-20 w-full rounded-xl" />
                <div className="skeleton h-16 w-full rounded-xl" />
              </div>
            </div>
          ) : (
            <div className="workspace-statistics-price-modal__content" aria-live="polite">
              {children}
            </div>
          )}
        </div>
      </section>
    </div>
  ), document.body);
}
