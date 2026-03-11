'use client';

import Link from 'next/link';
import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Input } from '@/components/ui/Input';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import { RangeActionToolbar } from '@/components/ui/RangeActionToolbar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  IconDownload,
  IconInsight,
  IconSearch,
  IconTrophyBronze,
  IconTrophyGold,
  IconTrophySilver,
} from '@/components/ui/icons/icons';
import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from './useWorkspaceStatisticsModel';

type WorkspaceStatisticsViewProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  model: WorkspaceStatisticsModel;
};

const RANGE_OPTIONS: WorkspaceStatisticsRange[] = ['24h', '7d', '30d', '90d'];
const CITIES_COLLAPSED_LIMIT = 5;
const DEMAND_PAGE_SIZE = 8;
const CITY_PAGE_QUERY_KEY = 'statsCityPage';
const FUNNEL_MIN_WIDTH_PERCENT_DESKTOP = 40;
const FUNNEL_MIN_WIDTH_PERCENT_MOBILE = 52;

function rangeLabel(range: WorkspaceStatisticsRange, localeCopy: WorkspaceStatisticsModel['copy']) {
  if (range === '24h') return localeCopy.range24h;
  if (range === '7d') return localeCopy.range7d;
  if (range === '30d') return localeCopy.range30d;
  return localeCopy.range90d;
}

