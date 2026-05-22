'use client';

type WorkspaceSummaryGridItem = {
  key: string;
  label: string;
  value: string | number;
  helper: string;
  tone?: 'all' | 'attention' | 'execution' | 'completed';
  isHighlighted?: boolean;
};

type Props = {
  items?: WorkspaceSummaryGridItem[] | null;
  isLoading?: boolean;
  className?: string;
  onSelect?: (key: string) => void;
};

export function WorkspaceSummaryGrid({
  items,
  isLoading = false,
  className,
  onSelect,
}: Props) {
  if (isLoading && (!items || items.length === 0)) {
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

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={['workspace-summary-grid', className ?? ''].filter(Boolean).join(' ')}>
      {items.map((item, index) => {
        const isHighlighted = item.isHighlighted ?? index === 0;
        return (
          <button
            key={item.key}
            type="button"
            className={[
              'workspace-summary-grid__card',
              `is-${item.tone ?? 'all'}`,
              isHighlighted ? 'is-active' : '',
            ].filter(Boolean).join(' ')}
            aria-pressed={isHighlighted}
            onClick={() => onSelect?.(item.key)}
          >
            <span className="workspace-summary-grid__label">{item.label}</span>
            <strong className="workspace-summary-grid__value">{item.value}</strong>
            <span className="workspace-summary-grid__helper">{item.helper}</span>
            <span className="workspace-summary-grid__accent" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
