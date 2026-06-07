'use client';

import { WorkspaceRequestsSectionSummary } from '@/features/workspace/requests/components/WorkspaceRequestsSectionSummary';
import { RequestsPrivateActionRail } from '@/features/workspace/requests/RequestsPrivateView';
import type { WorkQueueMode } from '@/features/workspace/requests/requestsDecision.model';
import type { WorkspaceRequestsSummaryItem, WorkspaceRequestsViewVariant } from '@/features/workspace/requests/workspaceRequestsView.model';
import type { WorkspaceRequestsDecisionPanelDto } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';

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

export function WorkspaceRequestsAside({
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
  if (!summaryItems && !isSummaryLoading && !panel) {
    return null;
  }

  return (
    <div className="stack-md">
      <WorkspaceRequestsSectionSummary
        locale={locale}
        items={summaryItems}
        variant={variant}
        isLoading={isSummaryLoading}
        className="my-requests-summary--rail"
      />
      {panel ? (
        <RequestsPrivateActionRail
          locale={locale}
          panel={panel}
          mode={mode}
          activeRequestId={activeRequestId}
          onStartDecisionMode={onStartDecisionMode}
          onOpenQueueItem={onOpenQueueItem}
          variant={variant}
        />
      ) : null}
    </div>
  );
}
