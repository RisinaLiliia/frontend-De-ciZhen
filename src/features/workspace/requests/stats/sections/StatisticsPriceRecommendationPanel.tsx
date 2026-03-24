'use client';

import * as React from 'react';
import { WorkspaceDecisionActionCard } from '@/features/workspace/requests/components/WorkspaceDecisionActionCard';
import { WorkspaceDecisionRecommendationModal } from '@/features/workspace/requests/components/WorkspaceDecisionRecommendationModal';
import { WorkspaceDecisionRecommendationSection } from '@/features/workspace/requests/components/WorkspaceDecisionRecommendationSection';
import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';

function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
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
      <WorkspaceDecisionActionCard
        className="workspace-statistics__decision-ai"
        stamp={copy.priceGeneratedLabel}
        avatarLabel={copy.insightsAssistantAvatarLabel}
        name={copy.insightsAssistantName}
        role={copy.priceRecommendationLabel}
        description={priceIntelligence.recommendation ?? copy.priceGuidanceNote}
        actionLabel={copy.priceStrategyButtonLabel}
        onActionClick={openStrategy}
        actionAriaHasPopup
      />
      <WorkspaceDecisionRecommendationModal
        generatedLabel={copy.priceGeneratedLabel}
        assistantAvatarLabel={copy.insightsAssistantAvatarLabel}
        assistantName={copy.insightsAssistantName}
        assistantRole={copy.priceRecommendationLabel}
        loadingLabel={copy.priceStrategyLoadingLabel}
        loadingBody={copy.priceStrategyLoadingBody}
        title={copy.priceStrategyTitle}
        titleContext={priceIntelligence.contextLabel}
        summaryLabel={strategyRangeLabel}
        closeLabel={copy.priceStrategyCloseLabel}
        isOpen={isStrategyOpen}
        isLoading={isAnalyzingStrategy}
        onClose={closeStrategy}
      >
        <article className="workspace-decision-modal__content-stack form-stack">
          <WorkspaceDecisionRecommendationSection
            badgeLabel={copy.pricePositionLabel}
            badgeTone="info"
            tone="performance"
            metric={strategyRangeLabel}
            title={strategyRangeLabel}
            text={strategyWhyText}
            featured
            className="workspace-decision-modal__hero"
          />
          <WorkspaceDecisionRecommendationSection
            badgeLabel={copy.priceStrategyObservationLabel}
            badgeTone="info"
            tone="performance"
            metric={marketAverageLabel !== '—' ? marketAverageLabel : undefined}
            text={strategyObservationText}
            className="workspace-decision-modal__section"
          />
          <WorkspaceDecisionRecommendationSection
            badgeLabel={copy.priceStrategyActionLabel}
            badgeTone="success"
            tone="opportunity"
            text={strategyActionText}
            className="workspace-decision-modal__section"
          />
          <WorkspaceDecisionRecommendationSection
            badgeLabel={copy.priceStrategyPremiumLabel}
            badgeTone="warning"
            tone="promotion"
            text={strategyPremiumText}
            className="workspace-decision-modal__section"
          />
        </article>
      </WorkspaceDecisionRecommendationModal>
    </section>
  );
}
