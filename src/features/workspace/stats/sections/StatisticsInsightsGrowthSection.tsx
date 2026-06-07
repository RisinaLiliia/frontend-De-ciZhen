'use client';

import type { WorkspaceStatisticsModel } from '../statistics.model';
import {
  StatisticsActionPlanPanel,
  StatisticsGrowthPanel,
  StatisticsInsightsPanel,
  StatisticsRecommendationsPanel,
} from '../StatisticsSections';

type StatisticsInsightsGrowthSectionProps = {
  isPersonalizedMode: boolean;
  copy: WorkspaceStatisticsModel['copy'];
  rightRailRisks: WorkspaceStatisticsModel['rightRailRisks'];
  rightRailOpportunities: WorkspaceStatisticsModel['rightRailOpportunities'];
  rightRailNextSteps: WorkspaceStatisticsModel['rightRailNextSteps'];
  insights: WorkspaceStatisticsModel['insights'];
  showInsightsDebug: boolean;
  growthCards: WorkspaceStatisticsModel['growthCards'];
  subtitle: string;
  fallbackFocusLabel: string | null;
  growthMarketContext: ReturnType<typeof import('../statisticsGrowthContext.model').resolveGrowthMarketContext>;
  insightsPanelRef: React.RefObject<HTMLElement | null>;
  insightsPanelMinHeight?: number | null;
  growthPanelRef: React.RefObject<HTMLElement | null>;
  growthPanelMinHeight?: number | null;
};

export function StatisticsInsightsGrowthSection({
  isPersonalizedMode,
  copy,
  rightRailRisks,
  rightRailOpportunities,
  rightRailNextSteps,
  insights,
  showInsightsDebug,
  growthCards,
  subtitle,
  fallbackFocusLabel,
  growthMarketContext,
  insightsPanelRef,
  insightsPanelMinHeight,
  growthPanelRef,
  growthPanelMinHeight,
}: StatisticsInsightsGrowthSectionProps) {
  if (isPersonalizedMode) {
    return (
      <>
        <StatisticsRecommendationsPanel
          copy={copy}
          groups={[
            {
              title: rightRailRisks?.title ?? copy.userRisksTitle,
              subtitle: rightRailRisks?.subtitle ?? copy.userRisksSubtitle,
              badgeLabel: copy.insightsTypeRiskLabel,
              badgeVariant: 'risk',
              items: rightRailRisks?.items ?? [],
            },
            {
              title: rightRailOpportunities?.title ?? copy.userOpportunitiesTitle,
              subtitle: rightRailOpportunities?.subtitle ?? copy.userOpportunitiesSubtitle,
              badgeLabel: copy.insightsTypeChanceLabel,
              badgeVariant: 'success',
              items: rightRailOpportunities?.items ?? [],
            },
          ]}
        />
        <StatisticsActionPlanPanel
          copy={copy}
          title={rightRailNextSteps?.title}
          subtitle={rightRailNextSteps?.subtitle}
          steps={rightRailNextSteps?.steps ?? []}
        />
      </>
    );
  }

  return (
    <>
      <StatisticsInsightsPanel
        panelRef={insightsPanelRef}
        panelMinHeight={insightsPanelMinHeight}
        copy={copy}
        insights={insights}
        showInsightsDebug={showInsightsDebug}
      />
      <StatisticsGrowthPanel
        panelRef={growthPanelRef}
        panelMinHeight={growthPanelMinHeight}
        copy={copy}
        subtitle={subtitle}
        growthCards={growthCards}
        recommendedForFallback={fallbackFocusLabel}
        marketContext={growthMarketContext}
      />
    </>
  );
}
