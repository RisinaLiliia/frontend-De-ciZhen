'use client';

import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';
import { StatisticsDecisionAiCard } from '../components/StatisticsDecisionAiCard';
import { StatisticsMetricSignalCard } from '../components/StatisticsMetricSignalCard';

export function StatisticsDecisionLayer({
  copy,
  decisionInsight,
  activitySignals,
  subtitle,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  decisionInsight: WorkspaceStatisticsModel['decisionInsight'];
  activitySignals: WorkspaceStatisticsModel['activitySignals'];
  subtitle?: string;
}) {
  if (activitySignals.length === 0) return null;

  return (
    <section className="workspace-statistics__decision-layer">
      <div className="section-heading workspace-statistics__activity-signals-head">
        <p className="section-title">{copy.activitySignalsTitle}</p>
        <p className="section-subtitle">{subtitle ?? copy.activitySignalsSubtitle}</p>
      </div>
      <ul className="workspace-statistics__activity-signals" aria-label={copy.activitySignalsTitle}>
        {activitySignals.map((item) => (
          <StatisticsMetricSignalCard
            key={item.key}
            as="li"
            label={item.label}
            value={item.value}
            hint={item.hint}
            tone={item.tone}
          />
        ))}
      </ul>
      <StatisticsDecisionAiCard
        className="workspace-statistics__decision-ai"
        copy={copy}
        decisionInsight={decisionInsight}
      />
    </section>
  );
}
