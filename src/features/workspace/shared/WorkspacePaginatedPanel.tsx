'use client';

import { RequestsBottomPagination } from '@/components/requests/RequestsBottomPagination';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import type { WorkspacePaginatedPanelProps } from './workspaceListPrimitives.types';

export function WorkspacePaginatedPanel({
  t,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
  listAriaLabel,
  listId,
  listDensity = 'single',
  topSlot,
  secondarySlot,
  surface = 'panel',
  panelClassName,
  listClassName,
  isLoading,
  isError = false,
  isEmpty,
  emptyTitle,
  emptyHint,
  errorTitle,
  errorHint,
  emptyCtaLabel,
  emptyCtaHref,
  children,
  classNamespace = 'workspace',
}: WorkspacePaginatedPanelProps) {
  const densityClassName = listDensity === 'double' ? 'is-double' : 'is-single';
  const basePanelClassName = classNamespace === 'workspace' ? 'workspace-list-panel' : 'requests-panel';
  const baseListClassName = classNamespace === 'workspace' ? 'workspace-list workspace-list--stable' : 'requests-list requests-list--stable';
  const resolvedPanelClassName = `${surface === 'panel' ? 'panel ' : ''}${basePanelClassName} ${panelClassName ?? ''}`.trim();
  const resolvedListClassName = `${baseListClassName} ${densityClassName} ${listClassName ?? ''}`.trim();

  return (
    <section className={resolvedPanelClassName}>
      {topSlot}
      {secondarySlot}

      <section
        id={listId}
        className={resolvedListClassName}
        role="region"
        aria-label={listAriaLabel}
        aria-live="polite"
      >
        <WorkspaceContentState
          isLoading={isLoading}
          isError={isError}
          isEmpty={isEmpty}
          emptyTitle={emptyTitle}
          emptyHint={emptyHint}
          errorTitle={errorTitle}
          errorHint={errorHint}
          emptyCtaLabel={emptyCtaLabel}
          emptyCtaHref={emptyCtaHref}
        >
          {children}
        </WorkspaceContentState>
      </section>

      <RequestsBottomPagination
        t={t}
        page={page}
        totalPages={totalPages}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
      />
    </section>
  );
}
