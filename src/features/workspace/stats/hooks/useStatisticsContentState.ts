'use client';

import * as React from 'react';
import { useSyncedPanelMinHeight } from '@/hooks/useSyncedPanelMinHeight';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../statistics.model';
import { resolveGrowthMarketContext } from '../statisticsGrowthContext.model';

type UseStatisticsContentStateArgs = {
  model: WorkspaceStatisticsModel;
  locale: Locale;
  t: (key: I18nKey) => string;
  selectedOpportunity: WorkspaceStatisticsModel['opportunityRadar'][number] | null;
  isPersonalizedMode: boolean;
  funnelVisualRows: ReturnType<typeof import('../statisticsFunnel.utils').buildFunnelVisualRows>;
};

export function useStatisticsContentState({
  model,
  locale,
  t,
  selectedOpportunity,
  isPersonalizedMode,
  funnelVisualRows,
}: UseStatisticsContentStateArgs) {
  const {
    copy,
    filters,
    context,
    sectionMeta,
    activitySignals,
    cityRows,
    cityListRows,
    cityListPage,
    decisionLayerSubtitle,
    mode,
    funnelPeriodLabel,
    insights,
    growthCards,
    opportunityRadar,
    userIntelligence,
    demandRows,
  } = model;

  const statisticsPanelRef = React.useRef<HTMLElement | null>(null);
  const primaryGridRef = React.useRef<HTMLDivElement | null>(null);
  const profilePanelRef = React.useRef<HTMLElement | null>(null);
  const citiesPanelRef = React.useRef<HTMLElement | null>(null);
  const insightsPanelRef = React.useRef<HTMLElement | null>(null);
  const growthPanelRef = React.useRef<HTMLElement | null>(null);
  const opportunityPanelRef = React.useRef<HTMLElement | null>(null);

  const focusLabel = React.useMemo(() => {
    if (filters.categoryKey && filters.cityId) return `${context.categoryLabel} in ${context.cityLabel}`;
    if (filters.categoryKey) return context.categoryLabel;
    if (filters.cityId) return context.cityLabel;
    return null;
  }, [context.categoryLabel, context.cityLabel, filters.categoryKey, filters.cityId]);

  const opportunityTitle = focusLabel
    ? t(I18N_KEYS.workspace.statsOpportunityTitleWithFocus)
        .replace('{title}', copy.opportunityTitle)
        .replace('{focus}', focusLabel)
    : copy.opportunityTitle;

  const growthSubtitle = focusLabel
    ? `${copy.growthSubtitle} · ${focusLabel}`
    : copy.growthSubtitle;

  const decisionSubtitle = focusLabel
    ? `${copy.activitySignalsSubtitle} · ${focusLabel}`
    : copy.activitySignalsSubtitle;

  const personalizedDecisionSubtitle = focusLabel
    ? `${copy.userDecisionSubtitle} · ${focusLabel}`
    : copy.userDecisionSubtitle;

  const personalizedDecisionLayerSubtitle = mode === 'personalized'
    ? (decisionLayerSubtitle ?? sectionMeta.decisionSubtitle ?? personalizedDecisionSubtitle)
    : personalizedDecisionSubtitle;

  const citiesSubtitle = context.mode === 'focus'
    ? `${copy.citiesSubtitle} · ${context.periodLabel}`
    : copy.citiesSubtitle;

  const resolvedCitiesSubtitle = sectionMeta.citiesSubtitle ?? citiesSubtitle;
  const resolvedOpportunityTitle = sectionMeta.opportunityTitle ?? opportunityTitle;
  const resolvedGrowthSubtitle = sectionMeta.growthSubtitle ?? growthSubtitle;

  const introPanelMinHeight = useSyncedPanelMinHeight({
    sourceRef: statisticsPanelRef,
    mode: 'sourceHeight',
    watchKey: `${activitySignals.length}-${model.isError ? 1 : 0}-${model.isLoading ? 1 : 0}`,
  });

  const growthPanelMinHeight = useSyncedPanelMinHeight({
    sourceRef: citiesPanelRef,
    targetRef: growthPanelRef,
    mode: 'sourceBottomToTargetTop',
    watchKey: `${cityListRows.length}-${cityListPage}-${model.isError ? 1 : 0}-${model.isLoading ? 1 : 0}`,
  });

  const insightsPanelMinHeight = useSyncedPanelMinHeight({
    sourceRef: citiesPanelRef,
    targetRef: insightsPanelRef,
    mode: 'sourceHeight',
    watchKey: `${cityListRows.length}-${cityListPage}-${insights.length}-${model.isError ? 1 : 0}-${model.isLoading ? 1 : 0}`,
  });

  const primaryGridMinHeight = useSyncedPanelMinHeight({
    sourceRef: profilePanelRef,
    targetRef: primaryGridRef,
    mode: 'sourceHeight',
    watchKey: `${Boolean(funnelPeriodLabel) ? 1 : 0}-${model.activityPoints.length}-${demandRows.length}-${model.isError ? 1 : 0}-${model.isLoading ? 1 : 0}`,
  });

  const growthMarketContext = React.useMemo(
    () => resolveGrowthMarketContext({
      copy,
      filters,
      context,
      cityRows,
      selectedOpportunity,
      opportunityRadar,
      userIntelligence,
      growthCards,
      fallbackFocusLabel: focusLabel,
    }),
    [
      cityRows,
      context,
      copy,
      filters,
      focusLabel,
      growthCards,
      opportunityRadar,
      selectedOpportunity,
      userIntelligence,
    ],
  );

  return {
    statisticsPanelRef,
    primaryGridRef,
    profilePanelRef,
    citiesPanelRef,
    insightsPanelRef,
    growthPanelRef,
    opportunityPanelRef,
    introPanelMinHeight,
    primaryGridMinHeight,
    insightsPanelMinHeight,
    growthPanelMinHeight,
    focusLabel,
    resolvedCitiesSubtitle,
    resolvedOpportunityTitle,
    resolvedGrowthSubtitle,
    personalizedDecisionLayerSubtitle,
    decisionSubtitle,
    growthMarketContext,
  };
}
