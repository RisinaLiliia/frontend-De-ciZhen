import * as React from 'react';

import type { WorkspaceRequestsViewCard } from '@/features/workspace/requests/workspaceRequestsView.model';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';

function tx(locale: Locale, key: I18nKey) {
  return translate(key, locale);
}

function fillLocaleTemplate(locale: Locale, key: I18nKey, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [token, value]) => result.replace(`{${token}}`, value),
    tx(locale, key),
  );
}

export function WorkflowProgress({
  locale,
  card,
  steps,
}: {
  locale: Locale;
  card: WorkspaceRequestsViewCard;
  steps: WorkspaceRequestsViewCard['progress']['steps'];
}) {
  const activeIndex = React.useMemo(
    () =>
      Math.max(
        0,
        steps.findIndex((step) => step.status === 'current'),
      ),
    [steps],
  );
  const progressPercent = React.useMemo(() => {
    if (steps.length <= 0) return 0;
    if (steps.every((step) => step.status === 'done')) return 100;
    return Math.round(((activeIndex + 1) / steps.length) * 100);
  }, [activeIndex, steps]);

  const resolveStepMeta = React.useCallback(
    (step: WorkspaceRequestsViewCard['progress']['steps'][number]) => {
      if (step.key === 'request') {
        return (
          card.createdAt?.trim() || tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowCreatedMeta)
        );
      }

      if (step.key === 'offers') {
        if (card.decision.actionType === 'review_offers' && card.decision.actionLabel?.trim()) {
          return card.decision.actionLabel.trim();
        }

        if (step.status === 'done') {
          return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowReceivedMeta);
        }

        if (step.status === 'current') {
          return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowPendingMeta);
        }

        return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowNotStartedMeta);
      }

      if (step.key === 'selection') {
        if (step.status === 'done') {
          return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowSelectedMeta);
        }

        if (step.status === 'current') {
          return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowPendingMeta);
        }

        return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowNotStartedMeta);
      }

      if (step.key === 'contract') {
        if (step.status === 'done') {
          return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowConfirmedMeta);
        }

        if (step.status === 'current') {
          return card.nextEventAt?.trim()
            ? fillLocaleTemplate(locale, I18N_KEYS.requestsPage.workspaceWorkflowActiveWithDate, {
                date: card.nextEventAt,
              })
            : tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowActiveMeta);
        }

        return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowNotCreatedMeta);
      }

      if (card.state === 'completed') {
        return tx(locale, I18N_KEYS.requestsPage.statusCompleted);
      }

      if (card.state === 'active') {
        return tx(locale, I18N_KEYS.requestsPage.statusInProgress);
      }

      return tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowNotStartedMeta);
    },
    [card, locale],
  );

  return (
    <div className="my-request-card__progress-scroll">
      <div className="my-request-card__progress-shell">
        <div
          className="my-request-card__progress"
          role="list"
          aria-label={tx(locale, I18N_KEYS.requestsPage.workspaceWorkflowProgressLabel)}
        >
          {steps.map((step) => (
            <div
              key={step.key}
              className={`my-request-card__progress-step is-${step.status}`.trim()}
              role="listitem"
            >
              <span className="my-request-card__progress-dot" />
              <span className="my-request-card__progress-copy">
                <span className="my-request-card__progress-label">{step.label}</span>
                <span className="my-request-card__progress-meta">{resolveStepMeta(step)}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="my-request-card__progress-rail" aria-hidden="true">
          <span
            className="my-request-card__progress-rail-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
