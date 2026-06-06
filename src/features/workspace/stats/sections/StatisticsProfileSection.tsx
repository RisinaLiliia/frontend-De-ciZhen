'use client';

import type { WorkspaceStatisticsModel } from '../statistics.model';
import { StatisticsFunnelStack } from '../StatisticsFunnelStack';
import { workspaceStatsChartPanelShell } from '@/features/workspace/shared';

type StatisticsProfileSectionProps = {
  profilePanelRef: React.RefObject<HTMLElement | null>;
  copy: WorkspaceStatisticsModel['copy'];
  mode: WorkspaceStatisticsModel['mode'];
  funnelPeriodLabel: string | null;
  hasFunnelData: boolean;
  funnelVisualRows: ReturnType<typeof import('../statisticsFunnel.utils').buildFunnelVisualRows>;
  isPersonalizedMode: boolean;
  funnelContainerRef: React.RefObject<HTMLOListElement | null>;
};

export function StatisticsProfileSection({
  profilePanelRef,
  copy,
  mode,
  funnelPeriodLabel,
  hasFunnelData,
  funnelVisualRows,
  isPersonalizedMode,
  funnelContainerRef,
}: StatisticsProfileSectionProps) {
  return (
    <section
      ref={profilePanelRef}
      className={workspaceStatsChartPanelShell('workspace-statistics__profile-panel')}
    >
      <header className="section-heading workspace-statistics__tile-header workspace-statistics__tile-header--profile">
        <div className="workspace-statistics__profile-title-row">
          <p className="section-title">{copy.profileTitle}</p>
          {funnelPeriodLabel ? (
            <span className="workspace-statistics__profile-period">{copy.profileRevenueLabel} · {funnelPeriodLabel}</span>
          ) : null}
        </div>
        <p className="section-subtitle">{mode === 'personalized' ? copy.profileSubtitlePersonalized : copy.profileSubtitlePlatform}</p>
      </header>
      {!hasFunnelData ? null : (
  <div
    className={`workspace-statistics-funnel${
      isPersonalizedMode ? ' workspace-statistics-funnel--personalized' : ''
    }`}
  >
    <StatisticsFunnelStack
      rows={funnelVisualRows}
      copy={copy}
      isPersonalizedMode={isPersonalizedMode}
      funnelContainerRef={funnelContainerRef}
    />
  </div>
)}
    </section>
  );
}
