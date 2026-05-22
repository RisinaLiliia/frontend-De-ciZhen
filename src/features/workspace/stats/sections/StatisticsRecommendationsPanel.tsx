'use client';

import { WorkspaceBadge, type WorkspaceBadgeVariant } from '@/features/workspace/shared/WorkspaceBadge';
import {
  workspacePanelShell,
  workspaceStatCardShell,
} from '@/features/workspace/shared/workspaceSurfaceShell';
import type {
  WorkspaceStatisticsPriorityItemView,
  WorkspaceStatisticsModel,
} from '../workspaceStatistics.model';

type RecommendationGroup = {
  title: string;
  subtitle?: string;
  badgeLabel: string;
  badgeVariant: WorkspaceBadgeVariant;
  items: WorkspaceStatisticsPriorityItemView[];
};

export function StatisticsRecommendationsPanel({
  copy,
  groups,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  groups: RecommendationGroup[];
}) {
  const visibleGroups = groups.filter((group) => group.items.length > 0);

  if (visibleGroups.length === 0) return null;

  return (
    <section className={workspacePanelShell('workspace-statistics-user-panel', 'workspace-statistics-user-panel--recommendations')}>
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{copy.decisionStrategyTitle}</p>
      </header>

      <div className="workspace-statistics-user-priority__groups">
        {visibleGroups.map((group) => (
          <section key={group.title} className="workspace-statistics-user-priority__group">
            <header className="workspace-statistics-user-priority__group-head">
              <p className="workspace-statistics-user-priority__group-title">{group.title}</p>
              {group.subtitle ? (
                <p className="workspace-statistics-user-priority__group-subtitle">{group.subtitle}</p>
              ) : null}
            </header>

            <div className="workspace-statistics-user-priority__list">
              {group.items.map((item) => (
                <article
                  key={item.key}
                  className={workspaceStatCardShell('workspace-statistics-user-priority__item', `is-${item.tone}`)}
                >
                  <div className="workspace-statistics-user-priority__head">
                    <WorkspaceBadge variant={group.badgeVariant}>{group.badgeLabel}</WorkspaceBadge>
                    {item.metric ? (
                      <span className="workspace-statistics-user-priority__metric">{item.metric}</span>
                    ) : null}
                  </div>
                  <strong className="workspace-statistics-user-priority__title">{item.title}</strong>
                  <p className="workspace-statistics-user-priority__body">{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
