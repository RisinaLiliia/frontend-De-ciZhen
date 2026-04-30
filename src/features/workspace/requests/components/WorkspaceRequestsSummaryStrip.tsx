'use client';

import type { MyRequestsSummaryItem } from '@/features/workspace/requests/myRequestsView.model';
import type { Locale } from '@/lib/i18n/t';

type SummaryVariant = 'private' | 'market';

type WorkspaceRequestsSummaryStripProps = {
  locale: Locale;
  items: MyRequestsSummaryItem[];
  onSelect: (nextState: string) => void;
  variant?: SummaryVariant;
};

function buildHelperText(locale: Locale, key: MyRequestsSummaryItem['key'], variant: SummaryVariant) {
  if (variant === 'market') {
    if (locale === 'de') {
      if (key === 'all') return 'Gesamter Markt';
      if (key === 'attention') return 'Aktuelle Nachfrage';
      if (key === 'execution') return 'Bereits vergeben';
      if (key === 'completed') return 'Erledigte Aufträge';
      return 'Zur Marktprüfung';
    }

    if (key === 'all') return 'Full market';
    if (key === 'attention') return 'Current demand';
    if (key === 'execution') return 'Already assigned';
    if (key === 'completed') return 'Completed jobs';
    return 'For market review';
  }

  if (locale === 'de') {
    if (key === 'all') return 'Gesamter Überblick';
    if (key === 'attention') return 'Wartet auf Aktion';
    if (key === 'execution') return 'Vertrag läuft';
    if (key === 'completed') return 'Erledigt';
    return 'Zur Prüfung';
  }

  if (key === 'all') return 'Full overview';
  if (key === 'attention') return 'Needs action';
  if (key === 'execution') return 'Work in progress';
  if (key === 'completed') return 'Done';
  return 'Pending review';
}

export function WorkspaceRequestsSummaryStrip({
  locale,
  items,
  onSelect,
  variant = 'private',
}: WorkspaceRequestsSummaryStripProps) {
  return (
    <div className="my-requests-summary">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={[
            'my-requests-summary__card',
            `is-${item.key}`,
            item.isHighlighted ? 'is-active' : '',
          ].filter(Boolean).join(' ')}
          onClick={() => onSelect(item.key)}
          aria-pressed={item.isHighlighted}
        >
          <span className="my-requests-summary__label">{item.label}</span>
          <strong className="my-requests-summary__value">{item.value}</strong>
          <span className="my-requests-summary__helper">
            {buildHelperText(locale, item.key, variant)}
          </span>
          <span className="my-requests-summary__accent" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export function WorkspaceRequestsSummaryStripSkeleton() {
  return (
    <div className="my-requests-summary">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={`summary-skeleton-${index}`} className="my-requests-summary__card">
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-7 w-12" />
        </div>
      ))}
    </div>
  );
}
