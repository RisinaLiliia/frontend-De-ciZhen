'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useSyncedPanelMinHeight } from '@/hooks/useSyncedPanelMinHeight';
import { getWorkspacePublicOverview } from '@/lib/api/workspace';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { WorkspacePublicDemandMapPanel } from '../WorkspacePublicDemandMapPanel';
import { workspaceQK } from '../queryKeys';
import { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT } from '../workspace.constants';
import type { WorkspaceStatisticsModel } from './workspaceStatistics.model';
import { StatisticsContextPanel } from './components/StatisticsContextPanel';
import { buildDecisionPlan, buildPersonalizedDecisionPlan } from './statisticsDecisionEngine.utils';
import { buildFunnelVisualRows } from './statisticsFunnel.utils';
import { paginateItems, parsePageParam } from './statisticsPagination.utils';
import { selectOpportunityAnalysisItem } from './sections/opportunity/opportunity.utils';
import { applyPageQuery, isPageQueryInSync, toPageQueryValue } from './statisticsUrlState.utils';
import {
  StatisticsActionPlanPanel,
  StatisticsCitiesPanel,
  StatisticsDecisionLayer,
  StatisticsDemandPanelSection,
  StatisticsGrowthPanel,
  StatisticsInsightsPanel,
  StatisticsOpportunityPanel,
  StatisticsPerformancePositionPanel,
  StatisticsPriorityPanel,
  StatisticsPricePanel,
  StatisticsPriceRecommendationPanel,
} from './WorkspaceStatisticsSections';

type WorkspaceStatisticsViewProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  model: WorkspaceStatisticsModel;
};
const CITY_PAGE_SIZE = 10;
const CITY_PAGE_QUERY_KEY = 'statsCityPage';

