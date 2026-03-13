'use client';

import type { WorkspaceStatisticsModel } from '../useWorkspaceStatisticsModel';

export function StatisticsPricePanel({
  copy,
  priceIntelligence,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  priceIntelligence: WorkspaceStatisticsModel['priceIntelligence'];
}) {
  const hasRangeValues =
    typeof priceIntelligence.recommendedMin === 'number' &&
    Number.isFinite(priceIntelligence.recommendedMin) &&
    typeof priceIntelligence.recommendedMax === 'number' &&
    Number.isFinite(priceIntelligence.recommendedMax) &&
    priceIntelligence.recommendedMax > priceIntelligence.recommendedMin;

  const hasPriceData =
    Boolean(priceIntelligence.contextLabel) ||
    Boolean(priceIntelligence.recommendedRangeLabel) ||
    Boolean(priceIntelligence.marketAverageLabel);

  const minValue = hasRangeValues ? priceIntelligence.recommendedMin : null;
  const maxValue = hasRangeValues ? priceIntelligence.recommendedMax : null;
  const averageValue =
    hasRangeValues && typeof priceIntelligence.marketAverage === 'number' && Number.isFinite(priceIntelligence.marketAverage)
      ? Math.min(maxValue ?? priceIntelligence.marketAverage, Math.max(minValue ?? priceIntelligence.marketAverage, priceIntelligence.marketAverage))
      : null;
  const optimalMinValue =
    hasRangeValues &&
    typeof priceIntelligence.optimalMin === 'number' &&
    Number.isFinite(priceIntelligence.optimalMin)
      ? Math.min(maxValue ?? priceIntelligence.optimalMin, Math.max(minValue ?? priceIntelligence.optimalMin, priceIntelligence.optimalMin))
      : null;
  const optimalMaxValue =
    hasRangeValues &&
    typeof priceIntelligence.optimalMax === 'number' &&
    Number.isFinite(priceIntelligence.optimalMax)
      ? Math.min(maxValue ?? priceIntelligence.optimalMax, Math.max(minValue ?? priceIntelligence.optimalMax, priceIntelligence.optimalMax))
      : null;

  const toPercent = (value: number | null) => {
    if (!hasRangeValues || value === null || minValue === null || maxValue === null) return 0;
    return Math.max(0, Math.min(100, Number((((value - minValue) / (maxValue - minValue)) * 100).toFixed(2))));
  };

  const optimalLeftPercent = toPercent(optimalMinValue);
  const optimalRightPercent = toPercent(optimalMaxValue);
  const optimalWidthPercent = Math.max(0, optimalRightPercent - optimalLeftPercent);
  const averageMarkerPercent = toPercent(averageValue);

  const tickLabels = hasRangeValues
    ? [
        { key: 'min', label: priceIntelligence.recommendedRangeLabel?.split('–')[0]?.trim() ?? '—', percent: 0 },
        { key: 'avg', label: priceIntelligence.marketAverageLabel ?? '—', percent: averageMarkerPercent },
        { key: 'max', label: priceIntelligence.recommendedRangeLabel?.split('–')[1]?.trim() ?? '—', percent: 100 },
      ]
    : [];
  const profitScore =
    typeof priceIntelligence.profitPotentialScore === 'number' && Number.isFinite(priceIntelligence.profitPotentialScore)
      ? Math.max(0, Math.min(10, priceIntelligence.profitPotentialScore))
      : null;
  const profitFillPercent = profitScore === null ? 0 : Math.max(0, Math.min(100, profitScore * 10));

  return (
    <section className="panel requests-stats-chart workspace-statistics-price">
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{copy.priceTitle}</p>
        <p className="section-subtitle">{copy.priceSubtitle}</p>
      </header>
      {!hasPriceData ? (
        <p className="workspace-statistics__empty">{copy.priceNoData}</p>
      ) : (
        <div className="workspace-statistics-price__content">
          <article className="workspace-statistics-price__hero">
            <span className="workspace-statistics-price__signal">{copy.priceSignalLabel}</span>
            <p className="workspace-statistics-price__context">{priceIntelligence.contextLabel ?? '—'}</p>
            <span className="workspace-statistics-price__label">{copy.priceRadarLabel}</span>
            <strong className="workspace-statistics-price__range">
              {priceIntelligence.recommendedRangeLabel ?? '—'}
            </strong>
          </article>
          <p className="workspace-statistics-price__average">
            {copy.priceMarketAverageLabel} <strong>{priceIntelligence.marketAverageLabel ?? '—'}</strong>
          </p>
          <section className="workspace-statistics-price__profit" aria-label={copy.priceProfitPotentialLabel}>
            <div className="workspace-statistics-price__profit-head">
              <span>{copy.priceProfitPotentialLabel}</span>
              <strong>{profitScore === null ? '— / 10' : `${profitScore.toFixed(1)} / 10`}</strong>
            </div>
            <div className="workspace-statistics-price__profit-track" aria-hidden="true">
              <span
                className="workspace-statistics-price__profit-fill"
                style={{
                  width: `${profitFillPercent}%`,
                }}
              />
            </div>
            {priceIntelligence.profitPotentialLabel ? (
              <p className="workspace-statistics-price__profit-label">{priceIntelligence.profitPotentialLabel}</p>
            ) : null}
          </section>
          {hasRangeValues ? (
            <div className="workspace-statistics-price__bar-wrap" aria-label={copy.priceRadarLabel}>
              <div className="workspace-statistics-price__bar">
                <span
                  className="workspace-statistics-price__bar-sweet-spot"
                  style={{
                    left: `${optimalLeftPercent}%`,
                    width: `${optimalWidthPercent}%`,
                  }}
                />
                <span className="workspace-statistics-price__bar-sweet-label">{copy.priceSweetSpotLabel}</span>
                <span
                  className="workspace-statistics-price__bar-average-marker"
                  style={{
                    left: `${averageMarkerPercent}%`,
                  }}
                />
              </div>
              <ol className="workspace-statistics-price__ticks" aria-hidden="true">
                {tickLabels.map((tick) => (
                  <li
                    key={tick.key}
                    className="workspace-statistics-price__tick"
                    style={{
                      left: `${tick.percent}%`,
                    }}
                  >
                    <span>{tick.label}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
