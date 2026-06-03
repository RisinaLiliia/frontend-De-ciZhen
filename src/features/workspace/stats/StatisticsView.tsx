'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useStatisticsOpportunitySelection } from './hooks/useStatisticsOpportunitySelection';
import { useStatisticsNavigation, type StatisticsDecisionPlan } from './hooks/useStatisticsNavigation';
import { useStatisticsFunnelLayout } from './hooks/useStatisticsFunnelLayout';
import { mapStatisticsRailModel } from './mappers/statisticsRail.mapper';
import { StatisticsContent } from './StatisticsContent';
import { StatisticsRail } from './StatisticsRail';
import { buildDecisionPlan, buildPersonalizedDecisionPlan } from './statisticsDecisionEngine.utils';
import type { Locale } from '@/lib/i18n/t';
import type { I18nKey } from '@/lib/i18n/keys';
import type { WorkspaceStatisticsModel } from './statistics.model';

type StatisticsViewProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  model: WorkspaceStatisticsModel;
  slot?: 'full' | 'content' | 'rail';
};

export function StatisticsView({
  t,
  locale,
  model,
  slot = 'full',
}: StatisticsViewProps) {
  const searchParams = useSearchParams();
  const showInsightsDebug = searchParams.get('insightsDebug') === '1';
  const {
    copy,
    filters,
    mode,
    userIntelligence,
    sectionMeta,
    context,
    rightRailNextSteps,
    funnel,
  } = model;

  const {
    selectedOpportunityRank,
    setSelectedOpportunityRank,
    selectedOpportunity,
  } = useStatisticsOpportunitySelection({ opportunityRadar: model.opportunityRadar });

  const activePriceIntelligence = selectedOpportunity?.priceIntelligence ?? model.priceIntelligence;

  const focusLabel = React.useMemo(() => {
    if (filters.categoryKey && filters.cityId) return `${context.categoryLabel} in ${context.cityLabel}`;
    if (filters.categoryKey) return context.categoryLabel;
    if (filters.cityId) return context.cityLabel;
    return null;
  }, [context.categoryLabel, context.cityLabel, filters.categoryKey, filters.cityId]);

  const decisionSubtitle = focusLabel
    ? `${copy.activitySignalsSubtitle} · ${focusLabel}`
    : copy.activitySignalsSubtitle;

  const decisionPlan = React.useMemo(() => {
    const withActionLabel = (plan: StatisticsDecisionPlan) => (
      model.decisionActionLabel ? { ...plan, actionLabel: model.decisionActionLabel } : plan
    );

    if (mode === 'personalized' && userIntelligence) {
      return withActionLabel(buildPersonalizedDecisionPlan({
        copy,
        personalizedPricing: model.personalizedPricing,
        risks: model.rightRailRisks,
        opportunities: model.rightRailOpportunities,
        nextSteps: rightRailNextSteps,
        selectedOpportunity,
        currentCityId: filters.cityId,
        currentCategoryKey: filters.categoryKey,
      }));
    }

    return buildDecisionPlan({
      locale,
      copy,
      decisionInsight: model.decisionInsight,
      selectedOpportunity,
      priceIntelligence: activePriceIntelligence,
      currentCityId: filters.cityId,
      currentCategoryKey: filters.categoryKey,
    });
  }, [
    activePriceIntelligence,
    copy,
    filters.categoryKey,
    filters.cityId,
    locale,
    mode,
    model.decisionActionLabel,
    model.decisionInsight,
    model.personalizedPricing,
    model.rightRailOpportunities,
    model.rightRailRisks,
    rightRailNextSteps,
    selectedOpportunity,
    userIntelligence,
  ]);

  const { applySelectedOpportunityFocus } = useStatisticsNavigation({
    model,
    decisionPlan,
    selectedOpportunity,
  });

  const { funnelContainerRef, funnelVisualRows } = useStatisticsFunnelLayout({
    funnel,
    copy,
    mode,
  });

  const resolvedDecisionSubtitle = sectionMeta.decisionSubtitle ?? decisionSubtitle;

  const railModel = React.useMemo(
    () => mapStatisticsRailModel({
      copy,
      decisionPlan,
      activePriceIntelligence,
      selectedOpportunity,
      rightRailNextSteps,
      resolvedDecisionSubtitle,
      contextScopeLabel: context.scopeLabel,
      onPrimaryAction: applySelectedOpportunityFocus,
      onQueueItemAction: applySelectedOpportunityFocus,
    }),
    [
      activePriceIntelligence,
      applySelectedOpportunityFocus,
      context.scopeLabel,
      copy,
      decisionPlan,
      rightRailNextSteps,
      resolvedDecisionSubtitle,
      selectedOpportunity,
    ],
  );

  const content = (
    <StatisticsContent
      t={t}
      locale={locale}
      model={model}
      decisionPlan={decisionPlan}
      selectedOpportunity={selectedOpportunity}
      selectedOpportunityRank={selectedOpportunityRank}
      setSelectedOpportunityRank={setSelectedOpportunityRank}
      applySelectedOpportunityFocus={applySelectedOpportunityFocus}
      funnelContainerRef={funnelContainerRef}
      funnelVisualRows={funnelVisualRows}
      isPersonalizedMode={mode === 'personalized' && Boolean(userIntelligence)}
      showInsightsDebug={showInsightsDebug}
    />
  );

  const rail = <StatisticsRail model={railModel} isLoading={model.isLoading} />;

  if (slot === 'content') {
    return content;
  }

  if (slot === 'rail') {
    return rail;
  }

  return (
    <div className="requests-grid requests-grid--equal-cols workspace-statistics-layout">
      {content}
      {rail}
    </div>
  );
}
