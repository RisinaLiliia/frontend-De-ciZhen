'use client';

import * as React from 'react';

import { WorkspaceSectionDecisionPanel } from '@/features/workspace/requests/components/WorkspaceSectionDecisionPanel';
import { WorkspaceSummaryGrid } from '@/features/workspace/requests/components/WorkspaceSummaryGrid';
import type { Locale } from '@/lib/i18n/t';

type SummaryItem = {
  key: string;
  label: string;
  value: string | number;
  helper: string;
  tone?: 'all' | 'attention' | 'execution' | 'completed';
};

type DecisionPanel = React.ComponentProps<typeof WorkspaceSectionDecisionPanel>['panel'];

type Props = {
  locale: Locale;
  summaryItems?: SummaryItem[] | null;
  isLoading?: boolean;
  panel?: DecisionPanel | null;
  children?: React.ReactNode;
  className?: string;
  hideBelowDesktop?: boolean;
};

export function WorkspaceSectionAside({
  locale,
  summaryItems,
  isLoading = false,
  panel = null,
  children,
  className,
  hideBelowDesktop = true,
}: Props) {
  if (!summaryItems && !isLoading && !panel && !children) {
    return null;
  }

  return (
    <aside className={['stack-md', hideBelowDesktop ? 'hide-below-desktop' : '', className ?? ''].filter(Boolean).join(' ')}>
      <WorkspaceSummaryGrid
        items={summaryItems}
        isLoading={isLoading}
        className="my-requests-summary--rail"
      />
      {panel ? <WorkspaceSectionDecisionPanel locale={locale} panel={panel} /> : null}
      {children}
    </aside>
  );
}
