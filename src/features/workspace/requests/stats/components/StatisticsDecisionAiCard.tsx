'use client';

import type { MouseEventHandler } from 'react';

import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';
import type { WorkspaceDecisionPlan } from '../statisticsDecisionEngine.utils';
import { StatisticsKiCard } from './StatisticsKiCard';

type StatisticsDecisionAiCardProps = {
  copy: WorkspaceStatisticsModel['copy'];
  decisionInsight: WorkspaceStatisticsModel['decisionInsight'];
  decisionPlan?: WorkspaceDecisionPlan;
  onActionClick?: MouseEventHandler<HTMLButtonElement>;
  showDetails?: boolean;
  className?: string;
};

export function StatisticsDecisionAiCard({
  copy,
  decisionInsight,
  decisionPlan,
  onActionClick,
  showDetails = true,
  className,
}: StatisticsDecisionAiCardProps) {
  const description = decisionPlan?.summary ?? decisionInsight;
  if (!description.trim()) return null;

  const rootClassName = ['workspace-ai-card', 'workspace-ai-card--decision', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <StatisticsKiCard
      className={rootClassName}
      metaStamp
      layout={decisionPlan?.actionLabel ? 'inline-action' : 'default'}
      stamp={copy.priceGeneratedLabel}
      avatarLabel={copy.insightsAssistantAvatarLabel}
      name={copy.insightsAssistantName}
      role={copy.priceRecommendationLabel}
      description={description}
      actions={decisionPlan?.actionLabel ? (
        <button
          type="button"
          className="auth-social__btn auth-social__btn--google workspace-ai-card__action"
          onClick={onActionClick}
        >
          {decisionPlan.actionLabel}
        </button>
      ) : null}
      details={decisionPlan && showDetails ? (
        <div className="workspace-statistics-ki__decision-grid">
          {decisionPlan.reasons.length > 0 ? (
            <section className="workspace-statistics-ki__decision-block">
              <strong className="workspace-statistics-ki__decision-title">{copy.decisionWhyLabel}</strong>
              <ul className="workspace-statistics-ki__decision-list">
                {decisionPlan.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="workspace-statistics-ki__decision-block">
            <strong className="workspace-statistics-ki__decision-title">{copy.decisionNextStepsLabel}</strong>
            <ol className="workspace-statistics-ki__decision-list workspace-statistics-ki__decision-list--ordered">
              {decisionPlan.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        </div>
      ) : null}
    />
  );
}
