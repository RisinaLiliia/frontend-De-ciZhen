'use client';

import * as React from 'react';

import { RequestsPageNav } from '@/components/requests/RequestsPageNav';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { paginateItems } from '../statisticsPagination.utils';
import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';
import type { TranslateFn } from './statisticsSections.types';

export function StatisticsDemandPanel({
  copy,
  subtitle,
  demandRows,
  visibleDemandRows,
  categoryFit,
  safeDemandPage,
  demandTotalPages,
  onPrevPage,
  onNextPage,
  onSelectCategory,
  t,
  className,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  subtitle?: string;
  demandRows: WorkspaceStatisticsModel['demandRows'];
  visibleDemandRows: WorkspaceStatisticsModel['demandRows'];
  categoryFit?: WorkspaceStatisticsModel['categoryFit'];
  safeDemandPage: number;
  demandTotalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onSelectCategory?: (next: string | null) => void;
  t: TranslateFn;
  className?: string;
}) {
  return (
    <section className={['panel', 'requests-stats-chart', 'workspace-statistics__demand-panel', className].filter(Boolean).join(' ')}>
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{copy.demandTitle}</p>
        <p className="section-subtitle">{subtitle ?? copy.demandSubtitle}</p>
      </header>
      {demandRows.length === 0 ? (
        <p className="workspace-statistics__empty">{copy.emptyDemand}</p>
      ) : (
        <>
          <ul className="workspace-statistics-demand" aria-label={copy.demandTitle}>
            {visibleDemandRows.map((row, index) => (
              <li key={`${row.categoryKey ?? row.categoryName}-${index}`}>
                {(() => {
                  const matchedOpportunity = categoryFit?.find((item) => {
                    return item.label.trim().toLowerCase() === row.categoryName.trim().toLowerCase();
                  }) ?? null;

                  const content = (
                    <>
                      <div className="workspace-statistics-demand__meta">
                        <span className="workspace-statistics-demand__label request-category">{row.categoryName}</span>
                        <span className="workspace-statistics-demand__value">{row.sharePercent}%</span>
                      </div>
                      <div className="workspace-statistics-demand__track" aria-hidden="true">
                        <span className="workspace-statistics-demand__fill" style={{ width: `${row.sharePercent}%` }} />
                      </div>
                      {matchedOpportunity ? (
                        <div className="workspace-statistics-demand__insight">
                          <span>{copy.userForYouLabel}: {matchedOpportunity.recommendation ?? matchedOpportunity.opportunityLabel}</span>
                          <strong>{copy.userFitLabel}: {matchedOpportunity.userFitLabel}</strong>
                        </div>
                      ) : null}
                    </>
                  );

                  return onSelectCategory && row.categoryKey ? (
                    <button
                      type="button"
                      className="stat-card stat-link workspace-statistics-demand__row workspace-statistics-demand__row-button"
                      aria-label={`${row.categoryName}. ${copy.citiesColumnRequests}: ${row.requestCount}. ${row.sharePercent}%.`}
                      onClick={() => onSelectCategory(row.categoryKey ?? null)}
                    >
                      {content}
                    </button>
                  ) : (
                    <div
                      className="stat-card stat-link workspace-statistics-demand__row"
                      aria-label={`${row.categoryName}. ${copy.citiesColumnRequests}: ${row.requestCount}. ${row.sharePercent}%.`}
                    >
                      {content}
                    </div>
                  );
                })()}
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

const DEFAULT_DEMAND_PAGE_SIZE = 6;

function resolveDemandSubtitle(model: Pick<WorkspaceStatisticsModel, 'copy' | 'context' | 'sectionMeta'>) {
  if (model.sectionMeta.demandSubtitle) return model.sectionMeta.demandSubtitle;
  if (model.context.mode === 'focus') {
    return `${model.copy.demandSubtitle} · ${model.context.periodLabel}`;
  }
  return model.copy.demandSubtitle;
}

export function StatisticsDemandPanelSection({
  model,
  t,
  pageSize = DEFAULT_DEMAND_PAGE_SIZE,
  className,
  onSelectCategory,
  categoryFit,
}: {
  model: Pick<WorkspaceStatisticsModel, 'copy' | 'context' | 'sectionMeta' | 'demandRows'>;
  t: TranslateFn;
  pageSize?: number;
  className?: string;
  onSelectCategory?: (next: string | null) => void;
  categoryFit?: WorkspaceStatisticsModel['categoryFit'];
}) {
  const [page, setPage] = React.useState(1);
  const subtitle = React.useMemo(() => resolveDemandSubtitle(model), [model]);
  const demandPagination = React.useMemo(
    () => paginateItems(model.demandRows, page, pageSize),
    [model.demandRows, page, pageSize],
  );
  const {
    totalPages,
    safePage,
    visibleItems,
  } = demandPagination;

  React.useEffect(() => {
    setPage(1);
  }, [model.demandRows]);

  return (
    <StatisticsDemandPanel
      copy={model.copy}
      subtitle={subtitle}
      demandRows={model.demandRows}
      visibleDemandRows={visibleItems}
      categoryFit={categoryFit}
      safeDemandPage={safePage}
      demandTotalPages={totalPages}
      onPrevPage={() => setPage((prev) => Math.max(1, prev - 1))}
      onNextPage={() => setPage((prev) => Math.min(totalPages, prev + 1))}
      onSelectCategory={onSelectCategory}
      t={t}
      className={className}
    />
  );
}
