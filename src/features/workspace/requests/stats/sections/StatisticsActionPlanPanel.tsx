'use client';

import { Badge } from '@/components/ui/Badge';
import type { WorkspaceStatisticsModel } from '../workspaceStatistics.model';

export function StatisticsActionPlanPanel({
  copy,
  title,
  subtitle,
  steps,
}: {
  copy: WorkspaceStatisticsModel['copy'];
  title?: string;
  subtitle?: string;
  steps: NonNullable<WorkspaceStatisticsModel['userIntelligence']>['nextSteps'];
}) {
  return (
    <section className="panel workspace-statistics-user-panel workspace-statistics-user-panel--actions">
      <header className="section-heading workspace-statistics__tile-header">
        <p className="section-title">{title ?? copy.userActionsTitle}</p>
        <p className="section-subtitle">{subtitle ?? copy.userActionsSubtitle}</p>
      </header>
      {steps.length > 0 ? (
        <ol className="workspace-statistics-user-actions">
          {steps.map((step, index) => (
            <li key={step.key} className="stat-card workspace-statistics-user-actions__item">
              <div className="workspace-statistics-user-actions__head">
                <span className="workspace-statistics-user-actions__index">{index + 1}.</span>
                <Badge variant={step.priorityTone === 'warning' ? 'warning' : step.priorityTone === 'info' ? 'info' : 'success'} size="sm">
                  {step.priorityLabel}
                </Badge>
              </div>
              <strong className="workspace-statistics-user-actions__title">{step.title}</strong>
              <p className="workspace-statistics-user-actions__detail">{step.detail}</p>
              <div className="workspace-statistics-user-actions__meta">
                <span>
                  {copy.userActionImpactLabel}: <strong>{step.impactLabel}</strong>
                </span>
                <span>
                  {copy.userActionEffectLabel}: <strong>{step.effectLabel}</strong>
                </span>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="workspace-statistics__empty">{copy.userActionsEmpty}</p>
      )}
    </section>
  );
}
