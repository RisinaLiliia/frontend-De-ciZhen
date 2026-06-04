// src/features/workspace/stats/StatisticsContent.tsx

'use client';

import * as React from 'react';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from './statistics.model';
import type { WorkspaceDecisionPlan } from './statisticsDecisionEngine.utils';
import { useStatisticsContentState } from './hooks/useStatisticsContentState';
import { StatisticsLoadingState } from './StatisticsLoadingState';
import { StatisticsErrorState } from './StatisticsErrorState';
import { StatisticsIntroSection } from './sections/StatisticsIntroSection';
import { StatisticsContentSections } from './sections/StatisticsContentSections';

type StatisticsContentProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  model: WorkspaceStatisticsModel;
  decisionPlan: WorkspaceDecisionPlan;
  selectedOpportunity: WorkspaceStatisticsModel['opportunityRadar'][number] | null;
  selectedOpportunityRank: WorkspaceStatisticsModel['opportunityRadar'][number]['rank'] | null;
  setSelectedOpportunityRank: React.Dispatch<
    React.SetStateAction<WorkspaceStatisticsModel['opportunityRadar'][number]['rank'] | null>
  >;
  applySelectedOpportunityFocus: () => void;
  funnelContainerRef: React.RefObject<HTMLOListElement | null>;
  funnelVisualRows: ReturnType<typeof import('./statisticsFunnel.utils').buildFunnelVisualRows>;
  isPersonalizedMode: boolean;
  showInsightsDebug: boolean;
};

export function StatisticsContent({
  t,
  locale,
  model,
  decisionPlan,
  selectedOpportunity,
  selectedOpportunityRank,
  setSelectedOpportunityRank,
  applySelectedOpportunityFocus,
  funnelContainerRef,
  funnelVisualRows,
  isPersonalizedMode,
}: StatisticsContentProps) {
  const {
    copy,
    filters,
    isLoading,
    isError,
    mode,
    activityTitle,
    activitySubtitle,
    activitySummary,
    activityPoints,
    activityMeta,
    cityRows,
    cityListRows,
    cityListPage,
    cityListLimit,
    cityListTotalPages,
    cityComparison,
    opportunityRadar,
    funnelPeriodLabel,
    categoryFit,
    personalizedPricing,
  } = model;

  const {
    statisticsPanelRef,
    primaryGridRef,
    profilePanelRef,
    citiesPanelRef,
    opportunityPanelRef,
    primaryGridMinHeight,
    resolvedCitiesSubtitle,
    resolvedOpportunityTitle,
  } = useStatisticsContentState({
    model,
    t,
    selectedOpportunity,
  });

  return (
    <section className="workspace-statistics workspace-statistics__column">
      <StatisticsIntroSection
        model={model}
        statisticsPanelRef={statisticsPanelRef}
        decisionPlan={decisionPlan}
        selectedOpportunity={selectedOpportunity}
        applySelectedOpportunityFocus={applySelectedOpportunityFocus}
        profilePanelRef={profilePanelRef}
        funnelContainerRef={funnelContainerRef}
        funnelVisualRows={funnelVisualRows}
        isPersonalizedMode={isPersonalizedMode}
        mode={mode}
        funnelPeriodLabel={funnelPeriodLabel}
      />

      {isLoading ? (
        <StatisticsLoadingState />
      ) : isError ? (
        <StatisticsErrorState t={t} />
      ) : (
        <StatisticsContentSections
          t={t}
          locale={locale}
          model={model}
          copy={copy}
          filters={filters}
          mode={mode}
          selectedOpportunityRank={selectedOpportunityRank}
          setSelectedOpportunityRank={setSelectedOpportunityRank}
          funnelContainerRef={funnelContainerRef}
          funnelVisualRows={funnelVisualRows}
          isPersonalizedMode={isPersonalizedMode}
          activityTitle={activityTitle}
          activitySubtitle={activitySubtitle}
          activityPoints={activityPoints}
          activityMeta={activityMeta}
          activitySummary={activitySummary}
          categoryFit={categoryFit}
          cityRows={cityRows}
          cityListRows={cityListRows}
          cityListPage={cityListPage}
          cityListLimit={cityListLimit}
          cityListTotalPages={cityListTotalPages}
          cityComparison={cityComparison}
          opportunityRadar={opportunityRadar}
          funnelPeriodLabel={funnelPeriodLabel}
          personalizedPricing={personalizedPricing}
          resolvedCitiesSubtitle={resolvedCitiesSubtitle}
          resolvedOpportunityTitle={resolvedOpportunityTitle}
          profilePanelRef={profilePanelRef}
          primaryGridRef={primaryGridRef}
          primaryGridMinHeight={primaryGridMinHeight}
          citiesPanelRef={citiesPanelRef}
          opportunityPanelRef={opportunityPanelRef}
          priceIntelligence={model.priceIntelligence}
        />
      )}
    </section>
  );
}
