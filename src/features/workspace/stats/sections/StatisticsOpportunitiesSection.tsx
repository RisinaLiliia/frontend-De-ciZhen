'use client';

import { WorkspaceBadge, type WorkspaceBadgeVariant } from '@/features/workspace/shared/WorkspaceBadge';
import { workspaceStatCardShell, workspaceStatsChartPanelShell } from '@/features/workspace/shared';
import type { StatisticsOpportunityItem } from '../mappers/statisticsOpportunities.mapper';
import type { WorkspaceStatisticsModel } from '../statistics.model';

type StatisticsOpportunitiesSectionProps = {
  title: string;
  subtitle: string;
  items: StatisticsOpportunityItem[];
  copy: WorkspaceStatisticsModel['copy'];
};

const OPPORTUNITY_BADGE_VARIANTS: Record<StatisticsOpportunityItem['tone'], WorkspaceBadgeVariant> = {
  action: 'info',
  chance: 'opportunity',
  risk: 'danger',
  signal: 'neutral',
};

function getOpportunityToneLabel(
  tone: StatisticsOpportunityItem['tone'],
  copy: WorkspaceStatisticsModel['copy'],
) {
  if (tone === 'risk') return copy.insightsTypeRiskLabel;
  if (tone === 'action') return copy.insightsTypeActionLabel;
  if (tone === 'signal') return copy.insightsTypeSignalLabel;
  return copy.insightsTypeChanceLabel;
}

export function StatisticsOpportunitiesSection({
  title,
  subtitle,
  items,
  copy,
}: StatisticsOpportunitiesSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className={workspaceStatsChartPanelShell('workspace-statistics-opportunities')}>
      <header className="section-heading">
        <p className="section-title">{title}</p>
        <p className="section-subtitle">{subtitle}</p>
      </header>

      <ul className="workspace-statistics-opportunities__list">
        {items.map((item) => (
          <li
            key={item.key}
            className={workspaceStatCardShell(
              'workspace-statistics-opportunities__item',
              `is-${item.tone}`,
            )}
          >
            <WorkspaceBadge
              variant={OPPORTUNITY_BADGE_VARIANTS[item.tone]}
              tone="soft"
              size="sm"
              className="workspace-statistics-opportunities__badge"
            >
              {getOpportunityToneLabel(item.tone, copy)}
            </WorkspaceBadge>
            <strong>{item.title}</strong>
            <span>{item.body}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
