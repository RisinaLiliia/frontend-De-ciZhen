'use client';

import type { Ref } from 'react';

import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';

export function StatisticsPerformancePositionPanel({
  panelRef,
  copy,
  position,
}: {
  panelRef?: Ref<HTMLElement>;
  copy: WorkspaceStatisticsModel['copy'];
  position: NonNullable<WorkspaceStatisticsModel['userIntelligence']>['performancePosition'];
}) {
  if (!position) return null;

  return (
    <section ref={panelRef} className="panel workspace-statistics-user-panel">
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{copy.userPositionTitle}</p>
        <p className="section-subtitle">{copy.userPositionSubtitle}</p>
      </header>
      <div className={`workspace-statistics-user-position is-${position.bucket}`.trim()}>
        <strong className="workspace-statistics-user-position__headline">{position.headline}</strong>
        <p className="workspace-statistics-user-position__summary">{position.summary}</p>
        <div className="workspace-statistics-user-position__grid">
          <article className="stat-card workspace-statistics-user-position__metric">
            <span>{copy.userPositionOverallLabel}</span>
            <strong>{position.overall}</strong>
          </article>
          <article className="stat-card workspace-statistics-user-position__metric">
            <span>{copy.userPositionCategoryLabel}</span>
            <strong>{position.category}</strong>
          </article>
          <article className="stat-card workspace-statistics-user-position__metric">
            <span>{copy.userPositionCityLabel}</span>
            <strong>{position.city}</strong>
          </article>
        </div>
      </div>
    </section>
  );
}
