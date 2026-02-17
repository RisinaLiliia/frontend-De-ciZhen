import Link from 'next/link';
import * as React from 'react';

type WorkspaceContentStateProps = {
  isLoading: boolean;
  isEmpty: boolean;
  emptyTitle: string;
  emptyHint: string;
  emptyCtaLabel?: string;
  emptyCtaHref?: string;
  skeletonCount?: number;
  children: React.ReactNode;
};

function WorkspaceListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="stack-sm" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <article key={`workspace-skeleton-${index}`} className="card stack-xs workspace-list-item">
          <div className="flex items-center justify-between gap-3">
            <div className="skeleton is-wide h-5 w-52 rounded-md" />
            <div className="skeleton is-wide h-6 w-24 rounded-full" />
          </div>
          <div className="skeleton is-wide h-4 w-40 rounded-md" />
          <div className="flex gap-2">
            <div className="skeleton is-wide h-9 w-24 rounded-md" />
            <div className="skeleton is-wide h-9 w-24 rounded-md" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function WorkspaceContentState({
  isLoading,
  isEmpty,
  emptyTitle,
  emptyHint,
  emptyCtaLabel,
  emptyCtaHref,
  skeletonCount = 3,
  children,
}: WorkspaceContentStateProps) {
  if (isLoading) {
    return <WorkspaceListSkeleton count={skeletonCount} />;
  }

  if (isEmpty) {
    return (
      <article className="card stack-xs workspace-empty" role="status" aria-live="polite">
        <p className="text-sm font-semibold">{emptyTitle}</p>
        <p className="typo-small">{emptyHint}</p>
        {emptyCtaLabel && emptyCtaHref ? (
          <Link href={emptyCtaHref} className="btn-primary requests-primary-cta">
            {emptyCtaLabel}
          </Link>
        ) : null}
      </article>
    );
  }

  return <>{children}</>;
}
