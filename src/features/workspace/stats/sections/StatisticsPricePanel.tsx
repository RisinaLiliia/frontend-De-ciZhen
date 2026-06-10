'use client';

import { LocationMeta } from '@/components/ui/LocationMeta';
import { workspaceStatsChartPanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import type { WorkspaceStatisticsModel } from '../statistics.model';

export function StatisticsPricePanel({
  className,
  copy,
  title,
  priceIntelligence,
}: {
  className?: string;
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
    hasRangeValues &&
    typeof priceIntelligence.marketAverage === 'number' &&
    Number.isFinite(priceIntelligence.marketAverage)
      ? Math.min(
          maxValue ?? priceIntelligence.marketAverage,
          Math.max(minValue ?? priceIntelligence.marketAverage, priceIntelligence.marketAverage),
        )
      : null;
  const optimalMinValue =
    hasRangeValues &&
    typeof priceIntelligence.optimalMin === 'number' &&
    Number.isFinite(priceIntelligence.optimalMin)
      ? Math.min(
          maxValue ?? priceIntelligence.optimalMin,
          Math.max(minValue ?? priceIntelligence.optimalMin, priceIntelligence.optimalMin),
        )
      : null;
  const optimalMaxValue =
    hasRangeValues &&
    typeof priceIntelligence.optimalMax === 'number' &&
    Number.isFinite(priceIntelligence.optimalMax)
      ? Math.min(
          maxValue ?? priceIntelligence.optimalMax,
          Math.max(minValue ?? priceIntelligence.optimalMax, priceIntelligence.optimalMax),
        )
      : null;

  const toPercent = (value: number | null) => {
    if (!hasRangeValues || value === null || minValue === null || maxValue === null) return 0;
    return Math.max(
      0,
      Math.min(100, Number((((value - minValue) / (maxValue - minValue)) * 100).toFixed(2))),
    );
  };

  const optimalLeftPercent = toPercent(optimalMinValue);
  const optimalRightPercent = toPercent(optimalMaxValue);
  const optimalWidthPercent = Math.max(0, optimalRightPercent - optimalLeftPercent);
  const optimalCenterPercent = optimalLeftPercent + optimalWidthPercent / 2;
  const averageMarkerPercent = toPercent(averageValue);
  const hasAverageMarker = averageValue !== null;
  const priceCategoryLabel =
    priceIntelligence.categoryLabel ?? priceIntelligence.contextLabel ?? '—';
  const priceCityLabel = priceIntelligence.cityLabel ?? null;
  const endpointMinLabel = priceIntelligence.recommendedRangeLabel?.split('–')[0]?.trim() ?? '—';
  const endpointMaxLabel = priceIntelligence.recommendedRangeLabel?.split('–')[1]?.trim() ?? '—';
  const priceTicks = hasRangeValues
    ? [
        { key: 'min', label: endpointMinLabel, percent: 0 },
        {
          key: 'optimal-min',
          label: priceIntelligence.optimalMinLabel ?? endpointMinLabel,
          percent: optimalLeftPercent,
        },
        {
          key: 'avg',
          label: priceIntelligence.marketAverageLabel ?? '—',
          percent: averageMarkerPercent,
        },
        {
          key: 'optimal-max',
          label: priceIntelligence.optimalMaxLabel ?? endpointMaxLabel,
          percent: optimalRightPercent,
        },
        { key: 'max', label: endpointMaxLabel, percent: 100 },
      ].filter((tick, index, collection) => {
        return (
          collection.findIndex(
            (candidate) => candidate.label === tick.label && candidate.percent === tick.percent,
          ) === index
        );
      })
    : [];

  return (
    <section className={workspaceStatsChartPanelShell('workspace-statistics-price', className)}>
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{title ?? copy.priceTitle}</p>
        <p className="section-subtitle">{copy.priceSubtitle}</p>
      </header>
      {!hasPriceData ? (
        <p className="workspace-statistics__empty">{copy.priceNoData}</p>
      ) : (
        <article className="workspace-statistics-price__radar-card">
          <header className="workspace-statistics-price__radar-head">
            <div className="workspace-statistics-price__market-line">
              <p className="request-category workspace-statistics-price__context">
                {priceCategoryLabel}
              </p>
              {priceCityLabel ? (
                <LocationMeta
                  label={priceCityLabel}
                  className="workspace-statistics-price__location"
                />
              ) : null}
              <strong className="proof-price workspace-statistics-price__range">
                {priceIntelligence.recommendedRangeLabel ?? '—'}
              </strong>
            </div>
          </header>
          {hasRangeValues ? (
            <div
              className="workspace-statistics-price__radar-body"
              role="group"
              aria-label={copy.priceRadarLabel}
            >
              <div className="workspace-statistics-price__bar-wrap">
                <div className="workspace-statistics-price__bar" aria-hidden="true">
                  <span className="workspace-statistics-price__bar-base-line" />
                  {optimalWidthPercent > 0 ? (
                    <>
                      <span
                        className="workspace-statistics-price__bar-sweet-spot"
                        style={{
                          left: `${optimalLeftPercent}%`,
                          width: `${optimalWidthPercent}%`,
                        }}
                      />
                      <span
                        className="workspace-statistics-price__bar-node workspace-statistics-price__bar-node--recommendation"
                        style={{
                          left: `${optimalCenterPercent}%`,
                        }}
                      />
                    </>
                  ) : null}
                  {hasAverageMarker ? (
                    <span
                      className="workspace-statistics-price__bar-average-marker"
                      style={{
                        left: `${averageMarkerPercent}%`,
                      }}
                    />
                  ) : null}
                </div>
                <ol className="workspace-statistics-price__ticks" aria-hidden="true">
                  {priceTicks.map((tick) => (
                    <li
                      key={tick.key}
                      className={`workspace-statistics-price__tick workspace-statistics-price__tick--${tick.key}`}
                      style={{
                        left: `${tick.percent}%`,
                      }}
                    >
                      {tick.label}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="workspace-statistics-price__position-legend" aria-hidden="true">
                <span>{copy.pricePositionLowLabel}</span>
                <span>{copy.priceRecommendationLabel}</span>
                <span>{copy.pricePositionHighLabel}</span>
              </div>
              <div className="workspace-statistics-price__average">
                <span>{copy.priceMarketAverageLabel}</span>
                <strong className="proof-price">
                  {priceIntelligence.marketAverageLabel ?? '—'}
                </strong>
              </div>
            </div>
          ) : null}
        </article>
      )}
    </section>
  );
}
