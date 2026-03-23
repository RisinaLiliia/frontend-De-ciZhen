'use client';

import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { WorkspaceStatisticsModel } from '../useWorkspaceStatisticsModel';
import type { TranslateFn } from './statisticsSections.types';

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
      <header className="section-heading workspace-statistics__tile-header">
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
                aria-label={`${row.categoryName}. ${copy.citiesColumnRequests}: ${row.requestCount}. ${row.sharePercent}%.`}
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
