'use client';

import * as React from 'react';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsModel } from '../statistics.model';
import { StatisticsDemandPanelSection } from '../StatisticsSections';
import { ActivityTrendChart } from '../ActivityTrendChart';
import { workspaceStatsChartPanelShell } from '@/features/workspace/shared';

type StatisticsPerformanceSectionProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  model: WorkspaceStatisticsModel;
  activityTitle: string;
  activitySubtitle: string;
  activityPoints: WorkspaceStatisticsModel['activityPoints'];
  activityMeta: { peak: string; bestWindow: string; updatedAt: string };
  activitySummary: string | null;
  categoryFit: WorkspaceStatisticsModel['categoryFit'];
  primaryGridRef: React.RefObject<HTMLDivElement | null>;
  primaryGridMinHeight?: number | null;
};

export function StatisticsPerformanceSection({
  t,
  locale,
  model,
  activityTitle,
  activitySubtitle,
  activityPoints,
  activityMeta,
  activitySummary,
  categoryFit,
  primaryGridRef,
  primaryGridMinHeight,
}: StatisticsPerformanceSectionProps) {
  return (
    <div
      ref={primaryGridRef}
      className="workspace-statistics__grid workspace-statistics__grid--primary"
      style={primaryGridMinHeight ? { minHeight: `${primaryGridMinHeight}px` } : undefined}
    >
      <section className={workspaceStatsChartPanelShell()}>
        <header className="section-heading workspace-statistics__tile-header">
          <p className="section-title">{activityTitle}</p>
          <p className="section-subtitle">{activitySubtitle}</p>
        </header>
        <ActivityTrendChart
          points={activityPoints}
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

      <StatisticsDemandPanelSection
        model={model}
        t={t}
        categoryFit={categoryFit}
      />
    </div>
  );
}
