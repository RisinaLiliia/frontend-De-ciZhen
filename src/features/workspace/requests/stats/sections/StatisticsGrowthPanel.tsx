'use client';

import type { Ref } from 'react';
import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { IconPin } from '@/components/ui/icons/icons';
import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';

export function StatisticsGrowthPanel({
  panelRef,
  panelMinHeight,
  copy,
  subtitle,
  growthCards,
  recommendedForFallback,
  marketContext,
}: {
  panelRef?: Ref<HTMLElement>;
  panelMinHeight?: number | null;
  copy: WorkspaceStatisticsModel['copy'];
  subtitle?: string;
  growthCards: WorkspaceStatisticsModel['growthCards'];
  recommendedForFallback?: string | null;
  marketContext?: {
    focusLabel: string | null;
    demand: {
      label: string;
      tone: 'positive' | 'neutral' | 'warning';
    };
    competition: {
      label: string;
      tone: 'positive' | 'neutral' | 'warning';
    };
  } | null;
}) {
  if (growthCards.length === 0) return null;

  const featuredCard = growthCards.find((item) => item.tone === 'primary') ?? growthCards[0] ?? null;
  const secondaryCards = growthCards.filter((item) => item.key !== featuredCard?.key).slice(0, 2);
  const focusLabel = featuredCard?.recommendedFor ?? recommendedForFallback ?? null;
  const heroTitle = featuredCard ? resolveHeroTitle(copy, featuredCard, focusLabel) : '';
  const heroReasons = featuredCard ? buildHeroReasons(copy, focusLabel) : [];
  const heroPosition = buildHeroPosition(copy);
  const nextSteps = buildGrowthNextSteps(copy, focusLabel);

  return (
    <section
      ref={panelRef}
      className="panel stack-sm workspace-statistics__growth workspace-statistics__rail-panel workspace-statistics__rail-panel--growth"
      style={panelMinHeight ? { minHeight: `${panelMinHeight}px` } : undefined}
    >
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{copy.growthTitle}</p>
        <p className="section-subtitle">{subtitle ?? copy.growthSubtitle}</p>
      </header>

      {featuredCard ? (
        <Link
          href={featuredCard.href}
          prefetch={false}
          className="stat-card stat-link workspace-statistics-growth__featured"
        >
          <div className="workspace-statistics-growth__featured-head">
            <div className="workspace-statistics-growth__badges">
              <Badge variant="info" size="sm">{copy.growthFeaturedBadge}</Badge>
              <Badge variant="warning" size="sm">{copy.growthPriorityHigh}</Badge>
            </div>
          </div>

          <div className="workspace-statistics-growth__featured-copy">
            <p className="workspace-statistics-growth__featured-title">{heroTitle}</p>
            <p className="workspace-statistics-growth__featured-text">{featuredCard.body}</p>
          </div>

          <div className="workspace-statistics-growth__effect">
            <span className="workspace-statistics-growth__section-label">{copy.growthExpectedEffectLabel}</span>
            <strong className="workspace-statistics-growth__effect-value">{featuredCard.benefit}</strong>
          </div>

          <div className="workspace-statistics-growth__position">
            <span className="workspace-statistics-growth__section-label">{copy.growthPositionTitle}</span>
            <div className="workspace-statistics-growth__position-grid">
              {heroPosition.map((item) => (
                <div key={item.label} className="workspace-statistics-growth__position-item">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="workspace-statistics-growth__why">
            <span className="workspace-statistics-growth__section-label">{copy.growthWhyNowTitle}</span>
            <ul className="workspace-statistics-growth__why-list">
              {heroReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>

          <span className="link-accent workspace-statistics-growth__cta">
            {copy.growthHighlightCta}
          </span>
        </Link>
      ) : null}

      {secondaryCards.length > 0 ? (
        <div className={`workspace-statistics-growth__grid${secondaryCards.length === 1 ? ' workspace-statistics-growth__grid--single' : ''}`.trim()}>
          {secondaryCards.map((card) => {
            const marketMeta = {
              focusLabel: marketContext?.focusLabel ?? card.recommendedFor ?? recommendedForFallback ?? null,
              demand: marketContext?.demand ?? {
                label: copy.growthDemandHighValue,
                tone: 'positive' as const,
              },
              competition: marketContext?.competition ?? {
                label: copy.growthCompetitionMedium,
                tone: 'neutral' as const,
              },
            };
            const meta = buildActionMeta(copy, card.key, marketMeta);
            const ctaLabel = resolveGrowthCtaLabel(copy, card.key);
            const isMarketGrid = card.key === 'local_ads';

            return (
              <Link
                key={card.key}
                href={card.href}
                prefetch={false}
                className={`stat-card stat-link workspace-statistics-growth__card is-${card.key}`.trim()}
              >
                <div className="workspace-statistics-growth__card-copy">
                  <p className="workspace-statistics-growth__title">{card.title}</p>
                  <p className="workspace-statistics-growth__body">{card.body}</p>
                </div>

                {isMarketGrid ? (
                  <div className="workspace-statistics-growth__market-meta">
                    <div className="workspace-statistics-growth__market-focus">
                      <span className="workspace-statistics-growth__market-focus-label">{copy.growthFocusLabel}</span>
                      <strong className="workspace-statistics-growth__market-focus-value">
                        {marketMeta.focusLabel ? (
                          <>
                            <span className="workspace-statistics-growth__market-focus-icon" aria-hidden="true">
                              <IconPin />
                            </span>
                            <span>{marketMeta.focusLabel}</span>
                          </>
                        ) : '—'}
                      </strong>
                    </div>
                    <div className="workspace-statistics-context__health-grid workspace-statistics-growth__market-health-grid">
                      <article className={`stat-card workspace-statistics-context__health-card is-${marketMeta.demand.tone}`.trim()}>
                        <span className="stat-label">{copy.growthDemandLabel}</span>
                        <strong className="stat-value">{marketMeta.demand.label}</strong>
                      </article>
                      <article className={`stat-card workspace-statistics-context__health-card is-${marketMeta.competition.tone}`.trim()}>
                        <span className="stat-label">{copy.growthCompetitionLabel}</span>
                        <strong className="stat-value">{marketMeta.competition.label}</strong>
                      </article>
                    </div>
                  </div>
                ) : (
                  <dl className="workspace-statistics-growth__meta-list">
                    {meta.map((item) => (
                      <div key={`${card.key}-${item.label}`} className="workspace-statistics-growth__meta-item">
                        <dt>{item.label}</dt>
                        <dd>{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <span className="link-accent workspace-statistics-growth__cta">
                  {ctaLabel}
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}

      {nextSteps.length > 0 ? (
        <div className="workspace-statistics-growth__steps">
          <strong className="workspace-statistics-growth__steps-title">{copy.growthNextStepsTitle}</strong>
          <ol className="workspace-statistics-growth__steps-list">
            {nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

function resolveHeroTitle(
  copy: WorkspaceStatisticsModel['copy'],
  card: WorkspaceStatisticsModel['growthCards'][number],
  focusLabel: string | null,
) {
  if (card.key === 'highlight_profile' && focusLabel) {
    return copy.growthHeroVisibilityTitleWithContext.replace('{context}', focusLabel);
  }
  if (card.key === 'highlight_profile') {
    return copy.growthHeroVisibilityTitle;
  }
  return card.title;
}

function buildHeroPosition(copy: WorkspaceStatisticsModel['copy']) {
  return [
    { label: copy.growthVisibilityLabel, value: copy.growthVisibilityLow },
    { label: copy.growthResponseLabel, value: copy.growthResponseMedium },
  ];
}

function buildHeroReasons(
  copy: WorkspaceStatisticsModel['copy'],
  focusLabel: string | null,
) {
  return [
    focusLabel
      ? copy.growthDemandInContext.replace('{context}', focusLabel)
      : copy.growthDemandGeneric,
    copy.growthMarketChanceCurrent,
    copy.growthVisibilityBelowAverage,
  ];
}

function buildActionMeta(
  copy: WorkspaceStatisticsModel['copy'],
  key: WorkspaceStatisticsModel['growthCards'][number]['key'],
  marketContext: {
    focusLabel: string | null;
    demand: {
      label: string;
      tone: 'positive' | 'neutral' | 'warning';
    };
    competition: {
      label: string;
      tone: 'positive' | 'neutral' | 'warning';
    };
  },
) {
  if (key === 'premium_tools') {
    return [
      { label: copy.growthConversionLabel, value: copy.growthConversionOptimizable },
      { label: copy.growthMarketCompareLabel, value: copy.growthMarketCompareAvailable },
    ];
  }

  return [{ label: copy.growthFocusLabel, value: marketContext.focusLabel ?? '—' }];
}

function resolveGrowthCtaLabel(
  copy: WorkspaceStatisticsModel['copy'],
  key: WorkspaceStatisticsModel['growthCards'][number]['key'],
) {
  if (key === 'local_ads') return copy.growthLocalAdsCta;
  if (key === 'premium_tools') return copy.growthPremiumCta;
  if (key === 'highlight_profile') return copy.growthHighlightCta;
  return copy.growthCta;
}

function buildGrowthNextSteps(
  copy: WorkspaceStatisticsModel['copy'],
  focusLabel: string | null,
) {
  return [
    copy.growthNextStepVisibility,
    focusLabel
      ? copy.growthNextStepLocalAdsWithContext.replace('{context}', focusLabel)
      : copy.growthNextStepLocalAds,
    copy.growthNextStepPricing,
  ];
}
