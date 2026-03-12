'use client';

import type { WorkspaceStatisticsModel } from '../useWorkspaceStatisticsModel';

export function StatisticsPricePanel({
  copy,
  priceIntelligence,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  priceIntelligence: WorkspaceStatisticsModel['priceIntelligence'];
}) {
  return (
    <section className="panel requests-stats-chart workspace-statistics-price">
      <header className="section-heading workspace-statistics__tile-header">
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
