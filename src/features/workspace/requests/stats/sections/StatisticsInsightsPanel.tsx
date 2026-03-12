'use client';

import type { WorkspaceStatisticsModel } from '../useWorkspaceStatisticsModel';

export function StatisticsInsightsPanel({
  copy,
  insights,
  showInsightsDebug,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  insights: WorkspaceStatisticsModel['insights'];
  showInsightsDebug: boolean;
}) {
  const insightsSubtitle = copy.insightsGeneratedLabel;

  return (
    <section className="panel stack-sm">
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{copy.insightsTitle}</p>
        <p className="section-subtitle">{insightsSubtitle}</p>
        <div className="workspace-statistics-insights__assistant">
          <span className="workspace-statistics-insights__assistant-avatar" aria-hidden="true">AI</span>
          <span className="workspace-statistics-insights__assistant-copy">
            <strong className="workspace-statistics-insights__assistant-name">{copy.insightsAssistantName}</strong>
            <span className="workspace-statistics-insights__assistant-note">{copy.insightsAssistantNote}</span>
          </span>
        </div>
      </header>
      {insights.length === 0 ? (
        <p className="workspace-statistics__empty">{copy.emptyInsights}</p>
      ) : (
        <ul className="workspace-statistics-insights requests-list" aria-label={copy.insightsTitle}>
          {insights.map((item, index) => (
            <li
              key={`${item.key}-${index}`}
              className={`stat-card stat-link workspace-statistics-insights__item is-${item.level} is-${item.kind}${index === 0 ? ' is-featured' : ''}`.trim()}
            >
              <span className="workspace-statistics-insights__content">
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
          ))}
        </ul>
      )}
    </section>
  );
}
