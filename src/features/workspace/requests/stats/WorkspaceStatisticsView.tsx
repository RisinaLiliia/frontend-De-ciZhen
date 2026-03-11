'use client';

import Link from 'next/link';
import * as React from 'react';

import { Input } from '@/components/ui/Input';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import { RangeActionToolbar } from '@/components/ui/RangeActionToolbar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { IconDownload, IconSearch, IconTrophyRank } from '@/components/ui/icons/icons';
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
const DEMAND_COLLAPSED_LIMIT = 5;

function rangeLabel(range: WorkspaceStatisticsRange, localeCopy: WorkspaceStatisticsModel['copy']) {
  if (range === '24h') return localeCopy.range24h;
  if (range === '7d') return localeCopy.range7d;
  if (range === '30d') return localeCopy.range30d;
  return localeCopy.range90d;
}

export function WorkspaceStatisticsView({
  t,
  locale,
  model,
}: WorkspaceStatisticsViewProps) {
  const formatNumber = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US');
  const formatMarketBalance = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
  const [isDemandListExpanded, setDemandListExpanded] = React.useState(false);
  const [cityQuery, setCityQuery] = React.useState('');
  const [isCityListExpanded, setCityListExpanded] = React.useState(false);
  const [cityPage, setCityPage] = React.useState(1);
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
    demandRows,
    cityRows,
    funnel,
    conversion,
    insights,
    growthCards,
    onExport,
  } = model;
  const normalizedCityQuery = cityQuery.trim().toLowerCase();
  const hasCityQuery = normalizedCityQuery.length > 0;
  const visibleDemandRows = isDemandListExpanded ? demandRows : demandRows.slice(0, DEMAND_COLLAPSED_LIMIT);

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
  const cityStartIndex = (safeCityPage - 1) * cityPageSize;
  const visibleCityRows = filteredCityRows.slice(cityStartIndex, cityStartIndex + cityPageSize);

  React.useEffect(() => {
    setCityPage(1);
  }, [normalizedCityQuery, isCityListExpanded]);

  React.useEffect(() => {
    setDemandListExpanded(false);
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
                    {!isDemandListExpanded && demandRows.length > DEMAND_COLLAPSED_LIMIT ? (
                      <div className="workspace-statistics__cities-more-wrap">
                        <MoreDotsLink
                          label={copy.demandExpandListLabel}
                          className="workspace-statistics__cities-more"
                          onClick={() => setDemandListExpanded(true)}
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
                            <IconTrophyRank rank={rank as 1 | 2 | 3} />
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
                    page={safeCityPage}
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
            <section className="panel requests-stats-chart" tabIndex={0}>
              <header className="workspace-statistics__tile-header">
                <p className="section-title">{copy.profileTitle}</p>
                <p className="section-subtitle">
                  {model.mode === 'personalized' ? copy.profileSubtitlePersonalized : copy.profileSubtitlePlatform}
                </p>
              </header>
              <div className="workspace-statistics-funnel" aria-label={copy.profileTitle}>
                {funnel.map((step, index) => (
                  <div key={`${step.key}-${index}`} className="stat-card workspace-statistics-funnel__step">
                    <div className="workspace-statistics-funnel__row">
                      <span>{step.label}</span>
                      <strong>{step.value}</strong>
                    </div>
                    {index < funnel.length - 1 ? <span className="workspace-statistics-funnel__arrow">↓</span> : null}
                  </div>
                ))}
                <div className="workspace-statistics-funnel__conversion">
                  <span>{copy.conversionLabel}</span>
                  <strong>{conversion}</strong>
                </div>
              </div>
            </section>

            <section className="panel stack-sm">
              <header className="workspace-statistics__tile-header">
                <p className="section-title">{copy.insightsTitle}</p>
              </header>
              {insights.length === 0 ? (
                <p className="workspace-statistics__empty">{copy.emptyInsights}</p>
              ) : (
                <ul className="workspace-statistics-insights" aria-label={copy.insightsTitle}>
                  {insights.map((item, index) => (
                    <li
                      key={`${item.key}-${index}`}
                      className={`stat-card stat-link workspace-statistics-insights__item is-${item.level}`.trim()}
                      tabIndex={0}
                    >
                      <span className="workspace-statistics-insights__icon" aria-hidden="true">
                        {insightIcon(item.level)}
                      </span>
                      <span>{item.text}</span>
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
                <div className="workspace-statistics-growth__grid">
                  {growthCards.map((card, index) => (
                    <article key={`${card.key}-${index}`} className="stat-card workspace-statistics-growth__card">
                      <p className="workspace-statistics-growth__title">{card.title}</p>
                      <p className="workspace-statistics-growth__body">{card.body}</p>
                      <Link href={card.href} prefetch={false} className="btn-ghost is-primary workspace-statistics-growth__cta">
                        {copy.growthCta}
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </aside>
    </div>
  );
}

function insightIcon(level: WorkspaceStatisticsModel['insights'][number]['level']): string {
  if (level === 'warning') return '⚡';
  if (level === 'trend') return '📈';
  return '💡';
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
