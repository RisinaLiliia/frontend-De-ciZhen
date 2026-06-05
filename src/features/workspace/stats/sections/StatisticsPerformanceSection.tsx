'use client';

import * as React from 'react';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../statistics.model';
import { ActivityTrendChart } from '../ActivityTrendChart';
import { workspaceStatsChartPanelShell } from '@/features/workspace/shared';

type StatisticsPerformanceSectionProps = {
  model: WorkspaceStatisticsModel;
  activityTitle: string;
  activitySubtitle: string;
  activityPoints: WorkspaceStatisticsModel['activityPoints'];
  activityMeta: { peak: string; bestWindow: string; updatedAt: string };
  activitySummary: string | null;
  locale: Locale;
  primaryGridRef: React.RefObject<HTMLDivElement | null>;
  primaryGridMinHeight?: number | null;
};

export function StatisticsPerformanceSection({
  model,
  activityTitle,
  activitySubtitle,
  activityPoints,
  activityMeta,
  activitySummary,
  locale,
  primaryGridRef,
  primaryGridMinHeight,
}: StatisticsPerformanceSectionProps) {
  return (
    <div
      ref={primaryGridRef}
      className="workspace-statistics__activity-section"
      style={primaryGridMinHeight ? { minHeight: `${primaryGridMinHeight}px` } : undefined}
    >
      <section className={workspaceStatsChartPanelShell()}>
        <header className="section-heading workspace-statistics__tile-header">
          <p className="section-title">{activityTitle}</p>
          <p className="section-subtitle">{activitySubtitle}</p>
        </header>
        <ActivityTrendChart
          points={activityPoints}
          range={model.range}
          locale={locale}
          requestsLabel={model.copy.requestsLabel}
          offersLabel={model.copy.offersLabel}
          clientActivityLabel={model.copy.clientActivityChartLabel}
          providerActivityLabel={model.copy.providerActivityChartLabel}
          emptyLabel={model.copy.emptyActivity}
        />
        <div className="workspace-statistics__meta-grid">
          <div>
            <span>{model.copy.peakLabel}</span>
            <strong>{activityMeta.peak}</strong>
          </div>
          <div>
            <span>{model.copy.bestWindowLabel}</span>
            <strong>{activityMeta.bestWindow}</strong>
          </div>
          <div>
            <span>{model.copy.updatedLabel}</span>
            <strong>{activityMeta.updatedAt}</strong>
          </div>
        </div>
        {activitySummary ? (
          <p className="workspace-statistics__activity-summary">{activitySummary}</p>
        ) : null}
      </section>
    </div>
  );
}
