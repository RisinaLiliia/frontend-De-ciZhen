'use client';

import * as React from 'react';

import { workspaceRequestsPanelShell } from '@/features/workspace/shared';
import { WorkspaceBadge } from '@/features/workspace/shared/WorkspaceBadge';
import type { WorkspaceStatisticsModel } from '../statistics.model';
import type { WorkspaceDecisionPlan } from '../statisticsDecisionEngine.utils';
import { mapActivitySignalsToOpportunities } from '../mappers/statisticsOpportunities.mapper';
import { StatisticsDecisionLayer } from '../StatisticsSections';
import { StatisticsMarketStateStrip } from './StatisticsMarketStateStrip';
import { StatisticsOpportunitiesSection } from './StatisticsOpportunitiesSection';
import { StatisticsProfileSection } from './StatisticsProfileSection';

type StatisticsIntroSectionProps = {
  model: WorkspaceStatisticsModel;
  statisticsPanelRef: React.RefObject<HTMLElement | null>;
  decisionPlan: WorkspaceDecisionPlan;
  selectedOpportunity: WorkspaceStatisticsModel['opportunityRadar'][number] | null;
  applySelectedOpportunityFocus: () => void;
  profilePanelRef: React.RefObject<HTMLElement | null>;
  funnelContainerRef: React.RefObject<HTMLOListElement | null>;
  funnelVisualRows: ReturnType<typeof import('../statisticsFunnel.utils').buildFunnelVisualRows>;
  isPersonalizedMode: boolean;
  mode: WorkspaceStatisticsModel['mode'];
  funnelPeriodLabel: WorkspaceStatisticsModel['funnelPeriodLabel'];
};

export function StatisticsIntroSection({
  model,
  statisticsPanelRef,
  decisionPlan,
  selectedOpportunity,
  applySelectedOpportunityFocus,
  profilePanelRef,
  funnelContainerRef,
  funnelVisualRows,
  isPersonalizedMode,
  mode,
  funnelPeriodLabel,
}: StatisticsIntroSectionProps) {
  const {
    copy,
    context,
    modeLabel,
    hasBackgroundError,
    isLoading,
    isError,
    priceIntelligence,
    activitySignals,
  } = model;

  const marketStateMetrics = [
    {
      key: 'offer-rate',
      label: copy.activityOfferRateLabel,
      value: activitySignals.find((item) => item.key === 'offer-rate')?.value ?? '—',
      delta: null,
      tone: 'neutral' as const,
    },
    {
      key: 'response-median',
      label: copy.activityResponseMedianLabel,
      value: activitySignals.find((item) => item.key === 'response-median')?.value ?? '—',
      delta: null,
      tone: 'warning' as const,
    },
    {
      key: 'unanswered',
      label: copy.activityUnansweredLabel,
      value: activitySignals.find((item) => item.key === 'unanswered')?.value ?? '—',
      delta: null,
      tone: 'warning' as const,
    },
    {
      key: 'cancellation',
      label: copy.activityCancellationLabel,
      value: activitySignals.find((item) => item.key === 'cancellation')?.value ?? '—',
      delta: null,
      tone: 'neutral' as const,
    },
    {
      key: 'completed',
      label: copy.activityCompletedLabel,
      value: activitySignals.find((item) => item.key === 'completed')?.value ?? '—',
      delta: null,
      tone: 'positive' as const,
    },
    {
      key: 'revenue',
      label: copy.activityRevenueLabel,
      value: activitySignals.find((item) => item.key === 'revenue')?.value ?? '—',
      delta: null,
      tone: 'positive' as const,
    },
  ];

  const opportunityItems = mapActivitySignalsToOpportunities(activitySignals);

  return (
    <section
      ref={statisticsPanelRef}
      className={workspaceRequestsPanelShell('workspace-statistics__intro')}
    >
      <div className="workspace-statistics__hero-stack">
        <StatisticsMarketStateStrip
          title={copy.marketHealthTitle}
          subtitle={copy.marketHealthSubtitle}
          metrics={marketStateMetrics}
        />

        <div className="workspace-statistics__hero-grid">
          {!isLoading && !isError && funnelVisualRows.length ? (
            <StatisticsProfileSection
              profilePanelRef={profilePanelRef}
              copy={copy}
              mode={mode}
              funnelPeriodLabel={funnelPeriodLabel}
              hasFunnelData={model.hasFunnelData}
              funnelVisualRows={funnelVisualRows}
              isPersonalizedMode={isPersonalizedMode}
              funnelContainerRef={funnelContainerRef}
            />
          ) : null}

          <div className="workspace-statistics__decision-cluster">
            <div className="panel-header workspace-statistics__mode-row">
              <div className="workspace-statistics__mode-meta">
                <WorkspaceBadge
                  variant="info"
                  size="sm"
                  className="workspace-statistics__mode-badge"
                >
                  {modeLabel}
                </WorkspaceBadge>
                <span className="section-subtitle">{copy.kpiTitle} · {context.scopeLabel}</span>
              </div>
            </div>

            {hasBackgroundError && !isLoading && !isError ? (
              <div className="workspace-statistics__background-error" role="status" aria-live="polite">
                <strong>{copy.backgroundErrorTitle}</strong>
                <p>{copy.backgroundErrorBody}</p>
              </div>
            ) : null}

            <StatisticsOpportunitiesSection
              title={copy.marketOpportunitiesTitle}
              subtitle={copy.marketOpportunitiesSubtitle}
              items={opportunityItems}
              copy={copy}
            />

            {!isLoading && !isError ? (
              <StatisticsDecisionLayer
                copy={copy}
                decisionInsight={model.decisionInsight}
                decisionPlan={decisionPlan}
                selectedOpportunity={selectedOpportunity}
                priceIntelligence={priceIntelligence}
                onActionClick={applySelectedOpportunityFocus}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
