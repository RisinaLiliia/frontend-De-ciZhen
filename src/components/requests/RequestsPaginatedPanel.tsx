'use client';

import * as React from 'react';

import { RequestsBottomPagination } from '@/components/requests/RequestsBottomPagination';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import type { I18nKey } from '@/lib/i18n/keys';
import type { RequestsListDensity } from '@/lib/requests/pagination';

type RequestsPaginatedPanelProps = {
  t: (key: I18nKey) => string;
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  listAriaLabel: string;
  listId?: string;
  listDensity?: RequestsListDensity;
  topSlot?: React.ReactNode;
  secondarySlot?: React.ReactNode;
  surface?: 'panel' | 'bare';
  panelClassName?: string;
  listClassName?: string;
  isLoading: boolean;
  isError?: boolean;
  isEmpty: boolean;
  emptyTitle: string;
  emptyHint: string;
  errorTitle?: string;
  errorHint?: string;
  emptyCtaLabel?: string;
  emptyCtaHref?: string;
  children: React.ReactNode;
};

export function RequestsPaginatedPanel({
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
}: RequestsPaginatedPanelProps) {
  const densityClassName = listDensity === 'double' ? 'is-double' : 'is-single';
  const resolvedPanelClassName = `${surface === 'panel' ? 'panel ' : ''}requests-panel ${panelClassName ?? ''}`.trim();
  const resolvedListClassName = `requests-list requests-list--stable ${densityClassName} ${listClassName ?? ''}`.trim();

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
