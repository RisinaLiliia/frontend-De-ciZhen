import type { WorkspaceStatisticsModel } from './statistics.model';
import type { WorkspaceStatisticsFunnelVisualRow } from './statisticsFunnel.utils';

export function StatisticsFunnelStack({
  rows,
  copy,
  isPersonalizedMode,
  funnelContainerRef,
  isPlaceholder = false,
}: {
  rows: WorkspaceStatisticsFunnelVisualRow[];
  copy: WorkspaceStatisticsModel['copy'];
  isPersonalizedMode: boolean;
  funnelContainerRef?: React.RefObject<HTMLOListElement | null>;
  isPlaceholder?: boolean;
}) {
  return (
    <ol
      className={`workspace-statistics-funnel__stack${isPlaceholder ? ' workspace-statistics-funnel__stack--placeholder' : ''}`.trim()}
      ref={funnelContainerRef}
    >
      {rows.map((step, index) => {
        const comparison = !step.isCurrency ? (step.compare ?? null) : null;
        const layerHintValue = !isPersonalizedMode
          ? step.railValue
          : (comparison?.marketRate ?? undefined);
        const layerHintLabel = !isPersonalizedMode
          ? step.railLabel
          : comparison?.marketRate
            ? step.railLabel
            : undefined;
        const comparisonLine = comparison
          ? [
              `${copy.comparisonUserLabel} ${comparison.userCount}`,
              comparison.userRate,
              comparison.gapRate,
            ]
              .filter(Boolean)
              .join(' · ')
          : null;
        const ariaLabel =
          isPersonalizedMode && comparison
            ? [
                `${step.fullLabel}: ${copy.comparisonMarketLabel} ${step.value}`,
                `${copy.comparisonUserLabel} ${comparison.userCount}`,
                comparison.userRate ? `${copy.comparisonUserLabel} ${comparison.userRate}` : null,
                layerHintLabel && layerHintValue ? `${layerHintLabel} ${layerHintValue}` : null,
                comparison.gapRate ? `${copy.comparisonGapLabel} ${comparison.gapRate}` : null,
              ]
                .filter(Boolean)
                .join(', ')
            : `${step.fullLabel}: ${step.value}${layerHintValue ? `, ${layerHintLabel ?? ''} ${step.railValue ?? ''}` : ''}`;

        return (
          <li
            key={`${step.key}-${index}`}
            className={`workspace-statistics-funnel__layer is-tone-${Math.min(index + 1, 6)}${step.isTall ? ' is-tall' : ''}${isPlaceholder ? ' is-placeholder' : ''}`.trim()}
            style={
              {
                ['--funnel-top-width' as string]: `${step.topWidthPercent}%`,
                ['--funnel-bottom-width' as string]: `${step.bottomWidthPercent}%`,
                ['--funnel-layer-index' as string]: `${index}`,
              } as React.CSSProperties
            }
            aria-label={ariaLabel}
            title={step.isCompactLabel ? step.fullLabel : undefined}
          >
            <div className="workspace-statistics-funnel__shape" aria-hidden="true" />
            <div className="workspace-statistics-funnel__layer-content">
              <span className="workspace-statistics-funnel__layer-label">{step.displayLabel}</span>
              <strong className="workspace-statistics-funnel__layer-value">{step.value}</strong>
            </div>
            {layerHintLabel || layerHintValue ? (
              <div className="workspace-statistics-funnel__layer-hint">
                <div className="workspace-statistics-funnel__layer-hint-main">
                  {layerHintLabel ? (
                    <span className="workspace-statistics-funnel__layer-hint-label">
                      {layerHintLabel}
                    </span>
                  ) : null}
                  <span
                    className="workspace-statistics-funnel__layer-hint-line"
                    aria-hidden="true"
                  />
                  {layerHintValue ? (
                    <strong className="workspace-statistics-funnel__layer-hint-value">
                      {layerHintValue}
                    </strong>
                  ) : null}
                </div>
              </div>
            ) : null}
            {isPersonalizedMode && comparisonLine ? (
              <div
                className={`workspace-statistics-funnel__layer-hint-compare${comparison?.isLargestGap ? ' is-highlighted' : ''}${comparison?.isLargestDropoff ? ' is-dropoff' : ''}`.trim()}
              >
                {comparisonLine}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
