'use client';

import type { Ref } from 'react';

import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { Input } from '@/components/ui/Input';
import {
  IconSearch,
  IconTrophyBronze,
  IconTrophyGold,
  IconTrophySilver,
} from '@/components/ui/icons/icons';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';
import type { TranslateFn } from './statisticsSections.types';
import { citySignalIcon, citySignalLabel } from './statisticsSections.utils';

export function StatisticsCitiesPanel({
  panelRef,
  copy,
  subtitle,
  cityRowsLength,
  activeCityId,
  filteredCityRows,
  visibleCityRows,
  cityRankByKey,
  cityStartIndex,
  cityTotalPages,
  safeCityPage,
  cityQuery,
  onCityQueryChange,
  onSelectCity,
  onPrevPage,
  onNextPage,
  formatNumber,
  formatMarketBalance,
  cityComparison,
  t,
}: {
  panelRef?: Ref<HTMLElement>;
  copy: WorkspaceStatisticsModel['copy'];
  subtitle?: string;
  cityRowsLength: number;
  activeCityId: string | null;
  filteredCityRows: WorkspaceStatisticsModel['cityRows'];
  visibleCityRows: WorkspaceStatisticsModel['cityRows'];
  cityRankByKey: Map<string, number>;
  cityStartIndex: number;
  cityTotalPages: number;
  safeCityPage: number;
  cityQuery: string;
  onCityQueryChange: (value: string) => void;
  onSelectCity: (cityId: string | null) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  formatNumber: Intl.NumberFormat;
  formatMarketBalance: Intl.NumberFormat;
  cityComparison?: WorkspaceStatisticsModel['cityComparison'];
  t: TranslateFn;
}) {
  return (
    <section ref={panelRef} className="panel requests-stats-chart workspace-statistics__cities-panel">
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{copy.citiesTitle}</p>
        <p className="section-subtitle">{subtitle ?? copy.citiesSubtitle}</p>
      </header>
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
            const requestsLabel = formatNumber.format(item.count);
            const jobSearchesLabel = item.auftragSuchenCount === null ? '—' : formatNumber.format(item.auftragSuchenCount);
            const providerSearchesLabel = item.anbieterSuchenCount === null ? '—' : formatNumber.format(item.anbieterSuchenCount);
            const marketBalanceLabel = item.marketBalanceRatio === null ? '—' : `${formatMarketBalance.format(item.marketBalanceRatio)}x`;
            const signalLabel = citySignalLabel(item.signal, copy);
            const matchedCityComparison = cityComparison?.find((city) => city.city.trim().toLowerCase() === item.name.trim().toLowerCase()) ?? null;
            return (
              <li
                key={`${item.key}-${index}`}
                className="workspace-statistics-city-list__item-shell"
              >
                <button
                  type="button"
                  className={`stat-card workspace-statistics-city-list__item${activeCityId === item.cityId ? ' is-active' : ''}`.trim()}
                  aria-pressed={activeCityId === item.cityId}
                  aria-label={`${copy.citiesColumnRank} ${rank}. ${item.name}. ${copy.citiesColumnRequests}: ${requestsLabel}. ${copy.citiesColumnJobSearches}: ${jobSearchesLabel}. ${copy.citiesColumnProviderSearches}: ${providerSearchesLabel}. ${copy.citiesColumnMarketBalance}: ${marketBalanceLabel}. ${signalLabel}.`}
                  onClick={() => onSelectCity(activeCityId === item.cityId ? null : item.cityId)}
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
                    {jobSearchesLabel}
                  </span>
                  <span className="workspace-statistics-city-list__share">
                    {providerSearchesLabel}
                  </span>
                  <span className="workspace-statistics-city-list__balance">
                    <strong>{marketBalanceLabel}</strong>
                    <span className={`workspace-statistics-city-list__signal is-${item.signal}`.trim()}>
                      <span className="workspace-statistics-city-list__signal-icon" aria-hidden="true">
                        {citySignalIcon(item.signal)}
                      </span>
                      {signalLabel}
                    </span>
                    {matchedCityComparison?.recommendation ? (
                      <span className="workspace-statistics-city-list__personal-note">
                        {copy.userRecommendationLabel}: {matchedCityComparison.recommendation}
                      </span>
                    ) : null}
                  </span>
                </button>
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
