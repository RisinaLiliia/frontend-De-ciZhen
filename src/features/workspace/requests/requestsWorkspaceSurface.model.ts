'use client';

import type { ComponentProps } from 'react';

import type { MyRequestsSummaryItem } from '@/features/workspace/requests/myRequestsView.model';
import { RequestsPrivateActionRail } from '@/features/workspace/requests/RequestsPrivateView';
import { WorkspaceRequestsSummaryStrip } from '@/features/workspace/requests/components/WorkspaceRequestsSummaryStrip';
import type { WorkspaceRequestsDecisionPanelDto } from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';

export type RequestsWorkspaceSurfaceVariant = 'private' | 'market';

export function buildRequestsWorkspaceSummaryStripProps(params: {
  locale: Locale;
  items: MyRequestsSummaryItem[];
  onSelect: (key: string) => void;
  variant?: RequestsWorkspaceSurfaceVariant;
}): ComponentProps<typeof WorkspaceRequestsSummaryStrip> {
  return {
    locale: params.locale,
    items: params.items,
    onSelect: params.onSelect,
    variant: params.variant ?? 'private',
  };
}

export function buildRequestsWorkspaceDecisionRailProps(params: {
  locale: Locale;
  panel: WorkspaceRequestsDecisionPanelDto;
  mode: ComponentProps<typeof RequestsPrivateActionRail>['mode'];
  activeRequestId: string | null;
  onStartDecisionMode: () => void;
  onOpenQueueItem: (requestId: string) => void;
  className?: string;
  variant?: RequestsWorkspaceSurfaceVariant;
}): ComponentProps<typeof RequestsPrivateActionRail> {
  return {
    locale: params.locale,
    panel: params.panel,
    mode: params.mode,
    activeRequestId: params.activeRequestId,
    onStartDecisionMode: params.onStartDecisionMode,
    onOpenQueueItem: params.onOpenQueueItem,
    className: params.className,
    variant: params.variant ?? 'private',
  };
}
