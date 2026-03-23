'use client';

import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';
import { StatisticsSignalMeter } from '../components/StatisticsSignalMeter';

export function StatisticsPricePanel({
  copy,
  title,
  priceIntelligence,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  title?: string;
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
  const optimalCenterPercent = optimalLeftPercent + (optimalWidthPercent / 2);
  const averageMarkerPercent = toPercent(averageValue);
  const optimalRangeLabel =
    (priceIntelligence.optimalMinLabel && priceIntelligence.optimalMaxLabel)
      ? `${priceIntelligence.optimalMinLabel} – ${priceIntelligence.optimalMaxLabel}`
      : priceIntelligence.recommendedRangeLabel ?? '—';
  const endpointMinLabel = priceIntelligence.recommendedRangeLabel?.split('–')[0]?.trim() ?? '—';
  const endpointMaxLabel = priceIntelligence.recommendedRangeLabel?.split('–')[1]?.trim() ?? '—';

  const pricePositionTicks = hasRangeValues
    ? [
        { key: 'min', label: minValue === null ? '—' : `${minValue}`, formatted: endpointMinLabel, percent: 0 },
        {
          key: 'optimal-min',
          label: optimalMinValue === null ? '—' : `${optimalMinValue}`,
          formatted: priceIntelligence.optimalMinLabel ?? endpointMinLabel,
          percent: optimalLeftPercent,
        },
        {
          key: 'avg',
          label: averageValue === null ? '—' : `${averageValue}`,
          formatted: priceIntelligence.marketAverageLabel ?? '—',
          percent: averageMarkerPercent,
        },
        {
          key: 'optimal-max',
          label: optimalMaxValue === null ? '—' : `${optimalMaxValue}`,
          formatted: priceIntelligence.optimalMaxLabel ?? endpointMaxLabel,
          percent: optimalRightPercent,
        },
        { key: 'max', label: maxValue === null ? '—' : `${maxValue}`, formatted: endpointMaxLabel, percent: 100 },
      ].filter((tick, index, collection) => {
        return collection.findIndex((candidate) => candidate.label === tick.label && candidate.formatted === tick.formatted) === index;
      })
    : [];
  const profitScore =
    typeof priceIntelligence.profitPotentialScore === 'number' && Number.isFinite(priceIntelligence.profitPotentialScore)
      ? Math.max(0, Math.min(10, priceIntelligence.profitPotentialScore))
      : null;
  const profitFillPercent = profitScore === null ? 0 : Math.max(0, Math.min(100, profitScore * 10));
  const profitSemanticTone =
    priceIntelligence.profitPotentialStatus === 'high'
      ? 'very-high'
      : priceIntelligence.profitPotentialStatus === 'medium'
        ? 'high'
        : priceIntelligence.profitPotentialStatus === 'low'
          ? 'low'
          : 'balanced';

  return (
    <section className="panel requests-stats-chart workspace-statistics-price">
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{title ?? copy.priceTitle}</p>
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
          {hasRangeValues ? (
            <section className="workspace-statistics-price__position" aria-label={copy.priceOpportunityZoneLabel}>
              <div className="workspace-statistics-price__position-head">
                <span className="workspace-statistics-price__position-label">{copy.priceOpportunityZoneLabel}</span>
                <strong className="workspace-statistics-price__position-range">{optimalRangeLabel}</strong>
              </div>
              <p className="workspace-statistics-price__position-hint">{copy.priceOpportunityHint}</p>
              <div className="workspace-statistics-price__position-scale" aria-hidden="true">
                <span>{endpointMinLabel}</span>
                <span>{endpointMaxLabel}</span>
              </div>
              <div className="workspace-statistics-price__bar-wrap" aria-label={copy.priceRadarLabel}>
                <div className="workspace-statistics-price__bar">
                  <span className="workspace-statistics-price__bar-base-line" />
                  {pricePositionTicks.map((tick) => (
                    <span
                      key={tick.key}
                      className={`workspace-statistics-price__bar-node workspace-statistics-price__bar-node--${tick.key}`}
                      style={{
                        left: `${tick.percent}%`,
                      }}
                    />
                  ))}
                  <span
                    className="workspace-statistics-price__bar-sweet-spot"
                    style={{
                      left: `${optimalLeftPercent}%`,
                      width: `${optimalWidthPercent}%`,
                    }}
                  />
                  <span
                    className="workspace-statistics-price__bar-sweet-label"
                    style={{
                      left: `${optimalCenterPercent}%`,
                    }}
                  >
                    <span>{copy.priceRecommendationLabel}</span>
                    <strong>{optimalRangeLabel}</strong>
                  </span>
                  <span
                    className="workspace-statistics-price__bar-average-marker"
                    style={{
                      left: `${averageMarkerPercent}%`,
                    }}
                  />
                </div>
                <ol className="workspace-statistics-price__ticks" aria-hidden="true">
                  {pricePositionTicks.map((tick) => (
                    <li
                      key={tick.key}
                      className={`workspace-statistics-price__tick workspace-statistics-price__tick--${tick.key}`}
                      style={{
                        left: `${tick.percent}%`,
                      }}
                    >
                      <span>{tick.formatted}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="workspace-statistics-price__position-legend" aria-hidden="true">
                <span>{copy.pricePositionLowLabel}</span>
                <span>{copy.priceRecommendationLabel}</span>
                <span>{copy.pricePositionHighLabel}</span>
              </div>
            </section>
          ) : null}
          <div className="workspace-statistics-price__summary-grid">
            <article className="workspace-statistics-price__summary-card workspace-statistics-price__summary-card--average">
              <span className="workspace-statistics-price__summary-label">{copy.priceMarketAverageLabel}</span>
              <strong className="workspace-statistics-price__summary-value">{priceIntelligence.marketAverageLabel ?? '—'}</strong>
            </article>
            <section
              className="workspace-statistics-price__profit workspace-statistics-price__summary-card"
              aria-label={copy.priceProfitPotentialLabel}
            >
              <StatisticsSignalMeter
                className="workspace-statistics-price__profit-signal"
                label={copy.priceProfitPotentialLabel}
                value={profitScore === null ? '— / 10' : `${profitScore.toFixed(1)} / 10`}
                progressPercent={profitFillPercent}
                semanticLabel={priceIntelligence.profitPotentialLabel}
                semanticTone={profitSemanticTone}
                semanticAlign="start"
              />
            </section>
          </div>
        </div>
      )}
    </section>
  );
}
