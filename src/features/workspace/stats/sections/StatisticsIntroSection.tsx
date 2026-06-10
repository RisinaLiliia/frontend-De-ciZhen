'use client';

import * as React from 'react';

import { workspaceRequestsPanelShell } from '@/features/workspace/shared';
import type { I18nKey } from '@/lib/i18n/keys';
import type { WorkspaceStatisticsModel } from '../statistics.model';
import { StatisticsDemandPanelSection } from '../StatisticsSections';
import { StatisticsMarketStateStrip } from './StatisticsMarketStateStrip';
import { StatisticsProfileSection } from './StatisticsProfileSection';

type StatisticsIntroSectionProps = {
  t: (key: I18nKey) => string;
  model: WorkspaceStatisticsModel;
  statisticsPanelRef: React.RefObject<HTMLElement | null>;
  profilePanelRef: React.RefObject<HTMLElement | null>;
  funnelContainerRef: React.RefObject<HTMLOListElement | null>;
  funnelVisualRows: ReturnType<typeof import('../statisticsFunnel.utils').buildFunnelVisualRows>;
  isPersonalizedMode: boolean;
  mode: WorkspaceStatisticsModel['mode'];
  funnelPeriodLabel: WorkspaceStatisticsModel['funnelPeriodLabel'];
};

export function StatisticsIntroSection({
  t,
  model,
  statisticsPanelRef,
  profilePanelRef,
  funnelContainerRef,
  funnelVisualRows,
  isPersonalizedMode,
  mode,
  funnelPeriodLabel,
}: StatisticsIntroSectionProps) {
  const { copy, hasBackgroundError, isLoading, isError, activitySignals } = model;

  const getActivitySignal = (key: string) => activitySignals.find((item) => item.key === key);
  const getActivitySignalValue = (key: string) => getActivitySignal(key)?.value ?? '—';

  const marketStateMetrics = [
    {
      key: 'offer-rate',
      label: copy.activityOfferRateLabel,
      value: getActivitySignalValue('offer-rate'),
      tone: getActivitySignal('offer-rate')?.tone ?? 'neutral',
    },
    {
      key: 'response-median',
      label: copy.activityResponseMedianLabel,
      value: getActivitySignalValue('response-median'),
      tone: getActivitySignal('response-median')?.tone ?? 'neutral',
    },
    {
      key: 'unanswered',
      label: copy.activityUnansweredLabel,
      value: getActivitySignalValue('unanswered'),
      tone: getActivitySignal('unanswered')?.tone ?? 'neutral',
    },
    {
      key: 'cancellation',
      label: copy.activityCancellationLabel,
      value: getActivitySignalValue('cancellation'),
      tone: getActivitySignal('cancellation')?.tone ?? 'neutral',
    },
    {
      key: 'completed',
      label: copy.activityCompletedLabel,
      value: getActivitySignalValue('completed'),
      tone: getActivitySignal('completed')?.tone ?? 'neutral',
    },
    {
      key: 'revenue',
      label: copy.activityRevenueLabel,
      value: getActivitySignalValue('revenue'),
      tone: getActivitySignal('revenue')?.tone ?? 'neutral',
    },
  ];

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

        <div className="workspace-statistics__intro-grid">
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

          <StatisticsDemandPanelSection
            model={model}
            t={t}
            categoryFit={model.categoryFit}
            className="workspace-overview__panel workspace-overview__panel--demand workspace-overview__demand-panel workspace-statistics__intro-demand"
            headerClassName="workspace-overview__tile-header"
            onSelectCategory={model.setCategoryKey}
          />
        </div>

        {hasBackgroundError && !isLoading && !isError ? (
          <div className="workspace-statistics__background-error" role="status" aria-live="polite">
            <strong>{copy.backgroundErrorTitle}</strong>
            <p>{copy.backgroundErrorBody}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
