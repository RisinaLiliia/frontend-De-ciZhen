'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { HomeTrustLivePanel } from '@/components/home/HomeTrustLivePanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from './workspaceStatistics.model';
import { useSyncedPanelMinHeight } from './useSyncedPanelMinHeight';
import { buildFunnelVisualRows } from './statisticsFunnel.utils';
import { paginateItems, parsePageParam } from './statisticsPagination.utils';
import { applyPageQuery, isPageQueryInSync, toPageQueryValue } from './statisticsUrlState.utils';
import {
  StatisticsCitiesPanel,
  StatisticsDecisionLayer,
  StatisticsDemandPanel,
  StatisticsGrowthPanel,
  StatisticsInsightsPanel,
  StatisticsOpportunityPanel,
  StatisticsPricePanel,
  StatisticsPriceRecommendationPanel,
} from './WorkspaceStatisticsSections';

type WorkspaceStatisticsViewProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  model: WorkspaceStatisticsModel;
};
const DEMAND_PAGE_SIZE = 5;
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
  const [demandPage, setDemandPage] = React.useState(1);
  const [cityQuery, setCityQuery] = React.useState('');
  const [cityPage, setCityPage] = React.useState(() => cityPageFromUrl ?? 1);
  const funnelContainerRef = React.useRef<HTMLOListElement | null>(null);
  const statisticsPanelRef = React.useRef<HTMLElement | null>(null);
  const decisionClusterRef = React.useRef<HTMLDivElement | null>(null);
  const citiesPanelRef = React.useRef<HTMLElement | null>(null);
  const growthPanelRef = React.useRef<HTMLElement | null>(null);
  const opportunityPanelRef = React.useRef<HTMLElement | null>(null);
  const trustPanelWrapRef = React.useRef<HTMLDivElement | null>(null);
  const [funnelContainerWidth, setFunnelContainerWidth] = React.useState(0);
  const {
    copy,
    filters,
    range,
    isLoading,
    isError,
    hasBackgroundError,
    modeLabel,
    context,
    sectionMeta,
    activityPoints,
    activityMeta,
    decisionInsight,
    activitySignals,
    demandRows,
    cityRows,
    opportunityRadar,
    funnel,
    funnelPeriodLabel,
    funnelSummary,
    hasFunnelData,
    conversion,
    insights,
    growthCards,
  } = model;
  const normalizedCityQuery = cityQuery.trim().toLowerCase();
  const hasCityQuery = normalizedCityQuery.length > 0;
  const focusLabel = React.useMemo(() => {
    if (filters.categoryKey && filters.cityId) return `${context.categoryLabel} in ${context.cityLabel}`;
    if (filters.categoryKey) return context.categoryLabel;
    if (filters.cityId) return context.cityLabel;
    return null;
  }, [context.categoryLabel, context.cityLabel, filters.categoryKey, filters.cityId]);
  const opportunityTitle = focusLabel ? `${copy.opportunityTitle} ${locale === 'de' ? 'für' : 'for'} ${focusLabel}` : copy.opportunityTitle;
  const priceTitle = focusLabel ? `${copy.priceTitle} ${locale === 'de' ? 'für' : 'for'} ${focusLabel}` : copy.priceTitle;
  const insightsSubtitle = focusLabel
    ? `${copy.insightsSubtitle} · ${focusLabel}`
    : copy.insightsSubtitle;
  const growthSubtitle = focusLabel
    ? `${copy.growthSubtitle} · ${focusLabel}`
    : copy.growthSubtitle;
  const decisionSubtitle = focusLabel
    ? `${copy.activitySignalsSubtitle} · ${focusLabel}`
    : copy.activitySignalsSubtitle;
  const demandSubtitle = context.mode === 'focus'
    ? `${copy.demandSubtitle} · ${context.periodLabel}`
    : copy.demandSubtitle;
  const citiesSubtitle = context.mode === 'focus'
    ? `${copy.citiesSubtitle} · ${context.periodLabel}`
    : copy.citiesSubtitle;
  const resolvedDecisionSubtitle = sectionMeta.decisionSubtitle ?? decisionSubtitle;
  const resolvedDemandSubtitle = sectionMeta.demandSubtitle ?? demandSubtitle;
  const resolvedCitiesSubtitle = sectionMeta.citiesSubtitle ?? citiesSubtitle;
  const resolvedOpportunityTitle = sectionMeta.opportunityTitle ?? opportunityTitle;
  const resolvedPriceTitle = sectionMeta.priceTitle ?? priceTitle;
  const resolvedInsightsSubtitle = sectionMeta.insightsSubtitle ?? insightsSubtitle;
  const resolvedGrowthSubtitle = sectionMeta.growthSubtitle ?? growthSubtitle;
  const demandPagination = React.useMemo(
    () => paginateItems(demandRows, demandPage, DEMAND_PAGE_SIZE),
    [demandPage, demandRows],
  );
  const {
    totalPages: demandTotalPages,
    safePage: safeDemandPage,
    visibleItems: visibleDemandRows,
  } = demandPagination;

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
  const profilePanelMinHeight = useSyncedPanelMinHeight({
    sourceRef: decisionClusterRef,
    targetRef: statisticsPanelRef,
    mode: 'sourceBottomToTargetTop',
    watchKey: `${activitySignals.length}-${isError ? 1 : 0}-${isLoading ? 1 : 0}`,
  });
  const growthPanelMinHeight = useSyncedPanelMinHeight({
    sourceRef: citiesPanelRef,
    targetRef: growthPanelRef,
    mode: 'sourceBottomToTargetTop',
    watchKey: `${cityRows.length}-${safeCityPage}-${isError ? 1 : 0}-${isLoading ? 1 : 0}`,
  });
  const trustPanelMinHeight = useSyncedPanelMinHeight({
    sourceRef: opportunityPanelRef,
    mode: 'sourceHeight',
    watchKey: `${opportunityRadar.length}-${isError ? 1 : 0}-${isLoading ? 1 : 0}`,
  });

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
    () => buildFunnelVisualRows({ funnel, copy, isNarrowViewport, funnelContainerWidth }),
    [copy, funnel, funnelContainerWidth, isNarrowViewport],
  );

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
    setDemandPage(1);
  }, [range]);

  return (
    <div className="requests-grid requests-grid--equal-cols workspace-statistics-layout" aria-labelledby="workspace-statistics-title">
      <section ref={statisticsPanelRef} className="panel requests-panel requests-stats workspace-statistics">
        <SectionHeader
          className="requests-stats__header"
          title={t(I18N_KEYS.homePublic.exploreStats)}
          subtitle={copy.subtitle}
          titleId="workspace-statistics-title"
        />

        <div ref={decisionClusterRef} className="workspace-statistics__decision-cluster">
          <div className="panel-header workspace-statistics__mode-row">
            <span className="workspace-statistics__mode-badge">{modeLabel}</span>
            <span className="section-subtitle">{copy.kpiTitle} · {context.scopeLabel}</span>
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
              activitySignals={activitySignals}
              subtitle={resolvedDecisionSubtitle}
            />
          ) : null}
        </div>

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
                    <p className="section-title">{copy.activityTitle}</p>
                    <p className="section-subtitle">{copy.activitySubtitle}</p>
                  </header>
                  <ActivityTrendChart
                    points={activityPoints}
                    requestsLabel={copy.requestsLabel}
                    offersLabel={copy.offersLabel}
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
                </section>

                <StatisticsDemandPanel
                  copy={copy}
                  subtitle={resolvedDemandSubtitle}
                  demandRows={demandRows}
                  visibleDemandRows={visibleDemandRows}
                  safeDemandPage={safeDemandPage}
                  demandTotalPages={demandTotalPages}
                  onPrevPage={() => setDemandPage((prev) => Math.max(1, prev - 1))}
                  onNextPage={() => setDemandPage((prev) => Math.min(demandTotalPages, prev + 1))}
                  t={t}
                />
              </div>

              <StatisticsCitiesPanel
                panelRef={citiesPanelRef}
                copy={copy}
                subtitle={resolvedCitiesSubtitle}
                cityRowsLength={cityRows.length}
                filteredCityRows={filteredCityRows}
                visibleCityRows={visibleCityRows}
                cityRankByKey={cityRankByKey}
                cityStartIndex={cityStartIndex}
                cityTotalPages={cityTotalPages}
                safeCityPage={safeCityPage}
                cityQuery={cityQuery}
                onCityQueryChange={setCityQuery}
                onPrevPage={() => setCityPage((prev) => Math.max(1, prev - 1))}
                onNextPage={() => setCityPage((prev) => Math.min(cityTotalPages, prev + 1))}
                formatNumber={formatNumber}
                formatMarketBalance={formatMarketBalance}
                t={t}
              />

              <div className="workspace-statistics__grid workspace-statistics__grid--secondary">
                <StatisticsOpportunityPanel
                  panelRef={opportunityPanelRef}
                  copy={copy}
                  locale={locale}
                  title={resolvedOpportunityTitle}
                  opportunityRadar={opportunityRadar}
                />
                <div className="workspace-statistics-price__column">
                  <StatisticsPricePanel
                    copy={copy}
                    title={resolvedPriceTitle}
                    priceIntelligence={model.priceIntelligence}
                  />
                </div>
              </div>

              <StatisticsPriceRecommendationPanel
                copy={copy}
                priceIntelligence={model.priceIntelligence}
              />
            </div>
          </>
        )}
      </section>

      <aside className="stack-md">
        <section
          className="panel requests-stats-chart workspace-statistics__profile-panel"
          style={profilePanelMinHeight ? { minHeight: `${profilePanelMinHeight}px` } : undefined}
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
            <div className="workspace-statistics-funnel" aria-label={copy.profileTitle}>
              <ol className="workspace-statistics-funnel__stack" ref={funnelContainerRef}>
                {funnelVisualRows.map((step, index) => (
                  <li
                    key={`${step.key}-${index}`}
                    className={`workspace-statistics-funnel__layer is-tone-${Math.min(index + 1, 6)}${step.isTall ? ' is-tall' : ''}`.trim()}
                    style={{
                      ['--funnel-top-width' as string]: `${step.topWidthPercent}%`,
                      ['--funnel-bottom-width' as string]: `${step.bottomWidthPercent}%`,
                      ['--funnel-layer-index' as string]: `${index}`,
                    } as React.CSSProperties}
                    aria-label={`${step.fullLabel}: ${step.value}${step.railValue ? `, ${step.railLabel ?? ''} ${step.railValue}` : ''}`}
                    title={step.isCompactLabel ? step.fullLabel : undefined}
                  >
                    <div className="workspace-statistics-funnel__shape" aria-hidden="true" />
                    <div className="workspace-statistics-funnel__layer-content">
                      <span className="workspace-statistics-funnel__layer-label">{step.displayLabel}</span>
                      <strong className="workspace-statistics-funnel__layer-value">{step.value}</strong>
                    </div>
                    {(step.railLabel || step.railValue) ? (
                      <span className="workspace-statistics-funnel__layer-hint">
                        {step.railLabel ? <span className="workspace-statistics-funnel__layer-hint-label">{step.railLabel}</span> : null}
                        {step.railValue ? <strong className="workspace-statistics-funnel__layer-hint-value">{step.railValue}</strong> : null}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
              <p className="workspace-statistics-funnel__summary">{funnelSummary}</p>
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
            <StatisticsInsightsPanel
              copy={copy}
              subtitle={resolvedInsightsSubtitle}
              insights={insights}
              showInsightsDebug={showInsightsDebug}
            />

            <StatisticsGrowthPanel
              panelRef={growthPanelRef}
              panelMinHeight={growthPanelMinHeight}
              copy={copy}
              subtitle={resolvedGrowthSubtitle}
              growthCards={growthCards}
            />
          </>
        )}

        <div
          ref={trustPanelWrapRef}
          className="workspace-statistics__trust-wrap"
          style={trustPanelMinHeight ? { minHeight: `${trustPanelMinHeight}px` } : undefined}
        >
          <HomeTrustLivePanel className="home-trust-live-panel--compact workspace-statistics__trust-panel" t={t} />
        </div>
      </aside>
    </div>
  );
}

function ActivityTrendChart({
  points,
  requestsLabel,
  offersLabel,
  emptyLabel,
}: {
  points: Array<{ label: string; requests: number; offers: number }>;
  requestsLabel: string;
  offersLabel: string;
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
  const maxValue = Math.max(1, ...points.flatMap((point) => [point.requests, point.offers]));
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
        </div>
      </div>
    </div>
  );
}
