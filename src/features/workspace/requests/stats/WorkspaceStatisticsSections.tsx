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
