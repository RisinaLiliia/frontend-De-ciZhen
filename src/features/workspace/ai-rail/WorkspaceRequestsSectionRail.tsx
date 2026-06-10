'use client';

import type { WorkQueueMode } from '@/features/workspace/requests/requestsDecision.model';
import type {
  WorkspaceRequestsSummaryItem,
  WorkspaceRequestsViewVariant,
} from '@/features/workspace/requests/workspaceRequestsView.model';
import type {
  WorkspaceRequestsDecisionPanelDto,
  WorkspaceRequestsSidePanelDto,
} from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';
import {
  WorkspaceRightRailStack,
  WorkspaceUnifiedRail,
  useMediaMatch,
} from '@/features/workspace/shared';
import { WorkspaceRequestsActionRail } from './WorkspaceRequestsActionRail';

type Props = {
  locale: Locale;
  variant: WorkspaceRequestsViewVariant;
  summaryItems?: WorkspaceRequestsSummaryItem[] | null;
  isSummaryLoading?: boolean;
  panel?: WorkspaceRequestsDecisionPanelDto | null;
  sidePanel?: WorkspaceRequestsSidePanelDto | null;
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
  sidePanel = null,
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
      {panel ? (
        <WorkspaceRequestsActionRail
          locale={locale}
          summaryItems={summaryItems}
          panel={panel}
          sidePanel={sidePanel}
          mode={mode}
          activeRequestId={activeRequestId}
          onStartDecisionMode={onStartDecisionMode}
          onOpenQueueItem={onOpenQueueItem}
          variant={variant}
        />
      ) : isSummaryLoading ? (
        <WorkspaceUnifiedRail isLoading />
      ) : null}
    </WorkspaceRightRailStack>
  );
}