function parsePageParam(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}

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
  const [isCityListExpanded, setCityListExpanded] = React.useState(false);
  const [cityPage, setCityPage] = React.useState(() => cityPageFromUrl ?? 1);
  const funnelContainerRef = React.useRef<HTMLOListElement | null>(null);
  const [funnelContainerWidth, setFunnelContainerWidth] = React.useState(0);
  const {
    copy,
    range,
    setRange,
    isLoading,
    isError,
    modeLabel,
    kpis,
    activityPoints,
    activityMeta,
    activitySignals,
    demandRows,
    cityRows,
    funnel,
    funnelPeriodLabel,
    funnelSummary,
    hasFunnelData,
    conversion,
    insights,
    growthCards,
    onExport,
  } = model;
  const normalizedCityQuery = cityQuery.trim().toLowerCase();
  const hasCityQuery = normalizedCityQuery.length > 0;
  const demandTotalPages = Math.max(1, Math.ceil(demandRows.length / DEMAND_PAGE_SIZE));
  const safeDemandPage = Math.min(demandTotalPages, Math.max(1, demandPage));
  const demandStartIndex = (safeDemandPage - 1) * DEMAND_PAGE_SIZE;
  const visibleDemandRows = demandRows.slice(demandStartIndex, demandStartIndex + DEMAND_PAGE_SIZE);

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

  const isPaginatedMode = isCityListExpanded || hasCityQuery;
  const cityPageSize = isPaginatedMode ? 10 : CITIES_COLLAPSED_LIMIT;
  const cityTotalPages = Math.max(1, Math.ceil(filteredCityRows.length / cityPageSize));
  const safeCityPage = Math.min(cityTotalPages, Math.max(1, cityPage));
  const effectiveCityPage = isPaginatedMode ? safeCityPage : 1;
  const cityStartIndex = (effectiveCityPage - 1) * cityPageSize;
  const visibleCityRows = filteredCityRows.slice(cityStartIndex, cityStartIndex + cityPageSize);
  const [isNarrowViewport, setNarrowViewport] = React.useState(false);

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
    () => {
      const minVisualWidth = isNarrowViewport ? FUNNEL_MIN_WIDTH_PERCENT_MOBILE : FUNNEL_MIN_WIDTH_PERCENT_DESKTOP;
      const completedWidth = funnel.find((step) => step.key === 'completed')?.widthPercent ?? null;
      const shouldForceCompactByWidth = funnelContainerWidth > 0 && funnelContainerWidth < 420;
      const visualWidths = funnel.map((step) => {
        const sourceWidth = step.isCurrency && completedWidth !== null ? completedWidth : step.widthPercent;
        return Math.max(minVisualWidth, Math.min(100, Number(sourceWidth || 0)));
      });

      return funnel.map((step, index) => {
        const topWidthPercent = index === 0
          ? (visualWidths[0] ?? 100)
          : (visualWidths[index - 1] ?? visualWidths[0] ?? 100);
        const bottomWidthPercent = visualWidths[index] ?? topWidthPercent;
        const compactLabel = getCompactFunnelLabel(step.key, copy);
        const isLongLabel = step.label.length > 24;
        const shouldUseCompactLabel =
          isNarrowViewport ||
          shouldForceCompactByWidth ||
          bottomWidthPercent < 52 ||
          (isLongLabel && bottomWidthPercent < 62);

        return {
          ...step,
          topWidthPercent,
          bottomWidthPercent: Math.min(topWidthPercent, bottomWidthPercent),
          fullLabel: step.label,
          displayLabel: shouldUseCompactLabel ? compactLabel : step.label,
          isCompactLabel: shouldUseCompactLabel,
          isTall: !shouldUseCompactLabel && step.label.length > 18,
        };
      });
    },
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
  }, [normalizedCityQuery, isCityListExpanded]);

  React.useEffect(() => {
    if (!isPaginatedMode && cityPage !== 1) {
      setCityPage(1);
    }
  }, [cityPage, isPaginatedMode]);

  React.useEffect(() => {
    const nextPage = cityPageFromUrl ?? 1;
    if (nextPage !== cityPage) {
      setCityPage(nextPage);
    }
  }, [cityPageFromUrl, cityPage]);

  React.useEffect(() => {
    const nextPage = isPaginatedMode && safeCityPage > 1 ? String(safeCityPage) : null;
    const currentPage = searchParams.get(CITY_PAGE_QUERY_KEY);
    if ((currentPage ?? null) === nextPage) return;

    replaceSearchParams((params) => {
      if (nextPage) {
        params.set(CITY_PAGE_QUERY_KEY, nextPage);
      } else {
        params.delete(CITY_PAGE_QUERY_KEY);
      }
    });
  }, [isPaginatedMode, replaceSearchParams, safeCityPage, searchParams]);

  React.useEffect(() => {
    setDemandPage(1);
  }, [range]);

  return (
    <div className="requests-grid requests-grid--equal-cols" aria-labelledby="workspace-statistics-title">
      <section className="panel requests-panel requests-stats workspace-statistics">
        <SectionHeader
          className="requests-stats__header"
          title={t(I18N_KEYS.homePublic.exploreStats)}
          subtitle={copy.subtitle}
          titleId="workspace-statistics-title"
          actions={(
            <RangeActionToolbar
              className="workspace-statistics__header-toolbar"
              groupLabel={copy.rangeGroupLabel}
              options={RANGE_OPTIONS.map((option) => ({
                value: option,
                label: rangeLabel(option, copy),
              }))}
              value={range}
              onChange={setRange}
              action={{
                label: copy.exportLabel,
                onClick: onExport,
                icon: <IconDownload />,
                tooltip: copy.exportLabel,
              }}
            />
          )}
        />

        <div className="panel-header workspace-statistics__mode-row">
          <span className="workspace-statistics__mode-badge">{modeLabel}</span>
          <span className="section-subtitle">{copy.kpiTitle}</span>
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
            <section className="requests-stats__kpi-grid" aria-label={copy.kpiTitle}>
              {kpis.map((item) => (
                <KpiCard
                  key={item.key}
                  label={item.label}
                  value={item.value}
                  meta={item.hint}
                  tone={item.tone}
                  trend={item.trend}
                  variant="plain"
                  focusable
                />
              ))}
            </section>

            <div className="workspace-statistics__grid workspace-statistics__grid--primary">
              <section className="panel requests-stats-chart" tabIndex={0}>
                <header className="workspace-statistics__tile-header">
                  <p className="section-title">{copy.activityTitle}</p>
                  <p className="section-subtitle">{copy.activitySubtitle}</p>
                </header>
                <ActivityTrendChart
                  points={activityPoints}
                  requestsLabel={copy.requestsLabel}
                  offersLabel={copy.offersLabel}
                  emptyLabel={copy.emptyActivity}
                />
                {activitySignals.length > 0 ? (
                  <div className="workspace-statistics__activity-signals-wrap">
                    <div className="workspace-statistics__activity-signals-head">
                      <p className="section-title">{copy.activitySignalsTitle}</p>
                      <p className="section-subtitle">{copy.activitySignalsSubtitle}</p>
                    </div>
                    <ul className="workspace-statistics__activity-signals" aria-label={copy.activitySignalsTitle}>
                      {activitySignals.map((item) => (
                        <li
                          key={item.key}
                          className={`stat-card workspace-statistics__activity-signal is-${item.tone}${item.tone === 'positive' ? ' dc-glow' : ''}`.trim()}
                          tabIndex={0}
                        >
                          <span className="workspace-statistics__activity-signal-label">{item.label}</span>
                          <strong className="workspace-statistics__activity-signal-value">{item.value}</strong>
                          <span className="workspace-statistics__activity-signal-hint">{item.hint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
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

              <section className="panel requests-stats-chart" tabIndex={0}>
                <header className="workspace-statistics__tile-header">
                  <p className="section-title">{copy.demandTitle}</p>
                  <p className="section-subtitle">{copy.demandSubtitle}</p>
                </header>
                {demandRows.length === 0 ? (
                  <p className="workspace-statistics__empty">{copy.emptyDemand}</p>
                ) : (
                  <>
                    <ul className="workspace-statistics-demand" aria-label={copy.demandTitle}>
                      {visibleDemandRows.map((row, index) => (
                        <li
                          key={`${row.categoryKey ?? row.categoryName}-${index}`}
                          className="stat-card stat-link workspace-statistics-demand__row"
                          tabIndex={0}
                        >
                          <div className="workspace-statistics-demand__meta">
                            <span className="workspace-statistics-demand__label request-category">{row.categoryName}</span>
                            <span className="workspace-statistics-demand__value">{row.sharePercent}%</span>
                          </div>
                          <div className="workspace-statistics-demand__track" aria-hidden="true">
                            <span className="workspace-statistics-demand__fill" style={{ width: `${row.sharePercent}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                    {demandTotalPages > 1 ? (
                      <div className="workspace-statistics__demand-pagination">
                        <RequestsPageNav
                          page={safeDemandPage}
                          totalPages={demandTotalPages}
                          ariaLabel={copy.demandTitle}
                          prevAriaLabel={t(I18N_KEYS.requestsPage.paginationPrev)}
                          nextAriaLabel={t(I18N_KEYS.requestsPage.paginationNext)}
                          prevTitle={t(I18N_KEYS.requestsPage.paginationPrev)}
                          nextTitle={t(I18N_KEYS.requestsPage.paginationNext)}
                          onPrevPage={() => setDemandPage((prev) => Math.max(1, prev - 1))}
                          onNextPage={() => setDemandPage((prev) => Math.min(demandTotalPages, prev + 1))}
                        />
                      </div>
                    ) : null}
                  </>
                )}
              </section>
            </div>

            <section className="panel requests-stats-chart workspace-statistics__cities-panel" tabIndex={0}>
              <header className="workspace-statistics__tile-header">
                <p className="section-title">{copy.citiesTitle}</p>
                <p className="section-subtitle">{copy.citiesSubtitle}</p>
              </header>
              {cityRows.length > 0 ? (
                <div className="workspace-statistics__cities-coverage">
                  <Badge
                    variant={
                      model.citySignalCoverage.mode === 'full'
                        ? 'success'
                        : model.citySignalCoverage.mode === 'partial'
                          ? 'warning'
                          : 'info'
                    }
                    size="sm"
                  >
                    {model.citySignalCoverage.label}
                  </Badge>
                  <span className="section-subtitle">{model.citySignalCoverage.detail}</span>
                </div>
              ) : null}
              <div className="workspace-statistics__cities-tools">
                <label className="workspace-statistics__cities-filter" aria-label={copy.citiesFilterPlaceholder}>
                  <span className="workspace-statistics__cities-filter-icon" aria-hidden="true">
                    <IconSearch />
                  </span>
                  <Input
                    type="search"
                    value={cityQuery}
                    onChange={(event) => setCityQuery(event.target.value)}
                    placeholder={copy.citiesFilterPlaceholder}
                    className="workspace-statistics__cities-filter-input"
                  />
                </label>
              </div>
              {cityRows.length === 0 ? (
                <p className="workspace-statistics__empty">{copy.emptyCities}</p>
              ) : filteredCityRows.length === 0 ? (
                <p className="workspace-statistics__empty">{copy.citiesNoMatch}</p>
              ) : (
                <ol className="workspace-statistics-city-list" aria-label={copy.citiesTitle}>
                  <li className="workspace-statistics-city-list__head" aria-hidden="true">
                    <span>{copy.citiesColumnRank}</span>
                    <span>{copy.citiesColumnCity}</span>
                    <span>{copy.citiesColumnRequests}</span>
                    <span>{copy.citiesColumnJobSearches}</span>
                    <span>{copy.citiesColumnProviderSearches}</span>
                    <span>{copy.citiesColumnMarketBalance}</span>
                  </li>
                  {visibleCityRows.map((item, index) => {
                    const rank = cityRankByKey.get(item.key) ?? cityStartIndex + index + 1;
                    const rankTone = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : null;
                    return (
                    <li
                      key={`${item.key}-${index}`}
                      className="stat-card workspace-statistics-city-list__item"
                      tabIndex={0}
                    >
                      <span className="workspace-statistics-city-list__rank-cell">
                        {rankTone ? (
                          <span className={`workspace-statistics-city-list__rank-cup is-${rankTone}`.trim()} aria-hidden="true">
                            {rank === 1 ? <IconTrophyGold size={20} /> : null}
                            {rank === 2 ? <IconTrophySilver size={20} /> : null}
                            {rank === 3 ? <IconTrophyBronze size={20} /> : null}
                          </span>
                        ) : null}
                        {!rankTone ? <span className="workspace-statistics-city-list__rank">{rank}</span> : null}
                      </span>
                      <span className="workspace-statistics-city-list__name">
                        {item.name}
                      </span>
                      <span className="workspace-statistics-city-list__count">{formatNumber.format(item.count)}</span>
                      <span className="workspace-statistics-city-list__share">{item.auftragSuchenCount === null ? '—' : formatNumber.format(item.auftragSuchenCount)}</span>
                      <span className="workspace-statistics-city-list__share">{item.anbieterSuchenCount === null ? '—' : formatNumber.format(item.anbieterSuchenCount)}</span>
                      <span className="workspace-statistics-city-list__balance">
                        <strong>{item.marketBalanceRatio === null ? '—' : `${formatMarketBalance.format(item.marketBalanceRatio)}x`}</strong>
                        <span className={`workspace-statistics-city-list__signal is-${item.signal}`.trim()}>
                          <span className="workspace-statistics-city-list__signal-icon" aria-hidden="true">
                            {citySignalIcon(item.signal)}
                          </span>
                          {citySignalLabel(item.signal, copy)}
                        </span>
                      </span>
                    </li>
                    );
                  })}
                </ol>
              )}
              {!hasCityQuery && !isCityListExpanded && filteredCityRows.length > CITIES_COLLAPSED_LIMIT ? (
                <div className="workspace-statistics__cities-more-wrap">
                  <MoreDotsLink
                    label={copy.citiesExpandListLabel}
                    className="workspace-statistics__cities-more"
                    onClick={() => setCityListExpanded(true)}
                  />
                </div>
              ) : null}
              {isPaginatedMode && cityTotalPages > 1 ? (
                <div className="workspace-statistics__cities-pagination">
                  <RequestsPageNav
                    page={effectiveCityPage}
                    totalPages={cityTotalPages}
                    ariaLabel={t(I18N_KEYS.requestsPage.paginationLabel)}
                    prevAriaLabel={t(I18N_KEYS.requestsPage.paginationPrev)}
                    nextAriaLabel={t(I18N_KEYS.requestsPage.paginationNext)}
                    prevTitle={t(I18N_KEYS.requestsPage.paginationPrev)}
                    nextTitle={t(I18N_KEYS.requestsPage.paginationNext)}
                    onPrevPage={() => setCityPage((prev) => Math.max(1, prev - 1))}
                    onNextPage={() => setCityPage((prev) => Math.min(cityTotalPages, prev + 1))}
                  />
                </div>
              ) : null}
            </section>
          </>
        )}
      </section>

      <aside className="stack-md">
        <section className="panel requests-stats-chart" tabIndex={0}>
          <header className="workspace-statistics__tile-header">
            <p className="section-title">{copy.profileTitle}</p>
            <p className="section-subtitle">
              {model.mode === 'personalized' ? copy.profileSubtitlePersonalized : copy.profileSubtitlePlatform}
              {funnelPeriodLabel ? ` · ${funnelPeriodLabel}` : ''}
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
                    tabIndex={0}
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
            <section className="panel stack-sm">
              <header className="workspace-statistics__tile-header">
                <p className="section-title">{copy.insightsTitle}</p>
                <p className="section-subtitle">{copy.insightsSubtitle}</p>
                <p className="workspace-statistics-insights__generated">{copy.insightsGeneratedLabel}</p>
              </header>
              {insights.length === 0 ? (
                <p className="workspace-statistics__empty">{copy.emptyInsights}</p>
              ) : (
                <ul className="workspace-statistics-insights" aria-label={copy.insightsTitle}>
                  {insights.map((item, index) => (
                    <li
                      key={`${item.key}-${index}`}
                      className={`stat-card stat-link workspace-statistics-insights__item is-${item.level} is-${item.kind}${index === 0 ? ' is-featured' : ''}`.trim()}
                      tabIndex={0}
                    >
                      <span className={`workspace-statistics-insights__icon is-${item.level}`.trim()} aria-hidden="true">
                        {insightAdviceIcon()}
                      </span>
                      <span className="workspace-statistics-insights__content">
                        {item.title ? (
                          <strong className="workspace-statistics-insights__title">{item.title}</strong>
                        ) : null}
                        <span className="workspace-statistics-insights__text">{item.text}</span>
                        {item.evidence ? (
                          <span className="workspace-statistics-insights__evidence">{item.evidence}</span>
                        ) : null}
                        {showInsightsDebug ? (
                          <span className="workspace-statistics-insights__debug">
                            {item.code}
                            {typeof item.score === 'number' ? ` · score ${item.score}` : ''}
                            {item.priority ? ` · ${item.priority}` : ''}
                            {item.context ? ` · ${item.context}` : ''}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {growthCards.length > 0 ? (
              <section className="panel stack-sm workspace-statistics__growth">
                <header className="workspace-statistics__tile-header">
                  <p className="section-title">{copy.growthTitle}</p>
                  <p className="section-subtitle">{copy.growthSubtitle}</p>
                </header>
                {(() => {
                  const featuredCard = growthCards.find((item) => item.tone === 'primary') ?? growthCards[0] ?? null;
                  const secondaryCards = growthCards
                    .filter((item) => item.key !== featuredCard?.key)
                    .slice(0, 2);

                  return (
                    <>
                      {featuredCard ? (
                        <div className="workspace-statistics-growth__featured-wrap">
                          <Link
                            href={featuredCard.href}
                            prefetch={false}
                            className="request-create-card request-create-card--compact workspace-statistics-growth__featured"
                          >
                            <div className="request-create-card__body workspace-statistics-growth__featured-content">
                              <div className="workspace-statistics-growth__labels">
                                <Badge variant="info" size="sm">{copy.growthFeaturedBadge}</Badge>
                              </div>
                              <p className="request-create-card__title">{featuredCard.title}</p>
                              <p className="request-create-card__subtitle">{featuredCard.body}</p>
                              <p className="workspace-statistics-growth__benefit">{featuredCard.benefit}</p>
                              {featuredCard.recommendedFor ? (
                                <p className="workspace-statistics-growth__recommended">
                                  {copy.growthRecommendedPrefix} {featuredCard.recommendedFor}
                                </p>
                              ) : null}
                            </div>
                            <div className="request-create-card__media" aria-hidden="true">
                              <span className="request-create-card__plus">+</span>
                            </div>
                          </Link>
                        </div>
                      ) : null}
                      {secondaryCards.length > 0 ? (
                        <div className="workspace-statistics-growth__grid">
                          {secondaryCards.map((card, index) => (
                            <article
                              key={`${card.key}-${index}`}
                              className="stat-card workspace-statistics-growth__card"
                            >
                              <div className="workspace-statistics-growth__head">
                                <div className="workspace-statistics-growth__head-copy">
                                  <p className="workspace-statistics-growth__title">{card.title}</p>
                                  <div className="workspace-statistics-growth__labels">
                                    {card.badge ? (
                                      <Badge variant="info" size="sm">{card.badge}</Badge>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                              <p className="workspace-statistics-growth__body">{card.body}</p>
                              <p className="workspace-statistics-growth__benefit">{card.benefit}</p>
                              {card.recommendedFor ? (
                                <p className="workspace-statistics-growth__recommended">
                                  {copy.growthRecommendedPrefix} {card.recommendedFor}
                                </p>
                              ) : null}
                            </article>
                          ))}
                        </div>
                      ) : null}
                    </>
                  );
                })()}
              </section>
            ) : null}
          </>
        )}
      </aside>
    </div>
  );
}

function insightAdviceIcon(): React.ReactNode {
  return <IconInsight />;
}

function citySignalLabel(
  signal: WorkspaceStatisticsModel['cityRows'][number]['signal'],
  copy: WorkspaceStatisticsModel['copy'],
): string {
  if (signal === 'high') return copy.citySignalHigh;
  if (signal === 'medium') return copy.citySignalMedium;
  if (signal === 'none') return copy.citySignalNone;
  return copy.citySignalLow;
}

function citySignalIcon(
  signal: WorkspaceStatisticsModel['cityRows'][number]['signal'],
): string {
  if (signal === 'high') return '↗';
  if (signal === 'medium') return '→';
  if (signal === 'none') return '•';
  return '↘';
}

function getCompactFunnelLabel(
  key: WorkspaceStatisticsModel['funnel'][number]['key'],
  copy: WorkspaceStatisticsModel['copy'],
): string {
  if (key === 'offers') return copy.funnelOffersCompactLabel;
  if (key === 'confirmed') return copy.funnelConfirmedCompactLabel;
  if (key === 'closed') return copy.funnelClosedCompactLabel;
  if (key === 'completed') return copy.funnelCompletedCompactLabel;
  if (key === 'profit') return copy.funnelProfitCompactLabel;
  return copy.funnelRequestsCompactLabel;
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
