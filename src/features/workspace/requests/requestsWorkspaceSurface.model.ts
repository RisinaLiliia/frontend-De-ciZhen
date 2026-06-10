import type { ComponentProps } from 'react';

import { WorkspaceRequestsActionRail } from '@/features/workspace/ai-rail/WorkspaceRequestsActionRail';
import type { MyRequestsSummaryItem } from '@/features/workspace/requests/myRequestsView.model';
import type {
  WorkspaceRequestsDecisionPanelDto,
  WorkspaceRequestsSidePanelDto,
} from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';

export type RequestsWorkspaceSurfaceVariant = 'private' | 'market';

export function buildRequestsWorkspaceDecisionRailProps(params: {
  locale: Locale;
  summaryItems?: MyRequestsSummaryItem[] | null;
  panel: WorkspaceRequestsDecisionPanelDto;
  sidePanel?: WorkspaceRequestsSidePanelDto | null;
  mode: ComponentProps<typeof WorkspaceRequestsActionRail>['mode'];
  activeRequestId: string | null;
  onStartDecisionMode: () => void;
  onOpenQueueItem: (requestId: string) => void;
  className?: string;
  variant?: RequestsWorkspaceSurfaceVariant;
}): ComponentProps<typeof WorkspaceRequestsActionRail> {
  return {
    locale: params.locale,
    summaryItems: params.summaryItems,
    panel: params.panel,
    sidePanel: params.sidePanel,
    mode: params.mode,
    activeRequestId: params.activeRequestId,
    onStartDecisionMode: params.onStartDecisionMode,
    onOpenQueueItem: params.onOpenQueueItem,
    className: params.className,
    variant: params.variant ?? 'private',
  };
}
