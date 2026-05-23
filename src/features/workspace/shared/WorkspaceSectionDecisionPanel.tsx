'use client';

import Link from 'next/link';

import { I18N_KEYS } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';

type DecisionQueueItem = {
  id: string;
  title: string;
  actionLabel: string;
  actionPriorityLevel: 'high' | 'medium' | 'low';
  actionReason?: string | null;
  href: string;
};

type DecisionOverviewItem = {
  key: string;
  label: string;
  value: string | number;
};

type Props = {
  locale: Locale;
  activeItemId?: string | null;
  panel: {
    eyebrow: string;
    totalNeedsAction: number;
    title: string;
    text: string;
    primaryAction: {
      label: string;
      href: string;
    };
    queueTitle: string;
    queue: DecisionQueueItem[];
    emptyText: string;
    overviewEyebrow: string;
    overview: DecisionOverviewItem[];
  };
};

function priorityLabel(locale: Locale, level: 'high' | 'medium' | 'low') {
  const t = (i18nKey: string) => translate(i18nKey as never, locale);
  if (level === 'high') return t(I18N_KEYS.requestsPage.decisionPanelPriorityHigh);
  if (level === 'medium') return t(I18N_KEYS.requestsPage.decisionPanelPriorityMedium);
  return t(I18N_KEYS.requestsPage.decisionPanelPriorityLow);
}

export function WorkspaceSectionDecisionPanel({
  locale,
  activeItemId = null,
  panel,
}: Props) {
  return (
    <div className="workspace-decision-panel">
      <section className="app-rail-panel workspace-decision-panel__summary">
        <span className="workspace-decision-panel__eyebrow">{panel.eyebrow}</span>
        <strong className="workspace-decision-panel__count">{panel.totalNeedsAction}</strong>
        <h3 className="workspace-decision-panel__title">{panel.title}</h3>
        <p className="workspace-decision-panel__text">{panel.text}</p>
        <Link
          href={panel.primaryAction.href}
          className="app-button-primary workspace-ai-card__action workspace-decision-panel__primary"
        >
          {panel.primaryAction.label}
        </Link>
      </section>

      <section className="app-rail-panel workspace-decision-panel__queue">
        <div className="workspace-decision-panel__section-head">
          <span className="workspace-decision-panel__eyebrow">{panel.queueTitle}</span>
        </div>
        {panel.queue.length > 0 ? (
          <ul className="workspace-decision-panel__queue-list">
            {panel.queue.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={item.id === activeItemId ? 'true' : undefined}
                  className={[
                    'workspace-decision-panel__queue-item',
                    item.id === activeItemId ? 'is-active' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <span className="workspace-decision-panel__queue-copy">
                    <strong>{item.title}</strong>
                    <span>{item.actionLabel}</span>
                    {item.actionReason ? <span>{item.actionReason}</span> : null}
                  </span>
                  <span className={`workspace-decision-panel__priority is-${item.actionPriorityLevel}`}>
                    {priorityLabel(locale, item.actionPriorityLevel)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="workspace-decision-panel__empty">{panel.emptyText}</p>
        )}
      </section>

      <section className="app-rail-panel workspace-decision-panel__overview">
        <span className="workspace-decision-panel__eyebrow">{panel.overviewEyebrow}</span>
        <dl className="workspace-decision-panel__overview-grid">
          {panel.overview.map((item) => (
            <div key={item.key}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
