'use client';

import Link from 'next/link';
import * as React from 'react';

import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  IconSearch,
  IconTrophyBronze,
  IconTrophyGold,
  IconTrophySilver,
} from '@/components/ui/icons/icons';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from './useWorkspaceStatisticsModel';

type TranslateFn = (key: I18nKey) => string;

export function StatisticsDecisionLayer({
  copy,
  activitySignals,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  activitySignals: WorkspaceStatisticsModel['activitySignals'];
}) {
  if (activitySignals.length === 0) return null;

  return (
    <section className="workspace-statistics__decision-layer">
      <div className="workspace-statistics__activity-signals-head">
        <p className="section-title">{copy.activitySignalsTitle}</p>
        <p className="section-subtitle">{copy.activitySignalsSubtitle}</p>
      </div>
      <ul className="workspace-statistics__activity-signals" aria-label={copy.activitySignalsTitle}>
        {activitySignals.map((item) => (
          <li
            key={item.key}
            className={`stat-card workspace-statistics__activity-signal is-${item.tone}${item.tone === 'positive' ? ' dc-glow' : ''}`.trim()}
          >
            <span className="workspace-statistics__activity-signal-label">{item.label}</span>
            <strong className="workspace-statistics__activity-signal-value">{item.value}</strong>
            <span className="workspace-statistics__activity-signal-hint">{item.hint}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StatisticsDemandPanel({
  copy,
  demandRows,
  visibleDemandRows,
  safeDemandPage,
  demandTotalPages,
  onPrevPage,
  onNextPage,
  t,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  demandRows: WorkspaceStatisticsModel['demandRows'];
  visibleDemandRows: WorkspaceStatisticsModel['demandRows'];
  safeDemandPage: number;
  demandTotalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  t: TranslateFn;
}) {
  return (
    <section className="panel requests-stats-chart">
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
                onPrevPage={onPrevPage}
                onNextPage={onNextPage}
              />
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

export function StatisticsCitiesPanel({
  copy,
  cityRowsLength,
  filteredCityRows,
  visibleCityRows,
  cityRankByKey,
  cityStartIndex,
  cityTotalPages,
  safeCityPage,
  cityQuery,
  onCityQueryChange,
  onPrevPage,
  onNextPage,
  formatNumber,
  formatMarketBalance,
  coverage,
  t,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  cityRowsLength: number;
  filteredCityRows: WorkspaceStatisticsModel['cityRows'];
  visibleCityRows: WorkspaceStatisticsModel['cityRows'];
  cityRankByKey: Map<string, number>;
  cityStartIndex: number;
  cityTotalPages: number;
  safeCityPage: number;
  cityQuery: string;
  onCityQueryChange: (value: string) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  formatNumber: Intl.NumberFormat;
  formatMarketBalance: Intl.NumberFormat;
  coverage: WorkspaceStatisticsModel['citySignalCoverage'];
  t: TranslateFn;
}) {
  return (
    <section className="panel requests-stats-chart workspace-statistics__cities-panel">
      <header className="workspace-statistics__tile-header">
        <p className="section-title">{copy.citiesTitle}</p>
        <p className="section-subtitle">{copy.citiesSubtitle}</p>
      </header>
      {cityRowsLength > 0 ? (
        <div className="workspace-statistics__cities-coverage">
          <Badge
            variant={coverage.mode === 'full' ? 'success' : coverage.mode === 'partial' ? 'warning' : 'info'}
            size="sm"
          >
            {coverage.label}
          </Badge>
          <span className="section-subtitle">{coverage.detail}</span>
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
            onChange={(event) => onCityQueryChange(event.target.value)}
            placeholder={copy.citiesFilterPlaceholder}
            className="workspace-statistics__cities-filter-input"
          />
        </label>
      </div>
      {cityRowsLength === 0 ? (
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
                <span className="workspace-statistics-city-list__name">{item.name}</span>
                <span className="workspace-statistics-city-list__count">{formatNumber.format(item.count)}</span>
                <span className="workspace-statistics-city-list__share">
                  {item.auftragSuchenCount === null ? '—' : formatNumber.format(item.auftragSuchenCount)}
                </span>
                <span className="workspace-statistics-city-list__share">
                  {item.anbieterSuchenCount === null ? '—' : formatNumber.format(item.anbieterSuchenCount)}
                </span>
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
      {cityTotalPages > 1 ? (
        <div className="workspace-statistics__cities-pagination">
          <RequestsPageNav
            page={safeCityPage}
            totalPages={cityTotalPages}
            ariaLabel={t(I18N_KEYS.requestsPage.paginationLabel)}
            prevAriaLabel={t(I18N_KEYS.requestsPage.paginationPrev)}
            nextAriaLabel={t(I18N_KEYS.requestsPage.paginationNext)}
            prevTitle={t(I18N_KEYS.requestsPage.paginationPrev)}
            nextTitle={t(I18N_KEYS.requestsPage.paginationNext)}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
          />
        </div>
      ) : null}
    </section>
  );
}

export function StatisticsOpportunityPanel({
  copy,
  locale,
  opportunityRadar,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  locale: Locale;
  opportunityRadar: WorkspaceStatisticsModel['opportunityRadar'];
}) {
  const analysisItem = opportunityRadar.find((item) => item.rank === 1) ?? opportunityRadar[0] ?? null;
  const topCards = React.useMemo(() => {
    const byRank = new Map<(typeof opportunityRadar)[number]['rank'], (typeof opportunityRadar)[number]>(
      opportunityRadar.map((item) => [item.rank, item]),
    );
    const preferredRanks: Array<(typeof opportunityRadar)[number]['rank']> = [3, 2];
    const preferred = preferredRanks
      .map((rank) => byRank.get(rank))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    if (preferred.length >= 2) return preferred;

    const fallback = opportunityRadar
      .filter((item) => item.rank !== analysisItem?.rank)
      .sort((a, b) => b.rank - a.rank);
    return [...preferred, ...fallback].slice(0, 2);
  }, [analysisItem?.rank, opportunityRadar]);
  const axisOrder = React.useMemo<OpportunityMetricKey[]>(
    () => ['demand', 'competition', 'growth', 'activity'],
    [],
  );
  const analysisAxes = React.useMemo(
    () => (
      analysisItem
        ? axisOrder.map((key) => {
          const metric = analysisItem.metrics.find((item) => item.key === key);
          return {
            key,
            label: opportunityAxisLabel(key, copy),
            value: Number((metric?.value ?? 0).toFixed(1)),
            semanticLabel: opportunityMetricSemanticLabel(metric?.semanticKey ?? 'low', copy),
            semanticTone: metric?.semanticTone ?? 'low',
          };
        })
        : []
    ),
    [
      analysisItem,
      axisOrder,
      copy,
    ],
  );
  const radarPoints = React.useMemo(
    () => buildOpportunityRadarPoints(analysisAxes.map((axis) => axis.value)),
    [analysisAxes],
  );
  const radarPath = React.useMemo(
    () => buildOpportunityRadarSmoothPath(radarPoints),
    [radarPoints],
  );
  const radarRingLevels = React.useMemo(() => [2.5, 5, 7.5, 10], []);
  const radarAxisEndpoints = React.useMemo(
    () => buildOpportunityRadarAxisEndpoints(),
    [],
  );
  const radarAxisValueLabels = React.useMemo(
    () => buildOpportunityRadarAxisValueLabelPositions(analysisAxes.map((axis) => axis.value)),
    [analysisAxes],
  );
  const analysisRankTone = analysisItem
    ? analysisItem.rank === 1
      ? 'gold'
      : analysisItem.rank === 2
        ? 'silver'
        : 'bronze'
    : null;
  const analysisStatus = analysisItem?.status ?? null;
  const analysisStatusClass = analysisStatus ? opportunityStatusClassName(analysisStatus) : null;
  const analysisSummary = React.useMemo(
    () => (
      analysisItem
        ? opportunitySummaryLabel(analysisItem.summaryKey, copy)
        : ''
    ),
    [analysisItem, copy],
  );

  return (
    <section className="panel requests-stats-chart workspace-statistics-opportunity">
      <header className="workspace-statistics__tile-header">
        <p className="section-title">{copy.opportunityTitle}</p>
        <p className="section-subtitle">{copy.opportunitySubtitle}</p>
      </header>
      {opportunityRadar.length === 0 ? (
        <p className="workspace-statistics__empty">{copy.opportunityEmpty}</p>
      ) : (
        <ol className="workspace-statistics-opportunity__list" aria-label={copy.opportunityTitle}>
          {topCards.map((item) => {
            const rankTone = item.rank === 1 ? 'gold' : item.rank === 2 ? 'silver' : 'bronze';
            return (
              <li
                key={`${item.rank}-${item.city}`}
                className="workspace-statistics-opportunity__item-wrap"
              >
                <Link
                  href={item.href}
                  prefetch={false}
                  className={`stat-card stat-link workspace-statistics-opportunity__item workspace-statistics-opportunity__item--compact is-${item.tone}`.trim()}
                >
                  <div className="workspace-statistics-opportunity__top">
                    <span className={`workspace-statistics-city-list__rank-cup is-${rankTone}`.trim()} aria-hidden="true">
                      {item.rank === 1 ? <IconTrophyGold size={30} /> : null}
                      {item.rank === 2 ? <IconTrophySilver size={30} /> : null}
                      {item.rank === 3 ? <IconTrophyBronze size={30} /> : null}
                    </span>
                    <div className="workspace-statistics-opportunity__identity">
                      <strong className="workspace-statistics-opportunity__city">{item.city}</strong>
                      <span className="workspace-statistics-opportunity__category">{item.category}</span>
                    </div>
                  </div>

                  <div className="workspace-statistics-opportunity__score-head">
                    <span>{copy.opportunityScoreLabel}</span>
                    <strong>{item.score.toFixed(1)} / 10</strong>
                  </div>
                  <div className="workspace-statistics-demand__track workspace-statistics-opportunity__score-track" aria-hidden="true">
                    <span
                      className="workspace-statistics-demand__fill workspace-statistics-opportunity__score-fill"
                      style={{ width: `${Math.max(0, Math.min(100, item.score * 10))}%` }}
                    />
                  </div>

                  <dl className="workspace-statistics-opportunity__metrics">
                    <div>
                      <dt>{copy.opportunityDemandLabel}</dt>
                      <dd>{item.demand.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt>{copy.opportunityProvidersLabel}</dt>
                      <dd>{item.providers === null ? '—' : item.providers.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt>{copy.opportunityBalanceLabel}</dt>
                      <dd>{item.marketBalanceRatio === null ? '—' : item.marketBalanceRatio.toFixed(2)}</dd>
                    </div>
                  </dl>

                  <p className={`workspace-statistics-opportunity__tone is-${item.tone}`.trim()}>
                    {opportunityToneLabel(item.tone, copy)}
                  </p>
                </Link>
              </li>
            );
          })}
          {analysisItem ? (
            <li className="workspace-statistics-opportunity__item-wrap is-last">
              <Link
                href={analysisItem.href}
                prefetch={false}
                className={`stat-card stat-link workspace-statistics-opportunity__item workspace-statistics-opportunity__item--analysis is-${analysisItem.tone}`.trim()}
              >
                <div className="workspace-statistics-opportunity__analysis-head">
                  <div className="workspace-statistics-insights__assistant workspace-statistics-opportunity__analysis-assistant">
                    <span className="workspace-statistics-insights__assistant-avatar" aria-hidden="true">AI</span>
                    <span className="workspace-statistics-insights__assistant-copy">
                      <strong className="workspace-statistics-insights__assistant-name">{copy.insightsAssistantName}</strong>
                      <span className="workspace-statistics-insights__assistant-note">{copy.opportunityAnalysisSubtitle}</span>
                    </span>
                    <span className="workspace-statistics-opportunity__status workspace-statistics-opportunity__featured-badge is-top-chance">
                      {locale === 'de' ? 'Top Chance' : 'Top chance'}
                    </span>
                  </div>
                </div>

                <div className="workspace-statistics-opportunity__analysis-overview">
                  <div className="workspace-statistics-opportunity__analysis-identity">
                    <span className={`workspace-statistics-city-list__rank-cup is-${analysisRankTone}`.trim()} aria-hidden="true">
                      {analysisItem.rank === 1 ? <IconTrophyGold size={30} /> : null}
                      {analysisItem.rank === 2 ? <IconTrophySilver size={30} /> : null}
                      {analysisItem.rank === 3 ? <IconTrophyBronze size={30} /> : null}
                    </span>
                    <div className="workspace-statistics-opportunity__identity">
                      <strong className="workspace-statistics-opportunity__city">{analysisItem.city}</strong>
                      <span className="workspace-statistics-opportunity__category">{analysisItem.category}</span>
                    </div>
                  </div>
                  <div
                    className="workspace-statistics-opportunity__analysis-score"
                    aria-label={`${copy.opportunityScoreLabel}: ${analysisItem.score.toFixed(1)} / 10`}
                  >
                    <div className="workspace-statistics-opportunity__score-head">
                      <span>{copy.opportunityScoreLabel}</span>
                      <strong>{analysisItem.score.toFixed(1)} / 10</strong>
                    </div>
                    <div className="workspace-statistics-demand__track workspace-statistics-opportunity__score-track" aria-hidden="true">
                      <span
                        className="workspace-statistics-demand__fill workspace-statistics-opportunity__score-fill"
                        style={{ width: `${Math.max(0, Math.min(100, analysisItem.score * 10))}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="workspace-statistics-opportunity__analysis-body">
                  <div className="workspace-statistics-opportunity__radar-block">
                    {analysisStatus ? (
                      <span className={`workspace-statistics-opportunity__status workspace-statistics-opportunity__status--radar is-${analysisStatusClass}`.trim()}>
                        {opportunityStatusLabel(analysisStatus, locale)}
                      </span>
                    ) : null}
                    <div className="workspace-statistics-opportunity__radar" aria-hidden="true">
                      <svg viewBox="0 0 180 180" role="presentation">
                        {radarRingLevels.map((level) => (
                          <circle
                            key={`ring-${level}`}
                            cx="90"
                            cy="90"
                            r={(62 * level) / 10}
                            className="workspace-statistics-opportunity__radar-ring"
                          />
                        ))}
                        {radarRingLevels.map((level) => (
                          <text
                            key={`ring-label-${level}`}
                            x="94"
                            y={90 - ((62 * level) / 10) + 3}
                            className="workspace-statistics-opportunity__radar-ring-label"
                          >
                            {level}
                          </text>
                        ))}
                        {radarAxisEndpoints.map((endpoint, index) => (
                          <line
                            key={`axis-${index}`}
                            x1="90"
                            y1="90"
                            x2={endpoint.x}
                            y2={endpoint.y}
                            className="workspace-statistics-opportunity__radar-axis"
                          />
                        ))}
                        {radarPath ? <path d={radarPath} className="workspace-statistics-opportunity__radar-shape" /> : null}
                        {radarPoints.map((point, index) => (
                          <circle
                            key={`dot-${index}`}
                            cx={point.x}
                            cy={point.y}
                            r="2.5"
                            className="workspace-statistics-opportunity__radar-dot"
                          />
                        ))}
                        {radarAxisValueLabels.map((item, index) => (
                          <text
                            key={`axis-value-${index}`}
                            x={item.x}
                            y={item.y}
                            className="workspace-statistics-opportunity__radar-axis-label"
                          >
                            {item.label}
                          </text>
                        ))}
                      </svg>
                    </div>
                  </div>
                  <ul className="workspace-statistics-opportunity__analysis-axes">
                    {analysisAxes.map((axis) => (
                      <li key={axis.key}>
                        <div className="workspace-statistics-opportunity__axis-row">
                          <span>{axis.label}</span>
                          <strong>{axis.value.toFixed(1)} / 10</strong>
                        </div>
                        <div className="workspace-statistics-demand__track workspace-statistics-opportunity__axis-track" aria-hidden="true">
                          <span
                            className="workspace-statistics-demand__fill workspace-statistics-opportunity__axis-fill"
                            style={{ width: `${Math.max(0, Math.min(100, axis.value * 10))}%` }}
                          />
                        </div>
                        <em className={`workspace-statistics-opportunity__axis-semantic is-${axis.semanticTone}`.trim()}>
                          {axis.semanticLabel}
                        </em>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="workspace-statistics-opportunity__summary" aria-label={locale === 'de' ? 'Opportunity Zusammenfassung' : 'Opportunity summary'}>
                  {analysisSummary}
                </p>

                <dl className="workspace-statistics-opportunity__metrics">
                  <div>
                    <dt>{copy.opportunityDemandLabel}</dt>
                    <dd>{analysisItem.demand.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt>{copy.opportunityProvidersLabel}</dt>
                    <dd>{analysisItem.providers === null ? '—' : analysisItem.providers.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt>{copy.opportunityBalanceLabel}</dt>
                    <dd>{analysisItem.marketBalanceRatio === null ? '—' : analysisItem.marketBalanceRatio.toFixed(2)}</dd>
                  </div>
                </dl>
              </Link>
            </li>
          ) : null}
        </ol>
      )}
    </section>
  );
}

export function StatisticsPricePanel({
  copy,
  priceIntelligence,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  priceIntelligence: WorkspaceStatisticsModel['priceIntelligence'];
}) {
  return (
    <section className="panel requests-stats-chart workspace-statistics-price">
      <header className="workspace-statistics__tile-header">
        <p className="section-title">{copy.priceTitle}</p>
        <p className="section-subtitle">{copy.priceSubtitle}</p>
      </header>
      {!priceIntelligence.contextLabel && !priceIntelligence.marketAverageLabel ? (
        <p className="workspace-statistics__empty">{copy.priceNoData}</p>
      ) : (
        <div className="workspace-statistics-price__content">
          <p className="workspace-statistics-price__context">{priceIntelligence.contextLabel ?? '—'}</p>
          <strong className="workspace-statistics-price__range">{priceIntelligence.recommendedRangeLabel ?? '—'}</strong>
          <p className="workspace-statistics-price__average">
            {copy.priceMarketAverageLabel}: <strong>{priceIntelligence.marketAverageLabel ?? '—'}</strong>
          </p>
        </div>
      )}
    </section>
  );
}

export function StatisticsInsightsPanel({
  copy,
  insights,
  showInsightsDebug,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  insights: WorkspaceStatisticsModel['insights'];
  showInsightsDebug: boolean;
}) {
  const insightsSubtitle = copy.insightsGeneratedLabel;

  return (
    <section className="panel stack-sm">
      <header className="workspace-statistics__tile-header">
        <p className="section-title">{copy.insightsTitle}</p>
        <p className="section-subtitle">{insightsSubtitle}</p>
        <div className="workspace-statistics-insights__assistant">
          <span className="workspace-statistics-insights__assistant-avatar" aria-hidden="true">AI</span>
          <span className="workspace-statistics-insights__assistant-copy">
            <strong className="workspace-statistics-insights__assistant-name">{copy.insightsAssistantName}</strong>
            <span className="workspace-statistics-insights__assistant-note">{copy.insightsAssistantNote}</span>
          </span>
        </div>
      </header>
      {insights.length === 0 ? (
        <p className="workspace-statistics__empty">{copy.emptyInsights}</p>
      ) : (
        <ul className="workspace-statistics-insights" aria-label={copy.insightsTitle}>
          {insights.map((item, index) => (
            <li
              key={`${item.key}-${index}`}
              className={`stat-card stat-link workspace-statistics-insights__item is-${item.level} is-${item.kind}${index === 0 ? ' is-featured' : ''}`.trim()}
            >
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
  );
}

export function StatisticsGrowthPanel({
  copy,
  growthCards,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  growthCards: WorkspaceStatisticsModel['growthCards'];
}) {
  if (growthCards.length === 0) return null;

  const featuredCard = growthCards.find((item) => item.tone === 'primary') ?? growthCards[0] ?? null;
  const secondaryCards = growthCards
    .filter((item) => item.key !== featuredCard?.key)
    .slice(0, 2);

  return (
    <section className="panel stack-sm workspace-statistics__growth">
      <header className="workspace-statistics__tile-header">
        <p className="section-title">{copy.growthTitle}</p>
        <p className="section-subtitle">{copy.growthSubtitle}</p>
      </header>
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
    </section>
  );
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

function opportunityToneLabel(
  tone: WorkspaceStatisticsModel['opportunityRadar'][number]['tone'],
  copy: WorkspaceStatisticsModel['copy'],
): string {
  if (tone === 'very-high') return copy.opportunityToneVeryHigh;
  if (tone === 'high') return copy.opportunityToneHigh;
  if (tone === 'balanced') return copy.opportunityToneBalanced;
  return copy.opportunityToneSupplyHeavy;
}

function buildOpportunityRadarAxisEndpoints(): Array<{ x: number; y: number }> {
  const count = 4;
  const center = 90;
  const radius = 62;
  return Array.from({ length: count }, (_, index) => {
    const angle = (-Math.PI / 2) + ((Math.PI * 2) / count) * index;
    return {
      x: center + (Math.cos(angle) * radius),
      y: center + (Math.sin(angle) * radius),
    };
  });
}

function buildOpportunityRadarPoints(values: number[]): Array<{ x: number; y: number }> {
  const count = 4;
  const center = 90;
  const maxRadius = 62;
  return Array.from({ length: count }, (_, index) => {
    const normalized = Math.max(0, Math.min(10, values[index] ?? 0)) / 10;
    const angle = (-Math.PI / 2) + ((Math.PI * 2) / count) * index;
    const radius = maxRadius * normalized;
    return {
      x: center + (Math.cos(angle) * radius),
      y: center + (Math.sin(angle) * radius),
    };
  });
}

function buildOpportunityRadarSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 3) return '';

  const midpoint = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });

  const firstMid = midpoint(points[points.length - 1]!, points[0]!);
  let path = `M ${firstMid.x} ${firstMid.y}`;

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index]!;
    const next = points[(index + 1) % points.length]!;
    const mid = midpoint(point, next);
    path += ` Q ${point.x} ${point.y} ${mid.x} ${mid.y}`;
  }

  return `${path} Z`;
}

function buildOpportunityRadarAxisValueLabelPositions(values: number[]): Array<{ x: number; y: number; label: string }> {
  const count = 4;
  const center = 90;
  const radius = 74;
  return Array.from({ length: count }, (_, index) => {
    const angle = (-Math.PI / 2) + ((Math.PI * 2) / count) * index;
    const value = Math.max(0, Math.min(10, values[index] ?? 0));
    return {
      x: center + (Math.cos(angle) * radius),
      y: center + (Math.sin(angle) * radius) + 3,
      label: value.toFixed(1),
    };
  });
}

type OpportunityStatus = 'very_high' | 'good' | 'balanced' | 'competitive' | 'low';
type OpportunityMetricKey = 'demand' | 'competition' | 'growth' | 'activity';
type OpportunitySummaryKey = WorkspaceStatisticsModel['opportunityRadar'][number]['summaryKey'];
type OpportunitySemanticKey = WorkspaceStatisticsModel['opportunityRadar'][number]['metrics'][number]['semanticKey'];

function opportunityStatusClassName(status: OpportunityStatus): string {
  if (status === 'very_high') return 'very-high';
  if (status === 'good') return 'good';
  if (status === 'balanced') return 'balanced';
  if (status === 'competitive') return 'competitive';
  return 'low';
}

function opportunityStatusLabel(status: OpportunityStatus, locale: Locale): string {
  if (locale === 'de') {
    if (status === 'very_high') return 'Sehr hohe Chance';
    if (status === 'good') return 'Gute Chance';
    if (status === 'balanced') return 'Ausgeglichen';
    if (status === 'competitive') return 'Viele Anbieter';
    return 'Niedrige Chance';
  }

  if (status === 'very_high') return 'Very high opportunity';
  if (status === 'good') return 'Good opportunity';
  if (status === 'balanced') return 'Balanced';
  if (status === 'competitive') return 'Competitive';
  return 'Low opportunity';
}

function opportunityAxisLabel(key: OpportunityMetricKey, copy: WorkspaceStatisticsModel['copy']): string {
  if (key === 'demand') return copy.opportunityAxisDemand;
  if (key === 'competition') return copy.opportunityAxisCompetition;
  if (key === 'growth') return copy.opportunityAxisGrowth;
  return copy.opportunityAxisActivity;
}

function opportunityMetricSemanticLabel(
  key: OpportunitySemanticKey,
  copy: WorkspaceStatisticsModel['copy'],
): string {
  if (key === 'very_high') return copy.opportunitySemanticVeryHigh;
  if (key === 'high') return copy.opportunitySemanticHigh;
  if (key === 'noticeable') return copy.opportunitySemanticNoticeable;
  if (key === 'medium') return copy.opportunitySemanticMedium;
  return copy.opportunitySemanticLow;
}

function opportunitySummaryLabel(key: OpportunitySummaryKey, copy: WorkspaceStatisticsModel['copy']): string {
  if (key === 'very_high') return copy.opportunitySummaryVeryHigh;
  if (key === 'good') return copy.opportunitySummaryGood;
  if (key === 'balanced_competitive') return copy.opportunitySummaryBalancedCompetitive;
  if (key === 'balanced') return copy.opportunitySummaryBalanced;
  if (key === 'competitive') return copy.opportunitySummaryCompetitive;
  if (key === 'low_demand') return copy.opportunitySummaryLowDemand;
  return copy.opportunitySummaryLow;
}
