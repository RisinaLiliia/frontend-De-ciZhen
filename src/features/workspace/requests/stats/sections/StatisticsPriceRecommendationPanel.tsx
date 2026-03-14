'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { focusIfPresent, getTrapFocusTarget, resolveInitialFocusTarget } from '@/lib/a11y/focusTrap';
import type { WorkspaceStatisticsModel } from '../useWorkspaceStatisticsModel';
import { StatisticsKiCard } from '../components/StatisticsKiCard';

function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

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

function StatisticsPriceStrategyModal({
  copy,
  titleContext,
  strategyRangeLabel,
  isOpen,
  isAnalyzing,
  onClose,
  children,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  titleContext: string | null;
  strategyRangeLabel: string;
  isOpen: boolean;
  isAnalyzing: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
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
      className="dc-modal workspace-statistics-layout workspace-statistics-price-modal"
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
        aria-label={copy.priceStrategyCloseLabel}
      />
      <section
        ref={panelRef}
        className="dc-modal__panel dc-modal__panel--compact workspace-statistics-price-modal__panel"
      >
        <div className="workspace-statistics-price-modal__intro" data-phase={isAnalyzing ? 'loading' : 'ready'}>
          {isAnalyzing ? (
            <div className="workspace-statistics-ki workspace-statistics-ki--meta workspace-statistics-price-modal__intro-loader" aria-live="polite">
              <span className="workspace-statistics-ki__stamp">{copy.priceGeneratedLabel}</span>
              <div className="workspace-statistics-price-modal__intro-loader-head">
                <div className="workspace-statistics-price-modal__loading-visual" aria-hidden="true">
                  <div className="workspace-statistics-price-modal__loading-orb" />
                  <div className="workspace-statistics-price-modal__loading-beam" />
                </div>
                <div className="workspace-statistics-price-modal__intro-loader-copy">
                  <p className="workspace-statistics-price-modal__loading-title">{copy.priceStrategyLoadingLabel}</p>
                  <p className="workspace-statistics-price-modal__loading-text">{copy.priceStrategyLoadingBody}</p>
                </div>
              </div>
            </div>
          ) : (
            <StatisticsKiCard
              className="workspace-statistics__decision-ai"
              metaStamp
              stamp={copy.priceGeneratedLabel}
              avatarLabel={copy.insightsAssistantAvatarLabel}
              name={copy.insightsAssistantName}
              role={copy.priceRecommendationLabel}
            />
          )}
        </div>
        <header className="workspace-statistics-price-modal__header">
          <div className="workspace-statistics-price-modal__title-wrap">
            {titleContext ? (
              <p className="workspace-statistics-price-modal__context">{titleContext}</p>
            ) : null}
            <h2 id={titleId} className="workspace-statistics-price-modal__title">{copy.priceStrategyTitle}</h2>
            <p id={descriptionId} className="workspace-statistics-price-modal__range">{strategyRangeLabel}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="workspace-statistics-price-modal__close"
            aria-label={copy.priceStrategyCloseLabel}
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <div className="workspace-statistics-price-modal__body" data-phase={isAnalyzing ? 'loading' : 'ready'}>
          {isAnalyzing ? (
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

export function StatisticsPriceRecommendationPanel({
  copy,
  priceIntelligence,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  priceIntelligence: WorkspaceStatisticsModel['priceIntelligence'];
}) {
  const [isStrategyOpen, setIsStrategyOpen] = React.useState(false);
  const [isAnalyzingStrategy, setIsAnalyzingStrategy] = React.useState(false);
  const strategyRangeLabel =
    (priceIntelligence.optimalMinLabel && priceIntelligence.optimalMaxLabel)
      ? `${priceIntelligence.optimalMinLabel} – ${priceIntelligence.optimalMaxLabel}`
      : (priceIntelligence.recommendedRangeLabel ?? '—');
  const citySuffix = priceIntelligence.cityLabel ? ` in ${priceIntelligence.cityLabel}` : '';
  const marketAverageLabel = priceIntelligence.marketAverageLabel ?? '—';
  const strategyWhyText = fillTemplate(copy.priceStrategyWhyTemplate, {
    range: strategyRangeLabel,
    citySuffix,
  });
  const strategyObservationText = fillTemplate(copy.priceStrategyObservationTemplate, {
    range: strategyRangeLabel,
    average: marketAverageLabel,
  });
  const strategyActionText = fillTemplate(copy.priceStrategyActionTemplate, {
    range: strategyRangeLabel,
    average: marketAverageLabel,
  });
  const strategyPremiumText = fillTemplate(copy.priceStrategyPremiumTemplate, {
    range: strategyRangeLabel,
    average: marketAverageLabel,
  });
  const hasRecommendation =
    Boolean(priceIntelligence.recommendation) ||
    Boolean(priceIntelligence.contextLabel) ||
    Boolean(priceIntelligence.recommendedRangeLabel) ||
    Boolean(priceIntelligence.marketAverageLabel);

  const openStrategy = React.useCallback(() => {
    setIsAnalyzingStrategy(true);
    setIsStrategyOpen(true);
  }, []);

  const closeStrategy = React.useCallback(() => {
    setIsStrategyOpen(false);
    setIsAnalyzingStrategy(false);
  }, []);

  React.useEffect(() => {
    if (!isStrategyOpen || !isAnalyzingStrategy) return;
    const timeoutId = window.setTimeout(() => {
      setIsAnalyzingStrategy(false);
    }, 1400);
    return () => window.clearTimeout(timeoutId);
  }, [isAnalyzingStrategy, isStrategyOpen]);

  if (!hasRecommendation) {
    return (
      <section className="panel requests-stats-chart workspace-statistics-price-recommendation">
        <p className="workspace-statistics__empty">{copy.priceNoData}</p>
      </section>
    );
  }

  return (
    <section className="panel requests-stats-chart workspace-statistics-price-recommendation">
      <StatisticsKiCard
        className="workspace-statistics__decision-ai"
        metaStamp
        stamp={copy.priceGeneratedLabel}
        avatarLabel={copy.insightsAssistantAvatarLabel}
        name={copy.insightsAssistantName}
        role={copy.priceRecommendationLabel}
        description={priceIntelligence.recommendation ?? copy.priceGuidanceNote}
        actions={(
          <button
            type="button"
            className="auth-social__btn auth-social__btn--google workspace-statistics-price__strategy-button"
            onClick={openStrategy}
            aria-haspopup="dialog"
          >
            {copy.priceStrategyButtonLabel}
          </button>
        )}
      />
      <StatisticsPriceStrategyModal
        copy={copy}
        titleContext={priceIntelligence.contextLabel}
        strategyRangeLabel={strategyRangeLabel}
        isOpen={isStrategyOpen}
        isAnalyzing={isAnalyzingStrategy}
        onClose={closeStrategy}
      >
        <article className="workspace-statistics-price__strategy-panel form-stack">
          <section className="workspace-statistics-insights__item workspace-statistics-insights__item is-featured is-performance workspace-statistics-price__strategy-hero">
            <span className="workspace-statistics-insights__content">
              <span className="workspace-statistics-insights__eyebrow">
                <span className="status-badge status-badge--info workspace-statistics-insights__chip">
                  {copy.pricePositionLabel}
                </span>
                <span className="workspace-statistics-insights__metric">{strategyRangeLabel}</span>
              </span>
              <strong className="workspace-statistics-insights__title workspace-statistics-price__strategy-hero-range">
                {strategyRangeLabel}
              </strong>
              <span className="workspace-statistics-insights__text workspace-statistics-price__strategy-hero-text">
                {strategyWhyText}
              </span>
            </span>
          </section>
          <section className="workspace-statistics-insights__item is-performance workspace-statistics-price__strategy-section">
            <span className="workspace-statistics-insights__content">
              <span className="workspace-statistics-insights__eyebrow">
                <span className="status-badge status-badge--info workspace-statistics-insights__chip">
                  {copy.priceStrategyObservationLabel}
                </span>
                {marketAverageLabel !== '—' ? (
                  <span className="workspace-statistics-insights__metric">{marketAverageLabel}</span>
                ) : null}
              </span>
              <span className="workspace-statistics-insights__text workspace-statistics-price__strategy-section-text">
                {strategyObservationText}
              </span>
            </span>
          </section>
          <section className="workspace-statistics-insights__item is-opportunity workspace-statistics-price__strategy-section">
            <span className="workspace-statistics-insights__content">
              <span className="workspace-statistics-insights__eyebrow">
                <span className="status-badge status-badge--success workspace-statistics-insights__chip">
                  {copy.priceStrategyActionLabel}
                </span>
              </span>
              <span className="workspace-statistics-insights__text workspace-statistics-price__strategy-section-text">
                {strategyActionText}
              </span>
            </span>
          </section>
          <section className="workspace-statistics-insights__item is-promotion workspace-statistics-price__strategy-section">
            <span className="workspace-statistics-insights__content">
              <span className="workspace-statistics-insights__eyebrow">
                <span className="status-badge status-badge--warning workspace-statistics-insights__chip">
                  {copy.priceStrategyPremiumLabel}
                </span>
              </span>
              <span className="workspace-statistics-insights__text workspace-statistics-price__strategy-section-text">
                {strategyPremiumText}
              </span>
            </span>
          </section>
        </article>
      </StatisticsPriceStrategyModal>
    </section>
  );
}
