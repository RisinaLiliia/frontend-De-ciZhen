'use client';

import * as React from 'react';

import { buildDecisionPanelSummaryText } from '@/features/workspace/requests/requestsDecision.model';
import type { WorkspaceRequestsDecisionPanelDto } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';

type DecisionPanelProps = {
  locale: Locale;
  panel: WorkspaceRequestsDecisionPanelDto;
  isDecisionMode: boolean;
  activeRequestId: string | null;
  onStartDecisionMode: () => void;
  onOpenQueueItem: (requestId: string) => void;
};

export function DecisionPanel({
  locale,
  panel,
  isDecisionMode,
  activeRequestId,
  onStartDecisionMode,
  onOpenQueueItem,
}: DecisionPanelProps) {
  const summaryText = React.useMemo(
    () => buildDecisionPanelSummaryText({ locale, panel }),
    [locale, panel],
  );
  const priorityLabel = React.useCallback((level: 'high' | 'medium' | 'low') => {
    if (locale === 'de') {
      if (level === 'high') return 'Hoch';
      if (level === 'medium') return 'Mittel';
      return 'Niedrig';
    }

    if (level === 'high') return 'High';
    if (level === 'medium') return 'Medium';
    return 'Low';
  }, [locale]);

  return (
    <div className="my-decision-panel">
      <section className="panel my-decision-panel__summary">
        <span className="my-decision-panel__eyebrow">
          {locale === 'de' ? 'Decision Panel' : 'Decision panel'}
        </span>
        <strong className="my-decision-panel__count">
          {panel.summary.totalNeedsAction}
        </strong>
        <h3 className="my-decision-panel__title">
          {panel.summary.totalNeedsAction > 0
            ? (locale === 'de'
              ? 'Vorgänge brauchen deine Entscheidung'
              : 'Items need your decision')
            : (locale === 'de'
              ? 'Keine offenen Entscheidungen'
              : 'No open decisions')}
        </h3>
        <p className="my-decision-panel__text">{summaryText}</p>
        <button
          type="button"
          className="btn-primary my-decision-panel__primary"
          onClick={onStartDecisionMode}
          disabled={panel.summary.totalNeedsAction === 0}
        >
          {panel.primaryAction.label}
        </button>
      </section>

      <section className="panel my-decision-panel__queue">
        <div className="my-decision-panel__section-head">
          <span className="my-decision-panel__eyebrow">
            {locale === 'de' ? 'Action Queue' : 'Action queue'}
          </span>
        </div>
        {panel.queue.length > 0 ? (
          <ul className="my-decision-panel__queue-list">
            {panel.queue.slice(0, 5).map((item) => (
              <li key={item.requestId}>
                <button
                  type="button"
                  className={[
                    'my-decision-panel__queue-item',
                    item.requestId === activeRequestId ? 'is-active' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => onOpenQueueItem(item.requestId)}
                >
                  <span className="my-decision-panel__queue-copy">
                    <strong>{item.title}</strong>
                    <span>{item.actionLabel}</span>
                  </span>
                  <span className={`my-decision-panel__priority is-${item.actionPriorityLevel}`}>
                    {priorityLabel(item.actionPriorityLevel)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="my-decision-panel__empty">
            {locale === 'de'
              ? 'Deine Vorgänge sind aktuell im Fluss.'
              : 'Your workflows are currently moving.'}
          </p>
        )}
        {isDecisionMode && panel.queue.length > 0 ? (
          <p className="my-decision-panel__hint">
            {locale === 'de'
              ? 'Decision Mode priorisiert diese Vorgänge automatisch.'
              : 'Decision mode keeps these items in priority order.'}
          </p>
        ) : null}
      </section>

      <section className="panel my-decision-panel__overview">
        <span className="my-decision-panel__eyebrow">
          {locale === 'de' ? 'Arbeitslage' : 'Workload'}
        </span>
        <dl className="my-decision-panel__overview-grid">
          <div>
            <dt>{locale === 'de' ? 'Hohe Dringlichkeit' : 'High urgency'}</dt>
            <dd>{panel.overview.highUrgency}</dd>
          </div>
          <div>
            <dt>{locale === 'de' ? 'In Arbeit' : 'In progress'}</dt>
            <dd>{panel.overview.inProgress}</dd>
          </div>
          <div>
            <dt>{locale === 'de' ? 'Abgeschlossen' : 'Completed'}</dt>
            <dd>{panel.overview.completedThisPeriod}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
