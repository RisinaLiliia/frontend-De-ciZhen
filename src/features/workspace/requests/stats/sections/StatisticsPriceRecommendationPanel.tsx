'use client';

import * as React from 'react';
import type { WorkspaceStatisticsModel } from '../useWorkspaceStatisticsModel';

function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

export function StatisticsPriceRecommendationPanel({
  copy,
  priceIntelligence,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  priceIntelligence: WorkspaceStatisticsModel['priceIntelligence'];
}) {
  const [isStrategyOpen, setIsStrategyOpen] = React.useState(false);
  const strategyRangeLabel =
    (priceIntelligence.optimalMinLabel && priceIntelligence.optimalMaxLabel)
      ? `${priceIntelligence.optimalMinLabel} – ${priceIntelligence.optimalMaxLabel}`
      : (priceIntelligence.recommendedRangeLabel ?? '—');
  const citySuffix = priceIntelligence.cityLabel ? ` in ${priceIntelligence.cityLabel}` : '';
  const marketAverageLabel = priceIntelligence.marketAverageLabel ?? '—';
  const strategyWhyText = fillTemplate(copy.priceStrategyWhyTemplate, {
    range: strategyRangeLabel,
    citySuffix,
  });
  const strategyObservationText = fillTemplate(copy.priceStrategyObservationTemplate, {
    range: strategyRangeLabel,
    average: marketAverageLabel,
  });
  const strategyActionText = fillTemplate(copy.priceStrategyActionTemplate, {
    range: strategyRangeLabel,
    average: marketAverageLabel,
  });
  const strategyPremiumText = fillTemplate(copy.priceStrategyPremiumTemplate, {
    range: strategyRangeLabel,
    average: marketAverageLabel,
  });
  const hasRecommendation =
    Boolean(priceIntelligence.recommendation) ||
    Boolean(priceIntelligence.contextLabel) ||
    Boolean(priceIntelligence.recommendedRangeLabel) ||
    Boolean(priceIntelligence.marketAverageLabel);

  if (!hasRecommendation) {
    return (
      <section className="panel requests-stats-chart workspace-statistics-price-recommendation">
        <p className="workspace-statistics__empty">{copy.priceNoData}</p>
      </section>
    );
  }

  return (
    <section className="panel requests-stats-chart workspace-statistics-price-recommendation">
      <span className="workspace-statistics-price__stamp workspace-statistics-price__stamp--meta">
        {copy.priceGeneratedLabel}
      </span>
      <div className="workspace-statistics-price__ki">
        <span className="workspace-statistics-price__ki-avatar" aria-hidden="true">
          {copy.insightsAssistantAvatarLabel}
        </span>
        <span className="workspace-statistics-price__ki-copy">
          <strong className="workspace-statistics-price__ki-name">{copy.insightsAssistantName}</strong>
          <span className="workspace-statistics-price__ki-note">{copy.priceRecommendationLabel}</span>
        </span>
      </div>
      <p className="workspace-statistics-price__note">
        {priceIntelligence.recommendation ?? copy.priceGuidanceNote}
      </p>
      <button
        type="button"
        className="btn-secondary workspace-statistics-price__strategy-button"
        onClick={() => setIsStrategyOpen((prev) => !prev)}
        aria-expanded={isStrategyOpen}
      >
        {isStrategyOpen ? copy.priceStrategyHideButtonLabel : copy.priceStrategyButtonLabel}
      </button>
      {isStrategyOpen ? (
        <article className="workspace-statistics-price__strategy-panel">
          <p className="workspace-statistics-price__strategy-title">{copy.priceStrategyTitle}</p>
          <section className="workspace-statistics-price__strategy-section">
            <p className="workspace-statistics-price__strategy-section-label">{copy.priceStrategyWhyLabel}</p>
            <p className="workspace-statistics-price__strategy-section-text">{strategyWhyText}</p>
          </section>
          <section className="workspace-statistics-price__strategy-section">
            <p className="workspace-statistics-price__strategy-section-label">{copy.priceStrategyObservationLabel}</p>
            <p className="workspace-statistics-price__strategy-section-text">{strategyObservationText}</p>
          </section>
          <section className="workspace-statistics-price__strategy-section">
            <p className="workspace-statistics-price__strategy-section-label">{copy.priceStrategyActionLabel}</p>
            <p className="workspace-statistics-price__strategy-section-text">{strategyActionText}</p>
          </section>
          <section className="workspace-statistics-price__strategy-section">
            <p className="workspace-statistics-price__strategy-section-label">{copy.priceStrategyPremiumLabel}</p>
            <p className="workspace-statistics-price__strategy-section-text">{strategyPremiumText}</p>
          </section>
        </article>
      ) : null}
    </section>
  );
}
