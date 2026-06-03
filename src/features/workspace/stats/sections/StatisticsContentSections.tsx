// src/features/workspace/stats/sections/StatisticsContentSections.tsx

'use client';

import type * as React from 'react';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../statistics.model';
import { StatisticsPerformanceSection } from './StatisticsPerformanceSection';
import { StatisticsCitiesSection } from './StatisticsCitiesSection';
import { StatisticsOpportunitySection } from './StatisticsOpportunitySection';
import { StatisticsProfileSection } from './StatisticsProfileSection';
import { StatisticsInsightsGrowthSection } from './StatisticsInsightsGrowthSection';

type StatisticsContentSectionsProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  model: WorkspaceStatisticsModel;
  copy: WorkspaceStatisticsModel['copy'];
  filters: WorkspaceStatisticsModel['filters'];
  mode: WorkspaceStatisticsModel['mode'];

  selectedOpportunityRank: WorkspaceStatisticsModel['opportunityRadar'][number]['rank'] | null;
  setSelectedOpportunityRank: React.Dispatch<
    React.SetStateAction<WorkspaceStatisticsModel['opportunityRadar'][number]['rank'] | null>
  >;

  funnelContainerRef: React.RefObject<HTMLOListElement | null>;
  funnelVisualRows: ReturnType<typeof import('../statisticsFunnel.utils').buildFunnelVisualRows>;
  isPersonalizedMode: boolean;
  showInsightsDebug: boolean;

  activityTitle: string;
  activitySubtitle: string;
  activityPoints: WorkspaceStatisticsModel['activityPoints'];
  activityMeta: WorkspaceStatisticsModel['activityMeta'];
  activitySummary: WorkspaceStatisticsModel['activitySummary'];
  categoryFit: WorkspaceStatisticsModel['categoryFit'];

  cityRows: WorkspaceStatisticsModel['cityRows'];
  cityListRows: WorkspaceStatisticsModel['cityListRows'];
  cityListPage: WorkspaceStatisticsModel['cityListPage'];
  cityListLimit: WorkspaceStatisticsModel['cityListLimit'];
  cityListTotalPages: WorkspaceStatisticsModel['cityListTotalPages'];
  cityComparison: WorkspaceStatisticsModel['cityComparison'];

  opportunityRadar: WorkspaceStatisticsModel['opportunityRadar'];
  funnelPeriodLabel: WorkspaceStatisticsModel['funnelPeriodLabel'];
  insights: WorkspaceStatisticsModel['insights'];
  growthCards: WorkspaceStatisticsModel['growthCards'];
  personalizedPricing: WorkspaceStatisticsModel['personalizedPricing'];
  rightRailRisks: WorkspaceStatisticsModel['rightRailRisks'];
  rightRailOpportunities: WorkspaceStatisticsModel['rightRailOpportunities'];
  rightRailNextSteps: WorkspaceStatisticsModel['rightRailNextSteps'];

  resolvedCitiesSubtitle: string;
  resolvedOpportunityTitle: string;
  resolvedGrowthSubtitle: string;
  focusLabel: string | null;
  growthMarketContext: ReturnType<typeof import('../statisticsGrowthContext.model').resolveGrowthMarketContext>;

  insightsPanelRef: React.RefObject<HTMLElement | null>;
  insightsPanelMinHeight?: number | null;
  growthPanelRef: React.RefObject<HTMLElement | null>;
  growthPanelMinHeight?: number | null;
  profilePanelRef: React.RefObject<HTMLElement | null>;
  primaryGridRef: React.RefObject<HTMLDivElement | null>;
  primaryGridMinHeight?: number | null;
  citiesPanelRef: React.RefObject<HTMLElement | null>;
  opportunityPanelRef: React.RefObject<HTMLElement | null>;

  priceIntelligence: WorkspaceStatisticsModel['priceIntelligence'];
};

export function StatisticsContentSections({
  t,
  locale,
  model,
  copy,
  filters,
  mode,
  selectedOpportunityRank,
  setSelectedOpportunityRank,
  funnelContainerRef,
  funnelVisualRows,
  isPersonalizedMode,
  showInsightsDebug,
  activityTitle,
  activitySubtitle,
  activityPoints,
  activityMeta,
  activitySummary,
  categoryFit,
  cityRows,
  cityListRows,
  cityListPage,
  cityListLimit,
  cityListTotalPages,
  cityComparison,
  opportunityRadar,
  funnelPeriodLabel,
  insights,
  growthCards,
  personalizedPricing,
  rightRailRisks,
  rightRailOpportunities,
  rightRailNextSteps,
  resolvedCitiesSubtitle,
  resolvedOpportunityTitle,
  resolvedGrowthSubtitle,
  focusLabel,
  growthMarketContext,
  insightsPanelRef,
  insightsPanelMinHeight,
  growthPanelRef,
  growthPanelMinHeight,
  profilePanelRef,
  primaryGridRef,
  primaryGridMinHeight,
  citiesPanelRef,
  opportunityPanelRef,
  priceIntelligence,
}: StatisticsContentSectionsProps) {
  const formatNumber = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US');
  const formatMarketBalance = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });

  return (
    <div className="workspace-statistics__sections stack-md">
      <StatisticsPerformanceSection
        t={t}
        locale={locale}
        model={model}
        activityTitle={activityTitle}
        activitySubtitle={activitySubtitle}
        activityPoints={activityPoints}
        activityMeta={activityMeta}
        activitySummary={activitySummary}
        categoryFit={categoryFit}
        primaryGridRef={primaryGridRef}
        primaryGridMinHeight={primaryGridMinHeight}
      />

      <StatisticsCitiesSection
        panelRef={citiesPanelRef}
        copy={copy}
        locale={locale}
        subtitle={resolvedCitiesSubtitle}
        cityRowsLength={cityRows.length}
        activeCityId={filters.cityId}
        visibleCityRows={cityListRows}
        cityListPage={cityListPage}
        cityListLimit={cityListLimit}
        cityOptions={model.cityOptions}
        cityTotalPages={cityListTotalPages}
        onSelectCity={model.setCityId}
        onPrevPage={() => model.setCityListPage(Math.max(1, cityListPage - 1))}
        onNextPage={() => model.setCityListPage(Math.min(cityListTotalPages, cityListPage + 1))}
        cityComparison={cityComparison}
        t={t}
        formatNumber={formatNumber}
        formatMarketBalance={formatMarketBalance}
      />

      <StatisticsOpportunitySection
        panelRef={opportunityPanelRef}
        copy={copy}
        locale={locale}
        title={resolvedOpportunityTitle}
        opportunityRadar={opportunityRadar}
        selectedRank={selectedOpportunityRank}
        onSelectRank={setSelectedOpportunityRank}
        priceIntelligence={priceIntelligence}
        pricing={model.userIntelligence}
        personalizedPricing={personalizedPricing}
      />

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

      <StatisticsInsightsGrowthSection
        isPersonalizedMode={isPersonalizedMode}
        copy={copy}
        rightRailRisks={rightRailRisks}
        rightRailOpportunities={rightRailOpportunities}
        rightRailNextSteps={rightRailNextSteps}
        insights={insights}
        showInsightsDebug={showInsightsDebug}
        growthCards={growthCards}
        subtitle={resolvedGrowthSubtitle}
        fallbackFocusLabel={focusLabel}
        growthMarketContext={growthMarketContext}
        insightsPanelRef={insightsPanelRef}
        insightsPanelMinHeight={insightsPanelMinHeight}
        growthPanelRef={growthPanelRef}
        growthPanelMinHeight={growthPanelMinHeight}
      />
    </div>
  );
}