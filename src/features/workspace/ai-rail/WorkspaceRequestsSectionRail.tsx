'use client';

import type { WorkQueueMode } from '@/features/workspace/requests/requestsDecision.model';
import type { WorkspaceRequestsSummaryItem, WorkspaceRequestsViewVariant } from '@/features/workspace/requests/workspaceRequestsView.model';
import type { WorkspaceRequestsDecisionPanelDto } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';
import { WorkspaceRightRailStack, useMediaMatch } from '@/features/workspace/shared';
import { WorkspaceRequestsActionRail } from './WorkspaceRequestsActionRail';
import { WorkspaceRequestsSectionSummary } from './WorkspaceRequestsSectionSummary';

type Props = {
  locale: Locale;
  variant: WorkspaceRequestsViewVariant;
  summaryItems?: WorkspaceRequestsSummaryItem[] | null;
  isSummaryLoading?: boolean;
  panel?: WorkspaceRequestsDecisionPanelDto | null;
  mode?: WorkQueueMode;
  activeRequestId?: string | null;
  onStartDecisionMode: () => void;
  onOpenQueueItem: (requestId: string) => void;
};

export function WorkspaceRequestsSectionRail({
  locale,
  variant,
  summaryItems,
  isSummaryLoading = false,
  panel = null,
  mode = 'default',
  activeRequestId = null,
  onStartDecisionMode,
  onOpenQueueItem,
}: Props) {
  const isMobileOrTablet = useMediaMatch('(max-width: 1023px)');

  if (isMobileOrTablet) {
    return null;
  }

  if (!summaryItems && !isSummaryLoading && !panel) {
    return null;
  }

  return (
    <WorkspaceRightRailStack>
      <WorkspaceRequestsSectionSummary
        locale={locale}
        items={summaryItems}
        variant={variant}
        isLoading={isSummaryLoading}
        className="workspace-summary-grid--rail"
      />
      {panel ? (
        <WorkspaceRequestsActionRail
          locale={locale}
          panel={panel}
          mode={mode}
          activeRequestId={activeRequestId}
          onStartDecisionMode={onStartDecisionMode}
          onOpenQueueItem={onOpenQueueItem}
          variant={variant}
        />
      ) : null}
    </WorkspaceRightRailStack>
  );
}
