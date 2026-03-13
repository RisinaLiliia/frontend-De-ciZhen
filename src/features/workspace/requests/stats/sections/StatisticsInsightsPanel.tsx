'use client';

import type { WorkspaceStatisticsModel } from '../useWorkspaceStatisticsModel';
import { StatisticsKiCard } from '../components/StatisticsKiCard';

function splitInsightEvidence(evidence: string | undefined): string[] {
  if (!evidence) return [];
  return evidence
    .split('·')
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

function resolveInsightBadge(
  item: WorkspaceStatisticsModel['insights'][number],
  copy: WorkspaceStatisticsModel['copy'],
): { label: string; tone: 'success' | 'info' | 'warning' | 'danger' } {
  if (item.kind === 'opportunity' || item.kind === 'demand') {
    return { label: copy.insightsTypeChanceLabel, tone: 'success' };
  }
  if (item.kind === 'growth' || item.kind === 'performance') {
    return { label: copy.insightsTypeTrendLabel, tone: 'info' };
  }
  if (item.kind === 'risk') {
    return { label: copy.insightsTypeRiskLabel, tone: 'warning' };
  }
  if (item.kind === 'promotion') {
    return { label: copy.insightsTypeActionLabel, tone: 'danger' };
  }
  return { label: copy.insightsTypeSignalLabel, tone: 'info' };
}

export function StatisticsInsightsPanel({
  copy,
  insights,
  showInsightsDebug,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  insights: WorkspaceStatisticsModel['insights'];
  showInsightsDebug: boolean;
}) {
  const featuredInsight = insights[0];
  const secondaryInsights = insights.slice(1);
  const featuredBadge = featuredInsight ? resolveInsightBadge(featuredInsight, copy) : null;

  return (
    <section className="panel stack-sm">
      <header className="section-heading workspace-statistics__tile-header workspace-statistics-insights__header">
        <span className="workspace-statistics-insights__heading">
          <p className="section-title">{copy.insightsTitle}</p>
          <p className="section-subtitle">{copy.insightsSubtitle}</p>
        </span>
        <StatisticsKiCard
          className="workspace-statistics-insights__ki"
          variant="plain"
          stamp={copy.insightsGeneratedLabel}
          avatarLabel={copy.insightsAssistantAvatarLabel}
          name={copy.insightsAssistantName}
          role={copy.insightsAssistantNote}
        />
      </header>
      {insights.length === 0 ? (
        <p className="workspace-statistics__empty">{copy.emptyInsights}</p>
      ) : (
        <div className="workspace-statistics-insights" aria-label={copy.insightsTitle}>
          {featuredInsight ? (
            <article
              className={`stat-card stat-link workspace-statistics-insights__item is-featured is-${featuredInsight.level} is-${featuredInsight.kind}`.trim()}
            >
              <span className="workspace-statistics-insights__content">
                <span className="workspace-statistics-insights__eyebrow">
                  <span
                    className={`status-badge status-badge--${featuredBadge?.tone ?? 'info'} workspace-statistics-insights__chip`}
                  >
                    {featuredBadge?.label ?? copy.insightsTypeSignalLabel}
                  </span>
                  <span className="workspace-statistics-insights__featured-label">{copy.insightsFeaturedLabel}</span>
                </span>
                {featuredInsight.title ? (
                  <strong className="workspace-statistics-insights__title">{featuredInsight.title}</strong>
                ) : null}
                <span className="workspace-statistics-insights__text">{featuredInsight.text}</span>
                <span className="workspace-statistics-insights__metrics">
                  {splitInsightEvidence(featuredInsight.evidence).map((token) => (
                    <span key={`${featuredInsight.key}-${token}`} className="workspace-statistics-insights__metric">
                      {token}
                    </span>
                  ))}
                </span>
                <span className="workspace-statistics-insights__action">
                  {copy.insightsFeaturedActionLabel}
                  <span aria-hidden="true">→</span>
                </span>
                {showInsightsDebug ? (
                  <span className="workspace-statistics-insights__debug">
                    {featuredInsight.code}
                    {typeof featuredInsight.score === 'number' ? ` · score ${featuredInsight.score}` : ''}
                    {featuredInsight.priority ? ` · ${featuredInsight.priority}` : ''}
                    {featuredInsight.context ? ` · ${featuredInsight.context}` : ''}
                  </span>
                ) : null}
              </span>
            </article>
          ) : null}
          {secondaryInsights.length > 0 ? (
            <ul className="workspace-statistics-insights__secondary requests-list" aria-label={copy.insightsTitle}>
              {secondaryInsights.map((item, index) => {
                const badge = resolveInsightBadge(item, copy);
                return (
                  <li
                    key={`${item.key}-${index}`}
                    className={`stat-card stat-link workspace-statistics-insights__item is-${item.level} is-${item.kind}`.trim()}
                  >
                    <span className="workspace-statistics-insights__content">
                      <span className="workspace-statistics-insights__eyebrow">
                        <span className={`status-badge status-badge--${badge.tone} workspace-statistics-insights__chip`}>
                          {badge.label}
                        </span>
                      </span>
                      {item.title ? (
                        <strong className="workspace-statistics-insights__title">{item.title}</strong>
                      ) : null}
                      <span className="workspace-statistics-insights__text">{item.text}</span>
                      {item.evidence ? (
                        <span className="workspace-statistics-insights__evidence">{item.evidence}</span>
                      ) : null}
                      {showInsightsDebug ? (
                        <span className="workspace-statistics-insights__debug">
                          {item.code}
                          {typeof item.score === 'number' ? ` · score ${item.score}` : ''}
                          {item.priority ? ` · ${item.priority}` : ''}
                          {item.context ? ` · ${item.context}` : ''}
                        </span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      )}
    </section>
  );
}
