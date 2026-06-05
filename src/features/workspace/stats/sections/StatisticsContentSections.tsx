// src/features/workspace/stats/sections/StatisticsContentSections.tsx

'use client';

import type * as React from 'react';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../statistics.model';
import { StatisticsPerformanceSection } from './StatisticsPerformanceSection';
import { StatisticsCitiesSection } from './StatisticsCitiesSection';
import { StatisticsOpportunitySection } from './StatisticsOpportunitySection';

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
  activityTitle: string;
  activitySubtitle: string;
  activityPoints: WorkspaceStatisticsModel['activityPoints'];
  activityMeta: WorkspaceStatisticsModel['activityMeta'];
  activitySummary: WorkspaceStatisticsModel['activitySummary'];
  cityRows: WorkspaceStatisticsModel['cityRows'];
  cityListRows: WorkspaceStatisticsModel['cityListRows'];
  cityListPage: WorkspaceStatisticsModel['cityListPage'];
  cityListLimit: WorkspaceStatisticsModel['cityListLimit'];
  cityListTotalPages: WorkspaceStatisticsModel['cityListTotalPages'];
  cityComparison: WorkspaceStatisticsModel['cityComparison'];
  opportunityRadar: WorkspaceStatisticsModel['opportunityRadar'];
  funnelPeriodLabel: WorkspaceStatisticsModel['funnelPeriodLabel'];
  personalizedPricing: WorkspaceStatisticsModel['personalizedPricing'];
  resolvedCitiesSubtitle: string;
  resolvedOpportunityTitle: string;
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
  selectedOpportunityRank,
  setSelectedOpportunityRank,
  activityTitle,
  activitySubtitle,
  activityPoints,
  activityMeta,
  activitySummary,
  cityRows,
  cityListRows,
  cityListPage,
  cityListLimit,
  cityListTotalPages,
  cityComparison,
  opportunityRadar,
  personalizedPricing,
  resolvedCitiesSubtitle,
  resolvedOpportunityTitle,
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
        model={model}
        activityTitle={activityTitle}
        activitySubtitle={activitySubtitle}
        activityPoints={activityPoints}
        activityMeta={activityMeta}
        activitySummary={activitySummary}
        locale={locale}
        primaryGridRef={primaryGridRef}
        primaryGridMinHeight={primaryGridMinHeight}
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
    </div>
  );
}
