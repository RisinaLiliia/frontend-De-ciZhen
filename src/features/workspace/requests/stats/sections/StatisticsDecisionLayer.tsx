'use client';

import * as React from 'react';

import { WorkspaceDecisionRecommendationModal } from '@/features/workspace/requests/components/WorkspaceDecisionRecommendationModal';
import { WorkspaceDecisionRecommendationSection } from '@/features/workspace/requests/components/WorkspaceDecisionRecommendationSection';
import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';
import type { WorkspaceDecisionPlan } from '../statisticsDecisionEngine.utils';
import { StatisticsDecisionAiCard } from '../components/StatisticsDecisionAiCard';
import { StatisticsMetricSignalCard } from '../components/StatisticsMetricSignalCard';

export function StatisticsDecisionLayer({
  copy,
  decisionInsight,
  decisionPlan,
  selectedOpportunity,
  priceIntelligence,
  onActionClick,
  activitySignals,
  subtitle,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  decisionInsight: WorkspaceStatisticsModel['decisionInsight'];
  decisionPlan: WorkspaceDecisionPlan;
  selectedOpportunity: WorkspaceStatisticsModel['opportunityRadar'][number] | null;
  priceIntelligence: WorkspaceStatisticsModel['priceIntelligence'];
  onActionClick?: () => void;
  activitySignals: WorkspaceStatisticsModel['activitySignals'];
  subtitle?: string;
}) {
  const [isStrategyOpen, setIsStrategyOpen] = React.useState(false);
  const [isAnalyzingStrategy, setIsAnalyzingStrategy] = React.useState(false);

  const focusLabel = selectedOpportunity
    ? `${selectedOpportunity.city} · ${selectedOpportunity.category}`
    : (priceIntelligence.contextLabel ?? null);
  const priceLabel = (priceIntelligence.optimalMinLabel && priceIntelligence.optimalMaxLabel)
    ? `${priceIntelligence.optimalMinLabel} – ${priceIntelligence.optimalMaxLabel}`
    : (priceIntelligence.recommendedRangeLabel ?? '—');
  const summaryLabel = focusLabel ?? priceLabel;
  const reasonsText = decisionPlan.reasons.join(' ');

  const openStrategy = React.useCallback(() => {
    setIsAnalyzingStrategy(true);
    setIsStrategyOpen(true);
  }, []);

  const closeStrategy = React.useCallback(() => {
    setIsStrategyOpen(false);
    setIsAnalyzingStrategy(false);
  }, []);

  const confirmStrategy = React.useCallback(() => {
    onActionClick?.();
    closeStrategy();
  }, [closeStrategy, onActionClick]);

  React.useEffect(() => {
    if (!isStrategyOpen || !isAnalyzingStrategy) return;
    const timeoutId = window.setTimeout(() => {
      setIsAnalyzingStrategy(false);
    }, 1400);
    return () => window.clearTimeout(timeoutId);
  }, [isAnalyzingStrategy, isStrategyOpen]);

  if (activitySignals.length === 0) return null;

  return (
    <section className="workspace-statistics__decision-layer">
      <div className="section-heading workspace-statistics__tile-header workspace-statistics__activity-signals-head">
        <p className="section-title">{copy.activitySignalsTitle}</p>
        <p className="section-subtitle">{subtitle ?? copy.activitySignalsSubtitle}</p>
      </div>
      <ul className="workspace-statistics__activity-signals" aria-label={copy.activitySignalsTitle}>
        {activitySignals.map((item) => (
          <StatisticsMetricSignalCard
            key={item.key}
            as="li"
            label={item.label}
            value={item.value}
            hint={item.hint}
            tone={item.tone}
            comparison={item.marketValue && item.userValue ? {
              userLabel: copy.comparisonUserLabel,
              userValue: item.userValue,
              marketLabel: copy.comparisonMarketLabel,
              marketValue: item.marketValue,
              gapLabel: copy.comparisonGapLabel,
            } : null}
          />
        ))}
      </ul>
      <StatisticsDecisionAiCard
        className="workspace-statistics__decision-ai"
        copy={copy}
        decisionInsight={decisionInsight}
        decisionPlan={decisionPlan}
        onActionClick={openStrategy}
        showDetails={false}
      />
      <WorkspaceDecisionRecommendationModal
        generatedLabel={copy.priceGeneratedLabel}
        assistantAvatarLabel={copy.insightsAssistantAvatarLabel}
        assistantName={copy.insightsAssistantName}
        assistantRole={copy.priceRecommendationLabel}
        loadingLabel={copy.decisionStrategyLoadingLabel}
        loadingBody={copy.decisionStrategyLoadingBody}
        title={copy.decisionStrategyTitle}
        titleContext={focusLabel}
        summaryLabel={summaryLabel}
        closeLabel={copy.decisionStrategyCloseLabel}
        isOpen={isStrategyOpen}
        isLoading={isAnalyzingStrategy}
        onClose={closeStrategy}
      >
        <article className="workspace-decision-modal__content-stack form-stack">
          <WorkspaceDecisionRecommendationSection
            badgeLabel={copy.decisionWhyLabel}
            badgeTone="info"
            tone="performance"
            metric={selectedOpportunity ? `${selectedOpportunity.score.toFixed(1)} / 10` : priceLabel}
            title={decisionPlan.actionLabel}
            text={decisionPlan.summary}
            featured
            className="workspace-decision-modal__hero"
          />
          {reasonsText ? (
            <WorkspaceDecisionRecommendationSection
              badgeLabel={copy.decisionWhyLabel}
              badgeTone="info"
              tone="opportunity"
              metric={priceLabel !== '—' ? priceLabel : undefined}
              text={reasonsText}
              className="workspace-decision-modal__section"
            />
          ) : null}
          <WorkspaceDecisionRecommendationSection
            badgeLabel={copy.decisionNextStepsLabel}
            badgeTone="success"
            tone="promotion"
            text={(
              <ol className="workspace-statistics-ki__decision-list workspace-statistics-ki__decision-list--ordered">
                {decisionPlan.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            )}
            className="workspace-decision-modal__section"
          />
          <div className="workspace-decision-modal__actions">
            <button
              type="button"
              className="auth-social__btn auth-social__btn--google workspace-decision-modal__primary-action"
              onClick={confirmStrategy}
            >
              {decisionPlan.actionLabel}
            </button>
          </div>
        </article>
      </WorkspaceDecisionRecommendationModal>
    </section>
  );
}
