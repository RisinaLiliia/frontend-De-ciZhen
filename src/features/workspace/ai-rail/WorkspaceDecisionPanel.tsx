'use client';

import * as React from 'react';

import { buildDecisionPanelSummaryText } from '@/features/workspace/requests/requestsDecision.model';
import type { WorkspaceRequestsDecisionPanelDto } from '@/lib/api/dto/workspace';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';

export type WorkspaceDecisionPanelProps = {
  locale: Locale;
  panel: WorkspaceRequestsDecisionPanelDto;
  isDecisionMode: boolean;
  activeRequestId: string | null;
  onStartDecisionMode: () => void;
  onOpenQueueItem: (requestId: string) => void;
  variant?: 'private' | 'market';
};

export function WorkspaceDecisionPanel({
  locale,
  panel,
  isDecisionMode,
  activeRequestId,
  onStartDecisionMode,
  onOpenQueueItem,
  variant = 'private',
}: WorkspaceDecisionPanelProps) {
  const t = (key: string) => translate(key as never, locale);
  const summaryText = React.useMemo(
    () => buildDecisionPanelSummaryText({ locale, panel, variant }),
    [locale, panel, variant],
  );
  const priorityLabel = (level: 'high' | 'medium' | 'low') => {
    if (variant === 'market') {
      if (level === 'high') return t(I18N_KEYS.requestsPage.decisionPanelPriorityHigh);
      if (level === 'medium') return t(I18N_KEYS.requestsPage.decisionPanelPriorityMedium);
      return t(I18N_KEYS.requestsPage.decisionPanelPriorityNew);
    }

    if (level === 'high') return t(I18N_KEYS.requestsPage.decisionPanelPriorityHigh);
    if (level === 'medium') return t(I18N_KEYS.requestsPage.decisionPanelPriorityMedium);
    return t(I18N_KEYS.requestsPage.decisionPanelPriorityLow);
  };
  const overviewEyebrow = variant === 'market'
    ? t(I18N_KEYS.requestsPage.decisionPanelMarketOverviewEyebrow)
    : t(I18N_KEYS.requestsPage.decisionPanelPrivateOverviewEyebrow);
  const overviewLabels = variant === 'market'
    ? {
        highUrgency: t(I18N_KEYS.requestsPage.decisionPanelOverviewHighDemand),
        inProgress: t(I18N_KEYS.requestsPage.decisionPanelOverviewInExecution),
        completedThisPeriod: t(I18N_KEYS.requestsPage.statusCompleted),
      }
    : {
        highUrgency: t(I18N_KEYS.requestsPage.decisionPanelOverviewHighUrgency),
        inProgress: t(I18N_KEYS.requestsPage.statusInProgress),
        completedThisPeriod: t(I18N_KEYS.requestsPage.statusCompleted),
      };

  return (
    <div className="workspace-decision-panel">
      <section className="app-rail-panel workspace-decision-panel__summary">
        <span className="workspace-decision-panel__eyebrow">
          {t(I18N_KEYS.requestsPage.decisionPanelTitle)}
        </span>
        <strong className="workspace-decision-panel__count">
          {panel.summary.totalNeedsAction}
        </strong>
        <h3 className="workspace-decision-panel__title">
          {variant === 'market'
            ? (
              panel.summary.totalNeedsAction > 0
                ? t(I18N_KEYS.requestsPage.decisionPanelMarketNeedsAttention)
                : t(I18N_KEYS.requestsPage.decisionPanelMarketNoOpenItems)
            )
            : (
              panel.summary.totalNeedsAction > 0
                ? t(I18N_KEYS.requestsPage.decisionPanelPrivateNeedsDecision)
                : t(I18N_KEYS.requestsPage.decisionPanelPrivateNoOpenItems)
            )}
        </h3>
        <p className="workspace-decision-panel__text">{summaryText}</p>
        <button
          type="button"
          className="app-button-primary workspace-ai-card__action workspace-decision-panel__primary"
          onClick={onStartDecisionMode}
          disabled={panel.summary.totalNeedsAction === 0}
        >
          {panel.primaryAction.label}
        </button>
      </section>

      <section className="app-rail-panel workspace-decision-panel__queue">
        <div className="workspace-decision-panel__section-head">
          <span className="workspace-decision-panel__eyebrow">
            {t(I18N_KEYS.requestsPage.decisionPanelQueueTitle)}
          </span>
        </div>
        {panel.queue.length > 0 ? (
          <ul className="workspace-decision-panel__queue-list">
            {panel.queue.slice(0, 5).map((item) => (
              <li key={item.requestId}>
                <button
                  type="button"
                  className={[
                    'workspace-decision-panel__queue-item',
                    item.requestId === activeRequestId ? 'is-active' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => onOpenQueueItem(item.requestId)}
                >
                  <span className="workspace-decision-panel__queue-copy">
                    <strong>{item.title}</strong>
                    <span>{item.actionLabel}</span>
                  </span>
                  <span className={`workspace-decision-panel__priority is-${item.actionPriorityLevel}`}>
                    {priorityLabel(item.actionPriorityLevel)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="workspace-decision-panel__empty">
            {variant === 'market'
              ? t(I18N_KEYS.requestsPage.decisionPanelMarketMoving)
              : t(I18N_KEYS.requestsPage.decisionPanelPrivateMoving)}
          </p>
        )}
        {variant === 'private' && isDecisionMode && panel.queue.length > 0 ? (
          <p className="workspace-decision-panel__hint">
            {t(I18N_KEYS.requestsPage.decisionPanelAutoPriorityHint)}
          </p>
        ) : null}
      </section>

      <section className="app-rail-panel workspace-decision-panel__overview">
        <span className="workspace-decision-panel__eyebrow">
          {overviewEyebrow}
        </span>
        <dl className="workspace-decision-panel__overview-grid">
          <div>
            <dt>{overviewLabels.highUrgency}</dt>
            <dd>{panel.overview.highUrgency}</dd>
          </div>
          <div>
            <dt>{overviewLabels.inProgress}</dt>
            <dd>{panel.overview.inProgress}</dd>
          </div>
          <div>
            <dt>{overviewLabels.completedThisPeriod}</dt>
            <dd>{panel.overview.completedThisPeriod}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
