'use client';

import type { Locale } from '@/lib/i18n/t';

type DecisionModeBarProps = {
  locale: Locale;
  completedInSession: number;
  remainingCount: number;
  onExit: () => void;
};

export function DecisionModeBar({
  locale,
  completedInSession,
  remainingCount,
  onExit,
}: DecisionModeBarProps) {
  const totalCount = completedInSession + remainingCount;
  const hasCompletedAll = totalCount > 0 && remainingCount === 0;

  return (
    <section className="panel my-decision-mode">
      <div className="my-decision-mode__copy">
        <span className="my-decision-mode__eyebrow">
          {locale === 'de' ? 'Decision Mode' : 'Decision mode'}
        </span>
        <strong className="my-decision-mode__title">
          {hasCompletedAll
            ? (locale === 'de' ? 'Alle offenen Entscheidungen erledigt' : 'All open decisions completed')
            : (locale === 'de' ? 'Bearbeite offene Vorgänge' : 'Handle open workflows')}
        </strong>
        <span className="my-decision-mode__progress">
          {totalCount > 0
            ? (locale === 'de'
              ? `${completedInSession} von ${totalCount} erledigt`
              : `${completedInSession} of ${totalCount} completed`)
            : (locale === 'de'
              ? 'Keine offenen Entscheidungen'
              : 'No open decisions')}
        </span>
      </div>
      <button type="button" className="btn-secondary my-decision-mode__exit" onClick={onExit}>
        {locale === 'de' ? 'Modus beenden' : 'Exit mode'}
      </button>
    </section>
  );
}
