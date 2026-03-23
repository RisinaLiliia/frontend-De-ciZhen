'use client';
import * as React from 'react';
import {
  IconTrophyBronze,
  IconTrophyGold,
  IconTrophySilver,
} from '@/components/ui/icons/icons';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../../workspaceStatistics.model';
import { StatisticsSignalMeter } from '../../components/StatisticsSignalMeter';
import { StatisticsStatusBadge } from '../../components/StatisticsStatusBadge';
import type { OpportunityAxis, OpportunityItem } from './opportunity.utils';
import {
  buildOpportunityRadarAxisEndpoints,
  buildOpportunityRadarAxisValueLabelPositions,
  buildOpportunityRadarPoints,
  buildOpportunityRadarSmoothPath,
  opportunityStatusClassName,
  opportunityStatusLabel,
} from './opportunity.utils';

export function OpportunityAnalysisCard({
  copy,
  locale,
  item,
  axes,
  summary,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  locale: Locale;
  item: OpportunityItem;
  axes: OpportunityAxis[];
  summary: string;
}) {
  const radarPoints = React.useMemo(
    () => buildOpportunityRadarPoints(axes.map((axis) => axis.value)),
    [axes],
  );
  const radarPath = React.useMemo(
    () => buildOpportunityRadarSmoothPath(radarPoints),
    [radarPoints],
  );
  const radarAxisValueLabels = React.useMemo(
    () => buildOpportunityRadarAxisValueLabelPositions(axes.map((axis) => axis.value)),
    [axes],
  );
  const radarRingLevels = React.useMemo(() => [2.5, 5, 7.5, 10], []);
  const radarAxisEndpoints = React.useMemo(() => buildOpportunityRadarAxisEndpoints(), []);
  const rankTone = item.rank === 1 ? 'gold' : item.rank === 2 ? 'silver' : 'bronze';
  const featuredStatus = item.rank === 1 && item.status === 'balanced' ? 'good' : item.status;
  const statusClass = opportunityStatusClassName(featuredStatus);

  return (
    <article
      className={`stat-card workspace-statistics-opportunity__item workspace-statistics-opportunity__item--analysis is-${item.tone}`.trim()}
      aria-label={locale === 'de' ? `Detailanalyse für ${item.city}` : `Detailed analysis for ${item.city}`}
    >
      <div className="workspace-statistics-opportunity__analysis-overview">
        <div className="workspace-statistics-opportunity__analysis-identity">
          <span className={`workspace-statistics-city-list__rank-cup is-${rankTone}`.trim()} aria-hidden="true">
            {item.rank === 1 ? <IconTrophyGold size={30} /> : null}
            {item.rank === 2 ? <IconTrophySilver size={30} /> : null}
            {item.rank === 3 ? <IconTrophyBronze size={30} /> : null}
          </span>
          <div className="workspace-statistics-opportunity__identity">
            <strong className="workspace-statistics-opportunity__city">{item.city}</strong>
            <span className="workspace-statistics-opportunity__category">{item.category}</span>
          </div>
        </div>
        <div
          className="workspace-statistics-opportunity__analysis-score"
          aria-label={`${copy.opportunityScoreLabel}: ${item.score.toFixed(1)} / 10`}
        >
          <StatisticsSignalMeter
            className="workspace-statistics-opportunity__score"
            label={copy.opportunityScoreLabel}
            value={`${item.score.toFixed(1)} / 10`}
            progressPercent={item.score * 10}
          />
        </div>
      </div>

      <StatisticsStatusBadge
        className="workspace-statistics-opportunity__status workspace-statistics-opportunity__status--analysis"
        tone={statusClass}
        label={opportunityStatusLabel(featuredStatus, locale)}
      />

      <div className="workspace-statistics-opportunity__analysis-body">
        <div className="workspace-statistics-opportunity__radar-block">
          <div className="workspace-statistics-opportunity__radar" aria-hidden="true">
            <svg viewBox="0 0 180 180" role="presentation">
              {radarRingLevels.map((level) => (
                <circle
                  key={`ring-${level}`}
                  cx="90"
                  cy="90"
                  r={(62 * level) / 10}
                  className="workspace-statistics-opportunity__radar-ring"
                />
              ))}
              {radarRingLevels.map((level) => (
                <text
                  key={`ring-label-${level}`}
                  x="94"
                  y={90 - ((62 * level) / 10) + 3}
                  className="workspace-statistics-opportunity__radar-ring-label"
                >
                  {level}
                </text>
              ))}
              {radarAxisEndpoints.map((endpoint, index) => (
                <line
                  key={`axis-${index}`}
                  x1="90"
                  y1="90"
                  x2={endpoint.x}
                  y2={endpoint.y}
                  className="workspace-statistics-opportunity__radar-axis"
                />
              ))}
              {radarPath ? <path d={radarPath} className="workspace-statistics-opportunity__radar-shape" /> : null}
              {radarPoints.map((point, index) => (
                <circle
                  key={`dot-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="2.5"
                  className="workspace-statistics-opportunity__radar-dot"
                />
              ))}
              {radarAxisValueLabels.map((valueLabel, index) => (
                <text
                  key={`axis-value-${index}`}
                  x={valueLabel.x}
                  y={valueLabel.y}
                  className="workspace-statistics-opportunity__radar-axis-label"
                >
                  {valueLabel.label}
                </text>
              ))}
            </svg>
          </div>
        </div>
        <ul className="workspace-statistics-opportunity__analysis-axes">
          {axes.map((axis) => (
            <li key={axis.key}>
              <StatisticsSignalMeter
                className="workspace-statistics-opportunity__axis-signal"
                label={axis.label}
                value={`${axis.value.toFixed(1)} / 10`}
                progressPercent={axis.value * 10}
                semanticLabel={axis.semanticLabel}
                semanticTone={axis.semanticTone}
              />
            </li>
          ))}
        </ul>
      </div>

      <p className="workspace-statistics-opportunity__summary" aria-label={locale === 'de' ? 'Opportunity Zusammenfassung' : 'Opportunity summary'}>
        {summary}
      </p>

      <dl className="workspace-statistics-opportunity__metrics">
        <div>
          <dt>{copy.opportunityDemandLabel}</dt>
          <dd>{item.demand.toLocaleString()}</dd>
        </div>
        <div>
          <dt>{copy.opportunityProvidersLabel}</dt>
          <dd>{item.providers === null ? '—' : item.providers.toLocaleString()}</dd>
        </div>
        <div>
          <dt>{copy.opportunityBalanceLabel}</dt>
          <dd>{item.marketBalanceRatio === null ? '—' : item.marketBalanceRatio.toFixed(2)}</dd>
        </div>
      </dl>
    </article>
  );
}
