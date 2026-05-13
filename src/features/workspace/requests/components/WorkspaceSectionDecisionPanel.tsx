'use client';

import Link from 'next/link';

import type { Locale } from '@/lib/i18n/t';

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
  if (locale === 'de') {
    if (level === 'high') return 'Hoch';
    if (level === 'medium') return 'Mittel';
    return 'Niedrig';
  }

  if (level === 'high') return 'High';
  if (level === 'medium') return 'Medium';
  return 'Low';
}

export function WorkspaceSectionDecisionPanel({
  locale,
  panel,
}: Props) {
  return (
    <div className="my-decision-panel">
      <section className="panel my-decision-panel__summary">
        <span className="my-decision-panel__eyebrow">{panel.eyebrow}</span>
        <strong className="my-decision-panel__count">{panel.totalNeedsAction}</strong>
        <h3 className="my-decision-panel__title">{panel.title}</h3>
        <p className="my-decision-panel__text">{panel.text}</p>
        <Link
          href={panel.primaryAction.href}
          className="auth-social__btn auth-social__btn--google workspace-ai-card__action my-decision-panel__primary"
        >
          {panel.primaryAction.label}
        </Link>
      </section>

      <section className="panel my-decision-panel__queue">
        <div className="my-decision-panel__section-head">
          <span className="my-decision-panel__eyebrow">{panel.queueTitle}</span>
        </div>
        {panel.queue.length > 0 ? (
          <ul className="my-decision-panel__queue-list">
            {panel.queue.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="my-decision-panel__queue-item">
                  <span className="my-decision-panel__queue-copy">
                    <strong>{item.title}</strong>
                    <span>{item.actionLabel}</span>
                    {item.actionReason ? <span>{item.actionReason}</span> : null}
                  </span>
                  <span className={`my-decision-panel__priority is-${item.actionPriorityLevel}`}>
                    {priorityLabel(locale, item.actionPriorityLevel)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="my-decision-panel__empty">{panel.emptyText}</p>
        )}
      </section>

      <section className="panel my-decision-panel__overview">
        <span className="my-decision-panel__eyebrow">{panel.overviewEyebrow}</span>
        <dl className="my-decision-panel__overview-grid">
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