export function WorkspaceStatisticsView({
  t,
  locale,
  model,
}: WorkspaceStatisticsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showInsightsDebug = searchParams.get('insightsDebug') === '1';
  const formatNumber = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US');
  const formatMarketBalance = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
  const cityPageFromUrl = React.useMemo(
    () => parsePageParam(searchParams.get(CITY_PAGE_QUERY_KEY)),
    [searchParams],
  );
  const [cityQuery, setCityQuery] = React.useState('');
  const [cityPage, setCityPage] = React.useState(() => cityPageFromUrl ?? 1);
  const funnelContainerRef = React.useRef<HTMLOListElement | null>(null);
  const statisticsPanelRef = React.useRef<HTMLElement | null>(null);
  const profilePanelRef = React.useRef<HTMLElement | null>(null);
  const citiesPanelRef = React.useRef<HTMLElement | null>(null);
  const insightsPanelRef = React.useRef<HTMLElement | null>(null);
  const growthPanelRef = React.useRef<HTMLElement | null>(null);
  const opportunityPanelRef = React.useRef<HTMLElement | null>(null);
  const [funnelContainerWidth, setFunnelContainerWidth] = React.useState(0);
  const {
    copy,
    filters,
    isLoading,
    isError,
    hasBackgroundError,
    mode,
    modeLabel,
    viewerMode,
    setViewerMode,
    context,
    sectionMeta,
    activityTitle,
    activitySubtitle,
    activitySummary,
    activityPoints,
    activityMeta,
    activityTrend,
    decisionLayerSubtitle,
    decisionInsight,
    decisionActionLabel,
    activitySignals,
    cityRows,
    cityComparison,
    opportunityRadar,
    funnel,
    funnelComparison,
    funnelPeriodLabel,
    funnelSummary,
    hasFunnelData,
    funnelDropoff,
    conversion,
    insights,
    growthCards,
    categoryFit,
    personalizedPricing,
    rightRailRisks,
    rightRailOpportunities,
    rightRailNextSteps,
    userIntelligence,
  } = model;
  const isPersonalizedMode = mode === 'personalized' && Boolean(userIntelligence);
  const normalizedCityQuery = cityQuery.trim().toLowerCase();
  const hasCityQuery = normalizedCityQuery.length > 0;
  const focusLabel = React.useMemo(() => {
    if (filters.categoryKey && filters.cityId) return `${context.categoryLabel} in ${context.cityLabel}`;
    if (filters.categoryKey) return context.categoryLabel;
    if (filters.cityId) return context.cityLabel;
    return null;
  }, [context.categoryLabel, context.cityLabel, filters.categoryKey, filters.cityId]);
  const opportunityTitle = focusLabel ? `${copy.opportunityTitle} ${locale === 'de' ? 'für' : 'for'} ${focusLabel}` : copy.opportunityTitle;
  const growthSubtitle = focusLabel
    ? `${copy.growthSubtitle} · ${focusLabel}`
    : copy.growthSubtitle;
  const decisionSubtitle = focusLabel
    ? `${copy.activitySignalsSubtitle} · ${focusLabel}`
    : copy.activitySignalsSubtitle;
  const personalizedDecisionSubtitle = focusLabel
    ? `${copy.userDecisionSubtitle} · ${focusLabel}`
    : copy.userDecisionSubtitle;
  const personalizedDecisionLayerSubtitle = model.mode === 'personalized'
    ? (decisionLayerSubtitle ?? model.sectionMeta.decisionSubtitle ?? personalizedDecisionSubtitle)
    : personalizedDecisionSubtitle;
  const citiesSubtitle = context.mode === 'focus'
    ? `${copy.citiesSubtitle} · ${context.periodLabel}`
    : copy.citiesSubtitle;
  const resolvedDecisionSubtitle = sectionMeta.decisionSubtitle ?? decisionSubtitle;
  const resolvedCitiesSubtitle = sectionMeta.citiesSubtitle ?? citiesSubtitle;
  const resolvedOpportunityTitle = sectionMeta.opportunityTitle ?? opportunityTitle;
  const resolvedGrowthSubtitle = sectionMeta.growthSubtitle ?? growthSubtitle;
  const rankedCityRows = React.useMemo(() => (
    cityRows
      .slice()
      .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name, locale === 'de' ? 'de-DE' : 'en-US'))
  ), [cityRows, locale]);

  const cityRankByKey = React.useMemo(() => {
    const next = new Map<string, number>();
    rankedCityRows.forEach((item, index) => {
      next.set(item.key, index + 1);
    });
    return next;
  }, [rankedCityRows]);

  const filteredCityRows = React.useMemo(() => {
    if (!hasCityQuery) return rankedCityRows;
    return rankedCityRows.filter((item) => item.name.toLowerCase().includes(normalizedCityQuery));
  }, [hasCityQuery, normalizedCityQuery, rankedCityRows]);
  const defaultOpportunityRank = React.useMemo(
    () => selectOpportunityAnalysisItem(opportunityRadar)?.rank ?? null,
    [opportunityRadar],
  );
  const [selectedOpportunityRank, setSelectedOpportunityRank] = React.useState<typeof defaultOpportunityRank>(defaultOpportunityRank);
  const selectedOpportunity = React.useMemo(
    () => selectOpportunityAnalysisItem(opportunityRadar, selectedOpportunityRank),
    [opportunityRadar, selectedOpportunityRank],
  );
  const personalizedProfileGap = !funnelComparison ? (userIntelligence?.profileGap ?? null) : null;
  const activePriceIntelligence = selectedOpportunity?.priceIntelligence ?? model.priceIntelligence;
  const resolvedPriceTitle = copy.priceTitle;
  const decisionPlan = React.useMemo(
    () => {
      const withActionLabel = (plan: ReturnType<typeof buildPersonalizedDecisionPlan>) => (
        decisionActionLabel ? { ...plan, actionLabel: decisionActionLabel } : plan
      );

      if (isPersonalizedMode && userIntelligence) {
        return withActionLabel(buildPersonalizedDecisionPlan({
          locale,
          copy,
          personalizedPricing,
          risks: rightRailRisks,
          opportunities: rightRailOpportunities,
          nextSteps: rightRailNextSteps,
          selectedOpportunity,
          currentCityId: filters.cityId,
          currentCategoryKey: filters.categoryKey,
        }));
      }

      return buildDecisionPlan({
        locale,
        copy,
        decisionInsight,
        selectedOpportunity,
        priceIntelligence: activePriceIntelligence,
        currentCityId: filters.cityId,
        currentCategoryKey: filters.categoryKey,
      });
    },
    [
      activePriceIntelligence,
      copy,
      decisionInsight,
      decisionActionLabel,
      filters.categoryKey,
      filters.cityId,
      isPersonalizedMode,
      locale,
      personalizedPricing,
      rightRailNextSteps,
      rightRailOpportunities,
      rightRailRisks,
      selectedOpportunity,
    ],
  );

  const cityPagination = React.useMemo(
    () => paginateItems(filteredCityRows, cityPage, CITY_PAGE_SIZE),
    [cityPage, filteredCityRows],
  );
  const {
    totalPages: cityTotalPages,
    safePage: safeCityPage,
    startIndex: cityStartIndex,
    visibleItems: visibleCityRows,
  } = cityPagination;
  const [isNarrowViewport, setNarrowViewport] = React.useState(false);
  const introPanelMinHeight = useSyncedPanelMinHeight({
    sourceRef: profilePanelRef,
    mode: 'sourceHeight',
    watchKey: `${activitySignals.length}-${isError ? 1 : 0}-${isLoading ? 1 : 0}`,
  });
  const growthPanelMinHeight = useSyncedPanelMinHeight({
    sourceRef: citiesPanelRef,
    targetRef: growthPanelRef,
    mode: 'sourceBottomToTargetTop',
    watchKey: `${cityRows.length}-${safeCityPage}-${isError ? 1 : 0}-${isLoading ? 1 : 0}`,
  });
  const insightsPanelMinHeight = useSyncedPanelMinHeight({
    sourceRef: citiesPanelRef,
    mode: 'sourceHeight',
    watchKey: `${cityRows.length}-${safeCityPage}-${insights.length}-${isError ? 1 : 0}-${isLoading ? 1 : 0}`,
  });
  const {
    data: publicSummaryOverview,
    isLoading: isPublicSummaryLoading,
    isError: isPublicSummaryError,
  } = useQuery({
    queryKey: workspaceQK.workspacePublicSummary(WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT),
    queryFn: () =>
      getWorkspacePublicOverview({
        page: 1,
        limit: 1,
        cityActivityLimit: WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT,
    }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    enabled: !isPersonalizedMode,
  });
  const publicCityActivity = publicSummaryOverview?.cityActivity;
  const publicSummary = publicSummaryOverview?.summary;
  const showDemandMapPanel = !isPersonalizedMode && Boolean(
    publicCityActivity || publicSummary || isPublicSummaryLoading || isPublicSummaryError,
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => setNarrowViewport(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const target = funnelContainerRef.current;
    if (!target) return;

    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      if (!entry) return;
      setFunnelContainerWidth(Math.round(entry.contentRect.width));
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const funnelVisualRows = React.useMemo(
    () => buildFunnelVisualRows({ funnel, copy, isNarrowViewport, funnelContainerWidth, mode }),
    [copy, funnel, funnelContainerWidth, isNarrowViewport, mode],
  );
  const funnelComparisonByKey = React.useMemo(() => {
    const next = new Map<string, NonNullable<typeof funnelComparison>['stages'][number]>();
    funnelComparison?.stages.forEach((item) => {
      next.set(item.key, item);
    });
    return next;
  }, [funnelComparison]);
  const funnelStrongestStage = React.useMemo(
    () => funnelComparison?.stages.find((item) => item.key !== 'requests' && item.gapRate.startsWith('+')) ?? null,
    [funnelComparison],
  );
  const funnelLargestDropoffStage = React.useMemo(
    () => (
      funnelComparison?.largestDropOffStage
        ? funnelComparisonByKey.get(funnelComparison.largestDropOffStage) ?? null
        : null
    ),
    [funnelComparison, funnelComparisonByKey],
  );
  const profileSummaryItems = React.useMemo(() => {
    if (!isPersonalizedMode) return null;

    return [
      {
        label: copy.profileStrengthLabel,
        value: funnelStrongestStage
          ? `${funnelStrongestStage.label} · ${funnelStrongestStage.gapRate}`
          : copy.profileSummaryFallback,
      },
      {
        label: copy.profileMainLossLabel,
        value: funnelLargestDropoffStage
          ? `${funnelLargestDropoffStage.label} · ${funnelLargestDropoffStage.gapRate}`
          : (funnelComparison?.summary ?? copy.profileSummaryFallback),
      },
      {
        label: copy.profileRecommendationLineLabel,
        value: funnelComparison?.nextAction ?? copy.profileSummaryFallback,
      },
    ];
  }, [
    copy.profileMainLossLabel,
    copy.profileRecommendationLineLabel,
    copy.profileStrengthLabel,
    copy.profileSummaryFallback,
    funnelComparison,
    funnelLargestDropoffStage,
    funnelStrongestStage,
    isPersonalizedMode,
  ]);

  const replaceSearchParams = React.useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const current = searchParams.toString();
      const next = new URLSearchParams(current);
      mutate(next);
      const nextQuery = next.toString();
      if (nextQuery === current) return;
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  React.useEffect(() => {
    setCityPage(1);
  }, [normalizedCityQuery]);

  React.useEffect(() => {
    const nextPage = cityPageFromUrl ?? 1;
    if (nextPage !== cityPage) {
      setCityPage(nextPage);
    }
  }, [cityPageFromUrl, cityPage]);

  React.useEffect(() => {
    const nextPage = toPageQueryValue(safeCityPage);
    if (isPageQueryInSync(searchParams, CITY_PAGE_QUERY_KEY, nextPage)) return;

    replaceSearchParams((params) => {
      applyPageQuery(params, CITY_PAGE_QUERY_KEY, nextPage);
    });
  }, [replaceSearchParams, safeCityPage, searchParams]);

  React.useEffect(() => {
    if (selectedOpportunityRank !== null && opportunityRadar.some((item) => item.rank === selectedOpportunityRank)) return;
    setSelectedOpportunityRank(defaultOpportunityRank);
  }, [defaultOpportunityRank, opportunityRadar, selectedOpportunityRank]);

  const applySelectedOpportunityFocus = React.useCallback(() => {
    if (!selectedOpportunity) return;
    if (decisionPlan.shouldApplyFocus) {
      model.setCityId(selectedOpportunity.cityId);
      model.setCategoryKey(selectedOpportunity.categoryKey);
      return;
    }

    const next = new URLSearchParams(searchParams.toString());
    next.set('section', 'requests');
    if (selectedOpportunity.cityId) {
      next.set('cityId', selectedOpportunity.cityId);
    } else {
      next.delete('cityId');
    }
    if (selectedOpportunity.categoryKey) {
      next.set('categoryKey', selectedOpportunity.categoryKey);
    } else {
      next.delete('categoryKey');
    }
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }, [decisionPlan.shouldApplyFocus, model, pathname, router, searchParams, selectedOpportunity]);

  return (
    <div className="requests-grid requests-grid--equal-cols workspace-statistics-layout">
      <section className="workspace-statistics workspace-statistics__column">
        <section
          ref={statisticsPanelRef}
          className="panel requests-panel workspace-statistics__intro"
          style={introPanelMinHeight ? { minHeight: `${introPanelMinHeight}px` } : undefined}
        >
          <StatisticsContextPanel
            copy={copy}
            filters={filters}
            cityOptions={model.cityOptions}
            categoryOptions={model.categoryOptions}
            context={context}
            activityTrend={activityTrend}
            onRangeChange={model.setRange}
            onCityChange={model.setCityId}
            onCategoryChange={model.setCategoryKey}
            onReset={model.resetFilters}
            onExport={model.onExport}
            surface="embedded"
            showControls={false}
            closeLabel={t(I18N_KEYS.auth.closeDialog)}
          />

          <div className="workspace-statistics__decision-cluster">
            <div className="panel-header workspace-statistics__mode-row">
              <div className="workspace-statistics__mode-meta">
                <span className="workspace-statistics__mode-badge">{modeLabel}</span>
                <span className="section-subtitle">{copy.kpiTitle} · {context.scopeLabel}</span>
              </div>
              {isPersonalizedMode ? (
                <div className="workspace-statistics__viewer-mode">
                  <span className="workspace-statistics__viewer-mode-label">{copy.viewerModeLabel}</span>
                  <div className="howitworks-tabs" role="group" aria-label={copy.viewerModeLabel}>
                    <button
                      type="button"
                      aria-pressed={viewerMode === 'provider'}
                      className={`howitworks-tab ${viewerMode === 'provider' ? 'is-active' : ''}`.trim()}
                      onClick={() => setViewerMode('provider')}
                    >
                      {copy.viewerModeProviderLabel}
                    </button>
                    <button
                      type="button"
                      aria-pressed={viewerMode === 'customer'}
                      className={`howitworks-tab ${viewerMode === 'customer' ? 'is-active' : ''}`.trim()}
                      onClick={() => setViewerMode('customer')}
                    >
                      {copy.viewerModeCustomerLabel}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {hasBackgroundError && !isLoading && !isError ? (
              <div className="workspace-statistics__background-error" role="status" aria-live="polite">
                <strong>{copy.backgroundErrorTitle}</strong>
                <p>{copy.backgroundErrorBody}</p>
              </div>
            ) : null}

            {!isLoading && !isError ? (
              <StatisticsDecisionLayer
                copy={copy}
                decisionInsight={decisionInsight}
                decisionPlan={decisionPlan}
                selectedOpportunity={selectedOpportunity}
                priceIntelligence={activePriceIntelligence}
                onActionClick={applySelectedOpportunityFocus}
                activitySignals={activitySignals}
                subtitle={isPersonalizedMode ? personalizedDecisionLayerSubtitle : resolvedDecisionSubtitle}
              />
            ) : null}
          </div>
        </section>

        {isLoading ? (
          <div className="requests-stats__loading workspace-statistics__loading">
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-64 w-full" />
            <div className="skeleton h-64 w-full" />
          </div>
        ) : isError ? (
          <div className="requests-stats__error workspace-statistics__error">
            <p className="typo-small">{t(I18N_KEYS.requestsPage.statsLoadError)}</p>
          </div>
        ) : (
          <>
            <div className="workspace-statistics__sections stack-md">
              <div className="workspace-statistics__grid workspace-statistics__grid--primary">
                <section className="panel requests-stats-chart">
                  <header className="section-heading workspace-statistics__tile-header">
                    <p className="section-title">{activityTitle}</p>
                    <p className="section-subtitle">{activitySubtitle}</p>
                  </header>
                  <ActivityTrendChart
                    points={activityPoints}
                    requestsLabel={copy.requestsLabel}
                    offersLabel={copy.offersLabel}
                    clientActivityLabel={copy.clientActivityChartLabel}
                    providerActivityLabel={copy.providerActivityChartLabel}
                    emptyLabel={copy.emptyActivity}
                  />
                  <div className="workspace-statistics__meta-grid">
                    <div>
                      <span>{copy.peakLabel}</span>
                      <strong>{activityMeta.peak}</strong>
                    </div>
                    <div>
                      <span>{copy.bestWindowLabel}</span>
                      <strong>{activityMeta.bestWindow}</strong>
                    </div>
                    <div>
                      <span>{copy.updatedLabel}</span>
                      <strong>{activityMeta.updatedAt}</strong>
                    </div>
                  </div>
                  {activitySummary ? (
                    <p className="workspace-statistics__activity-summary">{activitySummary}</p>
                  ) : null}
                </section>

                <StatisticsDemandPanelSection
                  model={model}
                  t={t}
                  categoryFit={categoryFit}
                />
              </div>

              <StatisticsCitiesPanel
                panelRef={citiesPanelRef}
                copy={copy}
                subtitle={resolvedCitiesSubtitle}
                cityRowsLength={cityRows.length}
                activeCityId={filters.cityId}
                filteredCityRows={filteredCityRows}
                visibleCityRows={visibleCityRows}
                cityRankByKey={cityRankByKey}
                cityStartIndex={cityStartIndex}
                cityTotalPages={cityTotalPages}
                safeCityPage={safeCityPage}
                cityQuery={cityQuery}
                onCityQueryChange={setCityQuery}
                onSelectCity={model.setCityId}
                onPrevPage={() => setCityPage((prev) => Math.max(1, prev - 1))}
                onNextPage={() => setCityPage((prev) => Math.min(cityTotalPages, prev + 1))}
                formatNumber={formatNumber}
                formatMarketBalance={formatMarketBalance}
                cityComparison={cityComparison}
                t={t}
              />

              <div className="workspace-statistics__grid workspace-statistics__grid--secondary">
                <StatisticsOpportunityPanel
                  panelRef={opportunityPanelRef}
                  copy={copy}
                  locale={locale}
                  title={resolvedOpportunityTitle}
                  opportunityRadar={opportunityRadar}
                  selectedRank={selectedOpportunityRank}
                  onSelectRank={setSelectedOpportunityRank}
                />
                <StatisticsPricePanel
                  className="workspace-statistics-price--secondary"
                  copy={copy}
                  title={resolvedPriceTitle}
                  priceIntelligence={activePriceIntelligence}
                  pricing={userIntelligence?.pricing ?? null}
                  personalizedPricing={personalizedPricing}
                />
              </div>

              <StatisticsPriceRecommendationPanel
                copy={copy}
                locale={locale}
                priceIntelligence={activePriceIntelligence}
              />
            </div>
          </>
        )}
      </section>

      <aside className="stack-md">
        {showDemandMapPanel ? (
          <div className="workspace-statistics__rail-map">
            <WorkspacePublicDemandMapPanel
              t={t}
              locale={locale}
              cityActivity={publicCityActivity}
              summary={publicSummary}
              isLoading={isPublicSummaryLoading}
              isError={isPublicSummaryError}
            />
          </div>
        ) : null}

        <section
          ref={profilePanelRef}
          className="panel requests-stats-chart workspace-statistics__profile-panel"
        >
          <header className="section-heading workspace-statistics__tile-header workspace-statistics__tile-header--profile">
            <div className="workspace-statistics__profile-title-row">
              <p className="section-title">{copy.profileTitle}</p>
              {funnelPeriodLabel ? (
                <span className="workspace-statistics__profile-period">
                  {copy.profileRevenueLabel} · {funnelPeriodLabel}
                </span>
              ) : null}
            </div>
            <p className="section-subtitle">
              {model.mode === 'personalized' ? copy.profileSubtitlePersonalized : copy.profileSubtitlePlatform}
            </p>
          </header>
          {isLoading ? (
            <div className="workspace-statistics-funnel workspace-statistics-funnel--skeleton" aria-hidden="true">
              <div className="skeleton h-16 w-full" />
              <div className="skeleton h-14 w-11/12 self-center" />
              <div className="skeleton h-14 w-4/5 self-center" />
              <div className="skeleton h-14 w-3/4 self-center" />
              <div className="skeleton h-14 w-2/3 self-center" />
              <div className="skeleton h-14 w-3/5 self-center" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-6 w-full" />
            </div>
          ) : isError ? (
            <p className="workspace-statistics__empty">{copy.funnelError}</p>
          ) : !hasFunnelData ? (
            <div className="workspace-statistics-funnel workspace-statistics-funnel--empty">
              <p className="workspace-statistics-funnel__empty-title">{copy.funnelEmptyTitle}</p>
              <p className="workspace-statistics-funnel__empty-body">{copy.funnelEmptyBody}</p>
            </div>
          ) : (
            <div className={`workspace-statistics-funnel${isPersonalizedMode ? ' workspace-statistics-funnel--personalized' : ''}`.trim()} aria-label={copy.profileTitle}>
              {isPersonalizedMode ? (
                <div className="workspace-statistics-funnel__profile-lead">
                  <strong>{copy.profileComparisonHeadline}</strong>
                  <div className="workspace-statistics-funnel__profile-lead-lines">
                    {profileSummaryItems?.map((item) => (
                      <p key={item.label}>
                        <span>{item.label}:</span> {item.value}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
              <ol className="workspace-statistics-funnel__stack" ref={funnelContainerRef}>
                {funnelVisualRows.map((step, index) => (
                  (() => {
                    const comparison = !step.isCurrency ? (step.compare ?? null) : null;
                    const layerHintValue = !isPersonalizedMode
                      ? step.railValue
                      : (comparison?.marketRate ?? undefined);
                    const layerHintLabel = !isPersonalizedMode
                      ? step.railLabel
                      : (comparison?.marketRate ? step.railLabel : undefined);
                    const comparisonLine = comparison
                      ? [
                        `${copy.comparisonUserLabel} ${comparison.userCount}`,
                        comparison.userRate,
                        comparison.gapRate,
                      ].filter(Boolean).join(' · ')
                      : null;

                    return (
                      <li
                        key={`${step.key}-${index}`}
                        className={`workspace-statistics-funnel__layer is-tone-${Math.min(index + 1, 6)}${step.isTall ? ' is-tall' : ''}`.trim()}
                        style={{
                          ['--funnel-top-width' as string]: `${step.topWidthPercent}%`,
                          ['--funnel-bottom-width' as string]: `${step.bottomWidthPercent}%`,
                          ['--funnel-layer-index' as string]: `${index}`,
                        } as React.CSSProperties}
                        aria-label={
                          isPersonalizedMode && comparison
                            ? [
                              `${step.fullLabel}: ${copy.comparisonMarketLabel} ${step.value}`,
                              `${copy.comparisonUserLabel} ${comparison.userCount}`,
                              comparison.userRate ? `${copy.comparisonUserLabel} ${comparison.userRate}` : null,
                              layerHintLabel && layerHintValue
                                ? `${layerHintLabel} ${layerHintValue}`
                                : null,
                              comparison.gapRate
                                ? `${copy.comparisonGapLabel} ${comparison.gapRate}`
                                : null,
                            ].filter(Boolean).join(', ')
                            : `${step.fullLabel}: ${step.value}${layerHintValue ? `, ${layerHintLabel ?? ''} ${step.railValue ?? ''}` : ''}`
                        }
                        title={step.isCompactLabel ? step.fullLabel : undefined}
                      >
                        <div className="workspace-statistics-funnel__shape" aria-hidden="true" />
                        <div className="workspace-statistics-funnel__layer-content">
                          <span className="workspace-statistics-funnel__layer-label">{step.displayLabel}</span>
                          <strong className="workspace-statistics-funnel__layer-value">{step.value}</strong>
                        </div>
                        {layerHintLabel || layerHintValue ? (
                          <div className="workspace-statistics-funnel__layer-hint">
                            <div className="workspace-statistics-funnel__layer-hint-main">
                              {layerHintLabel ? <span className="workspace-statistics-funnel__layer-hint-label">{layerHintLabel}</span> : null}
                              <span className="workspace-statistics-funnel__layer-hint-line" aria-hidden="true" />
                              {layerHintValue ? <strong className="workspace-statistics-funnel__layer-hint-value">{layerHintValue}</strong> : null}
                            </div>
                          </div>
                        ) : null}
                        {isPersonalizedMode && comparisonLine ? (
                          <div className={`workspace-statistics-funnel__layer-hint-compare${comparison?.isLargestGap ? ' is-highlighted' : ''}${comparison?.isLargestDropoff ? ' is-dropoff' : ''}`.trim()}>
                            {comparisonLine}
                          </div>
                        ) : null}
                      </li>
                    );
                  })()
                ))}
              </ol>
              <p className="workspace-statistics-funnel__summary">{funnelSummary}</p>
              {personalizedProfileGap ? (
                <div className={`workspace-statistics-funnel__gap is-${personalizedProfileGap.tone}`.trim()}>
                  <strong>{personalizedProfileGap.title}</strong>
                  <p>{personalizedProfileGap.summary}</p>
                </div>
              ) : null}
              {funnelDropoff ? (
                <div className={`workspace-statistics-funnel__dropoff is-${funnelDropoff.tone}`.trim()}>
                  <span>{funnelDropoff.label}</span>
                  <strong>{funnelDropoff.value}</strong>
                  {funnelLargestDropoffStage ? (
                    <div className="workspace-statistics-funnel__dropoff-metrics">
                      <span>{copy.comparisonMarketLabel} {funnelLargestDropoffStage.marketRate}</span>
                      <span>{copy.comparisonUserLabel} {funnelLargestDropoffStage.userRate}</span>
                      <span>{funnelLargestDropoffStage.gapRate}</span>
                    </div>
                  ) : null}
                  <p>{funnelComparison?.nextAction ? `${funnelDropoff.hint} · ${funnelComparison.nextAction}` : funnelDropoff.hint}</p>
                </div>
              ) : null}
              <div className="workspace-statistics-funnel__conversion">
                <span>{copy.conversionLabel}</span>
                <strong>{conversion}</strong>
              </div>
            </div>
          )}
        </section>

        {isLoading ? (
          <>
            <section className="panel"><div className="skeleton h-36 w-full" /></section>
            <section className="panel"><div className="skeleton h-48 w-full" /></section>
          </>
        ) : isError ? (
          <section className="panel">
            <p className="typo-small">{t(I18N_KEYS.requestsPage.statsLoadError)}</p>
          </section>
        ) : (
          <>
            {isPersonalizedMode ? (
              <>
                <StatisticsPerformancePositionPanel
                  copy={copy}
                  position={userIntelligence?.performancePosition ?? null}
                />
                <StatisticsPriorityPanel
                  title={rightRailRisks?.title ?? copy.userRisksTitle}
                  subtitle={rightRailRisks?.subtitle ?? copy.userRisksSubtitle}
                  badgeLabel={copy.insightsTypeRiskLabel}
                  items={rightRailRisks?.items ?? []}
                />
                <StatisticsPriorityPanel
                  title={rightRailOpportunities?.title ?? copy.userOpportunitiesTitle}
                  subtitle={rightRailOpportunities?.subtitle ?? copy.userOpportunitiesSubtitle}
                  badgeLabel={copy.insightsTypeChanceLabel}
                  items={rightRailOpportunities?.items ?? []}
                />
                <StatisticsActionPlanPanel
                  copy={copy}
                  title={rightRailNextSteps?.title}
                  subtitle={rightRailNextSteps?.subtitle}
                  steps={rightRailNextSteps?.steps ?? []}
                />
              </>
            ) : (
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
                  subtitle={resolvedGrowthSubtitle}
                  growthCards={growthCards}
                  recommendedForFallback={focusLabel}
                />
              </>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

function ActivityTrendChart({
  points,
  requestsLabel,
  offersLabel,
  clientActivityLabel,
  providerActivityLabel,
  emptyLabel,
}: {
  points: Array<{
    label: string;
    requests: number;
    offers: number;
    clientActivity?: number | null;
    providerActivity?: number | null;
  }>;
  requestsLabel: string;
  offersLabel: string;
  clientActivityLabel: string;
  providerActivityLabel: string;
  emptyLabel: string;
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  React.useEffect(() => {
    setActiveIndex(Math.max(0, points.length - 1));
  }, [points]);

  if (points.length === 0) {
    return <p className="workspace-statistics__empty">{emptyLabel}</p>;
  }

  const width = 100;
  const height = 100;
  const maxValue = Math.max(
    1,
    ...points.flatMap((point) => [
      point.requests,
      point.offers,
      point.clientActivity ?? 0,
      point.providerActivity ?? 0,
    ]),
  );
  const step = width / Math.max(points.length - 1, 1);
  const active = points[activeIndex] ?? points[points.length - 1];

  const toY = (value: number) => {
    const top = 10;
    const bottom = 85;
    return bottom - (value / maxValue) * (bottom - top);
  };

  const requestsPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point.requests)}`)
    .join(' ');
  const offersPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point.offers)}`)
    .join(' ');
  const hasClientActivity = points.some((point) => typeof point.clientActivity === 'number' && point.clientActivity > 0);
  const clientActivityPath = hasClientActivity
    ? points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point.clientActivity ?? 0)}`)
      .join(' ')
    : null;
  const hasProviderActivity = points.some(
    (point) => typeof point.providerActivity === 'number' && point.providerActivity > 0,
  );
  const providerActivityPath = hasProviderActivity
    ? points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${index * step} ${toY(point.providerActivity ?? 0)}`)
      .join(' ')
    : null;

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const progress = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const index = Math.round(progress * Math.max(points.length - 1, 0));
    setActiveIndex(index);
  };

  return (
    <div className="home-activity__content workspace-statistics-chart">
      <div className="home-activity__chart">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="home-activity__svg"
          role="img"
          aria-label={`${requestsLabel} / ${offersLabel}`}
          onPointerMove={handlePointerMove}
        >
          <line x1="0" y1="85" x2={String(width)} y2="85" className="home-activity__axis" />
          <path d={requestsPath} className="home-activity__line is-requests" />
          <path d={offersPath} className="home-activity__line is-offers" />
          {clientActivityPath ? <path d={clientActivityPath} className="home-activity__line is-client-activity" /> : null}
          {providerActivityPath ? <path d={providerActivityPath} className="home-activity__line is-provider-activity" /> : null}
          {points.map((point, index) => (
            <g key={`${point.label}-${index}`}>
              <circle
                cx={index * step}
                cy={toY(point.requests)}
                r={activeIndex === index ? 1.8 : 0.85}
                className="home-activity__dot is-requests"
              />
              <circle
                cx={index * step}
                cy={toY(point.offers)}
                r={activeIndex === index ? 1.8 : 0.85}
                className="home-activity__dot is-offers"
              />
              {clientActivityPath ? (
                <circle
                  cx={index * step}
                  cy={toY(point.clientActivity ?? 0)}
                  r={activeIndex === index ? 1.8 : 0.85}
                  className="home-activity__dot is-client-activity"
                />
              ) : null}
              {providerActivityPath ? (
                <circle
                  cx={index * step}
                  cy={toY(point.providerActivity ?? 0)}
                  r={activeIndex === index ? 1.8 : 0.85}
                  className="home-activity__dot is-provider-activity"
                />
              ) : null}
            </g>
          ))}
        </svg>
      </div>
      <div className="home-activity__meta">
        <div className="home-activity__point-time">{active?.label ?? '—'}</div>
        <div className="home-activity__legend" aria-hidden="true">
          <span className="home-activity__metric is-requests">
            {requestsLabel}: <strong>{active?.requests ?? 0}</strong>
          </span>
          <span className="home-activity__metric is-offers">
            {offersLabel}: <strong>{active?.offers ?? 0}</strong>
          </span>
          {clientActivityPath ? (
            <span className="home-activity__metric is-client-activity">
              {clientActivityLabel}: <strong>{active?.clientActivity ?? 0}</strong>
            </span>
          ) : null}
          {providerActivityPath ? (
            <span className="home-activity__metric is-provider-activity">
              {providerActivityLabel}: <strong>{active?.providerActivity ?? 0}</strong>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
