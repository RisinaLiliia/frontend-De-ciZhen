'use client';

import type { WorkspaceStatisticsModel } from '../useWorkspaceStatisticsModel';

export function StatisticsDecisionLayer({
  copy,
  decisionFootnote,
  activitySignals,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  decisionFootnote: WorkspaceStatisticsModel['decisionFootnote'];
  activitySignals: WorkspaceStatisticsModel['activitySignals'];
}) {
  if (activitySignals.length === 0) return null;

  return (
    <section className="workspace-statistics__decision-layer">
      <div className="section-heading workspace-statistics__activity-signals-head">
        <p className="section-title">{copy.activitySignalsTitle}</p>
        <p className="section-subtitle">{copy.activitySignalsSubtitle}</p>
      </div>
      <ul className="workspace-statistics__activity-signals" aria-label={copy.activitySignalsTitle}>
        {activitySignals.map((item) => (
          <li
            key={item.key}
            className={`stat-card workspace-statistics__activity-signal is-${item.tone}${item.tone === 'positive' ? ' dc-glow' : ''}`.trim()}
          >
            <span className="workspace-statistics__activity-signal-label">{item.label}</span>
            <strong className="workspace-statistics__activity-signal-value">{item.value}</strong>
            <span className="workspace-statistics__activity-signal-hint">{item.hint}</span>
          </li>
        ))}
      </ul>
      <div className="workspace-statistics__decision-footnote" aria-live="polite">
        <span>{decisionFootnote.updatedLine}</span>
        <span>{decisionFootnote.basedOnLine}</span>
      </div>
    </section>
  );
}
