'use client';

import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';

export function StatisticsPriorityPanel({
  title,
  subtitle,
  badgeLabel,
  badgeVariant,
  items,
}: {
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeVariant: BadgeVariant;
  items: NonNullable<WorkspaceStatisticsModel['userIntelligence']>['risks'];
}) {
  if (!items || !Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="panel workspace-statistics-user-panel">
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{title}</p>
        <p className="section-subtitle">{subtitle}</p>
      </header>
      <div className="workspace-statistics-user-priority__list">
        {items.map((item) => (
          <article key={item.key} className={`stat-card workspace-statistics-user-priority__item is-${item.tone}`.trim()}>
            <div className="workspace-statistics-user-priority__head">
              <Badge variant={badgeVariant} tone="soft" size="sm">{badgeLabel}</Badge>
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
  );
}
