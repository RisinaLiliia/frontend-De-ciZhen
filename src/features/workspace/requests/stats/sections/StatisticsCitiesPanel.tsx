'use client';

import type { Ref } from 'react';

import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { CitySearchSelect, type CitySearchOption } from '@/components/ui/CitySearchSelect';
import {
  IconTrophyBronze,
  IconTrophyGold,
  IconTrophySilver,
} from '@/components/ui/icons/icons';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';
import type { TranslateFn } from './statisticsSections.types';
import { citySignalIcon, citySignalLabel } from './statisticsSections.utils';

export function StatisticsCitiesPanel({
  panelRef,
  copy,
  locale,
  subtitle,
  cityRowsLength,
  activeCityId,
  visibleCityRows,
  cityListPage,
  cityListLimit,
  cityOptions,
  cityTotalPages,
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
  locale: Locale;
  subtitle?: string;
  cityRowsLength: number;
  activeCityId: string | null;
  visibleCityRows: WorkspaceStatisticsModel['cityRows'];
  cityListPage: number;
  cityListLimit: number;
  cityOptions: WorkspaceStatisticsModel['cityOptions'];
  cityTotalPages: number;
  onSelectCity: (cityId: string | null) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  formatNumber: Intl.NumberFormat;
  formatMarketBalance: Intl.NumberFormat;
  cityComparison?: WorkspaceStatisticsModel['cityComparison'];
  t: TranslateFn;
}) {
  const cityValue = activeCityId ?? '';
  const loadingLabel = locale === 'de' ? 'Aktualisiere…' : 'Refreshing…';
  const emptyLabel = locale === 'de' ? 'Keine Ergebnisse' : 'No results';
  const errorLabel = locale === 'de' ? 'Daten konnten nicht geladen werden.' : 'Data could not be loaded.';
  const selectedCityLabel = cityOptions.find((option) => option.value === cityValue)?.label ?? copy.citiesFilterPlaceholder;

  return (
    <section ref={panelRef} className="panel requests-stats-chart workspace-statistics__cities-panel">
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{copy.citiesTitle}</p>
        <p className="section-subtitle">{subtitle ?? copy.citiesSubtitle}</p>
      </header>
      <div className="workspace-statistics__cities-tools">
        <CitySearchSelect
          mode="inline"
          inlineBehavior="auto"
          locale={locale}
          value={cityValue}
          onChange={(next) => onSelectCity(next || null)}
          className="requests-select is-city workspace-statistics__cities-filter"
          ariaLabel={copy.contextCityLabel}
          placeholder={selectedCityLabel}
          allOption={{ value: '', label: copy.contextAllCitiesLabel } satisfies CitySearchOption}
          searchPlaceholder={copy.citiesFilterPlaceholder}
          loadingLabel={loadingLabel}
          emptyLabel={emptyLabel}
          errorLabel={errorLabel}
        />
      </div>
      {cityRowsLength === 0 ? (
        <p className="workspace-statistics__empty">{copy.emptyCities}</p>
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
            const rank = item.rank ?? ((cityListPage - 1) * cityListLimit) + index + 1;
            const rankTone = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : null;
            const requestsLabel = formatNumber.format(item.count);
            const jobSearchesLabel = item.auftragSuchenCount === null ? '—' : formatNumber.format(item.auftragSuchenCount);
            const providerSearchesLabel = item.anbieterSuchenCount === null ? '—' : formatNumber.format(item.anbieterSuchenCount);
            const marketBalanceLabel = item.marketBalanceRatio === null ? '—' : `${formatMarketBalance.format(item.marketBalanceRatio)}x`;
            const signalLabel = citySignalLabel(item.signal, copy);
            const matchedCityComparison = cityComparison?.find((city) => city.city.trim().toLowerCase() === item.name.trim().toLowerCase()) ?? null;
            const isCompetitor = item.peerContext?.role === 'competitor';
            return (
              <li
                key={`${item.key}-${index}`}
                className="workspace-statistics-city-list__item-shell"
              >
                <button
                  type="button"
                  className={`stat-card workspace-statistics-city-list__item${activeCityId === item.cityId ? ' is-active' : ''}${isCompetitor ? ' is-competitor' : ''}`.trim()}
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
            page={cityListPage}
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
