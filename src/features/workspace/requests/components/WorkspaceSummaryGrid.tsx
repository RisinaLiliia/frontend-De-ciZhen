'use client';

type WorkspaceSummaryGridItem = {
  key: string;
  label: string;
  value: string | number;
  helper: string;
  tone?: 'all' | 'attention' | 'execution' | 'completed';
};

type Props = {
  items?: WorkspaceSummaryGridItem[] | null;
  isLoading?: boolean;
  className?: string;
};

export function WorkspaceSummaryGrid({
  items,
  isLoading = false,
  className,
}: Props) {
  if (isLoading && (!items || items.length === 0)) {
    return (
      <div className={['my-requests-summary', className ?? ''].filter(Boolean).join(' ')}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`summary-skeleton-${index}`} className="my-requests-summary__card">
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
    <div className={['my-requests-summary', className ?? ''].filter(Boolean).join(' ')}>
      {items.map((item) => (
        <div
          key={item.key}
          className={[
            'my-requests-summary__card',
            `is-${item.tone ?? 'all'}`,
          ].filter(Boolean).join(' ')}
        >
          <span className="my-requests-summary__label">{item.label}</span>
          <strong className="my-requests-summary__value">{item.value}</strong>
          <span className="my-requests-summary__helper">{item.helper}</span>
          <span className="my-requests-summary__accent" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
