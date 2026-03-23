/* src/components/home/HomePlatformActivityPanel.tsx */
'use client';

import { Card, CardTitle } from '@/components/ui/Card';
import { RangeActionToolbar } from '@/components/ui/RangeActionToolbar';
import type {
  HomePlatformActivityChartModel,
  HomePlatformActivityPanelViewModel,
} from '@/components/home/homePlatformActivityPanel.model';

type HomePlatformActivityPanelProps = HomePlatformActivityPanelViewModel & {
  onRangeChange: (next: HomePlatformActivityPanelViewModel['range']) => void;
  onHoverPoint: (index: number) => void;
};

export function HomePlatformActivityPanel({
  title,
  subtitle,
  groupLabel,
  rangeOptions,
  range,
  status,
  isUpdating,
  errorLabel,
  emptyLabel,
  content,
  onRangeChange,
  onHoverPoint,
}: HomePlatformActivityPanelProps) {
  return (
    <Card className={`home-activity-panel ${isUpdating ? 'is-fetching' : ''}`.trim()}>
      <div className="home-activity__header">
        <div className="home-activity__header-top">
          <CardTitle className="home-activity__title">{title}</CardTitle>
        </div>
        <p className="home-activity__subtitle">{subtitle}</p>
      </div>

      <RangeActionToolbar
        className="mt-3"
        groupLabel={groupLabel}
        options={rangeOptions}
        value={range}
        onChange={onRangeChange}
      />

      {status === 'loading' ? (
        <div className="home-activity__loading mt-3">
          <div className="skeleton h-28 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      ) : status === 'error' ? (
        <div className="home-activity__state mt-3">{errorLabel}</div>
      ) : status === 'empty' || !content ? (
        <div className="home-activity__state mt-3">{emptyLabel}</div>
      ) : (
        <div className="home-activity__content">
          <HomePlatformActivityChart chart={content.chart} onHoverPoint={onHoverPoint} />
          <div className="home-activity__meta">
            <div className="home-activity__point-time">{content.pointTime}</div>
            <div className="home-activity__legend">
              <span className="home-activity__metric is-requests">
                {content.requestsMetric.label}: <strong>{content.requestsMetric.value}</strong>
              </span>
              <span className="home-activity__metric is-offers">
                {content.offersMetric.label}: <strong>{content.offersMetric.value}</strong>
              </span>
            </div>
            {content.updatedText ? (
              <div className="home-activity__updated">{content.updatedText}</div>
            ) : null}
          </div>
        </div>
      )}
    </Card>
  );
}

function HomePlatformActivityChart({
  chart,
  onHoverPoint,
}: {
  chart: HomePlatformActivityChartModel;
  onHoverPoint: (index: number) => void;
}) {
  return (
    <div className="home-activity__chart mt-3">
      <svg
        className="home-activity__svg"
        viewBox={chart.viewBox}
        preserveAspectRatio="none"
      >
        <line x1="0" y1="85" x2={String(chart.width)} y2="85" className="home-activity__axis" />
        <path d={chart.offersPath} className="home-activity__line is-offers" />
        <path d={chart.requestsPath} className="home-activity__line is-requests" />
        {chart.hoverZones.map((zone) => (
          <rect
            key={zone.key}
            x={zone.x}
            y="0"
            width={Math.max(zone.width, 1)}
            height={chart.height}
            fill="transparent"
            onPointerEnter={() => onHoverPoint(zone.index)}
            onPointerMove={() => onHoverPoint(zone.index)}
          />
        ))}
        {chart.dots.map((point) => (
          <g key={point.key}>
            <circle
              cx={point.requests.cx}
              cy={point.requests.cy}
              r={point.requests.r}
              className="home-activity__dot is-requests"
            />
            <circle
              cx={point.offers.cx}
              cy={point.offers.cy}
              r={point.offers.r}
              className="home-activity__dot is-offers"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
