'use client';

import type { MyRequestsSummaryItem } from '@/features/workspace/requests/myRequestsView.model';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';

type SummaryVariant = 'private' | 'market';

export type WorkspaceRequestsSummaryStripProps = {
  locale: Locale;
  items: MyRequestsSummaryItem[];
  onSelect: (nextState: string) => void;
  variant?: SummaryVariant;
  className?: string;
};

function buildHelperText(locale: Locale, key: MyRequestsSummaryItem['key'], variant: SummaryVariant) {
  const t = (i18nKey: string) => translate(i18nKey as never, locale);
  if (variant === 'market') {
    if (key === 'all') return t(I18N_KEYS.workspace.summaryStripMarketAllHelper);
    if (key === 'attention') return t(I18N_KEYS.workspace.summaryStripMarketAttentionHelper);
    if (key === 'execution') return t(I18N_KEYS.workspace.summaryStripMarketExecutionHelper);
    if (key === 'completed') return t(I18N_KEYS.workspace.summaryStripMarketCompletedHelper);
    return t(I18N_KEYS.workspace.summaryStripMarketFallbackHelper);
  }

  if (key === 'all') return t(I18N_KEYS.workspace.summaryStripPrivateAllHelper);
  if (key === 'attention') return t(I18N_KEYS.workspace.summaryStripPrivateAttentionHelper);
  if (key === 'execution') return t(I18N_KEYS.workspace.summaryStripPrivateExecutionHelper);
  if (key === 'completed') return t(I18N_KEYS.workspace.summaryStripPrivateCompletedHelper);
  return t(I18N_KEYS.workspace.summaryStripPrivateFallbackHelper);
}

export function WorkspaceRequestsSummaryStrip({
  locale,
  items,
  onSelect,
  variant = 'private',
  className,
}: WorkspaceRequestsSummaryStripProps) {
  return (
    <div className={['workspace-summary-grid', className ?? ''].filter(Boolean).join(' ')}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={[
            'workspace-summary-grid__card',
            `is-${item.key}`,
            item.isHighlighted ? 'is-active' : '',
          ].filter(Boolean).join(' ')}
          onClick={() => onSelect(item.key)}
          aria-pressed={item.isHighlighted}
        >
          <span className="workspace-summary-grid__label">{item.label}</span>
          <strong className="workspace-summary-grid__value">{item.value}</strong>
          <span className="workspace-summary-grid__helper">
            {buildHelperText(locale, item.key, variant)}
          </span>
          <span className="workspace-summary-grid__accent" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export function WorkspaceRequestsSummaryStripSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={['workspace-summary-grid', className ?? ''].filter(Boolean).join(' ')}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={`summary-skeleton-${index}`} className="workspace-summary-grid__card">
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-7 w-12" />
        </div>
      ))}
    </div>
  );
}
