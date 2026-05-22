'use client';

import * as React from 'react';

import type { Locale } from '@/lib/i18n/t';
import { WorkspaceRightRailStack } from './WorkspaceRightRailStack';
import { WorkspaceSectionDecisionPanel } from './WorkspaceSectionDecisionPanel';
import { WorkspaceSummaryGrid } from './WorkspaceSummaryGrid';

type SummaryItem = {
  key: string;
  label: string;
  value: string | number;
  helper: string;
  tone?: 'all' | 'attention' | 'execution' | 'completed';
  isHighlighted?: boolean;
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
    <WorkspaceRightRailStack
      as="aside"
      className={[
        hideBelowDesktop ? 'hide-below-desktop' : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
    >
      <WorkspaceSummaryGrid
        items={summaryItems}
        isLoading={isLoading}
        className="workspace-summary-grid--rail"
      />
      {panel ? <WorkspaceSectionDecisionPanel locale={locale} panel={panel} /> : null}
      {children}
    </WorkspaceRightRailStack>
  );
}
