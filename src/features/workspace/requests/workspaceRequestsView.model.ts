'use client';

import type { OwnerRequestActions, RequestsListProps } from '@/components/requests/requestsList.types';
import type { WorkspaceChatConversationInput } from '@/features/workspace/private/workspaceActions.model';
import type { ActiveDecisionState } from '@/features/workspace/requests/requestsDecision.model';
import type { RequestDialogIntent } from '@/features/workspace/requests/useWorkspaceRequestOverlayFlow';
import type {
  WorkspaceMyRequestCardDto,
  WorkspaceRequestsResponseDto,
} from '@/lib/api/dto/workspace';
import type { Locale } from '@/lib/i18n/t';
import type { RequestsListDensity } from '@/lib/requests/pagination';

export type WorkspaceRequestsViewCard = WorkspaceMyRequestCardDto;
export type WorkspaceRequestsSummaryItem = NonNullable<WorkspaceRequestsResponseDto['summary']>['items'][number];
export type WorkspaceRequestsViewVariant = 'private' | 'market';

export type WorkspaceRequestsViewModel = {
  response: WorkspaceRequestsResponseDto | null;
  cards: WorkspaceRequestsViewCard[];
  emptyMode: 'none' | 'empty' | 'filtered';
};

export type WorkspaceRequestsSurfaceFavoriteState = {
  favoriteRequestIds: ReadonlySet<string>;
  pendingFavoriteRequestIds: ReadonlySet<string>;
  onToggleRequestFavorite: (requestId: string) => void;
};

export type WorkspaceRequestsSurfacePagination = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export type WorkspaceRequestsSurfaceListContext = {
  onSendOffer?: RequestsListProps['onSendOffer'];
  onEditOffer?: RequestsListProps['onEditOffer'];
  onWithdrawOffer?: RequestsListProps['onWithdrawOffer'];
  onOpenChatConversation?: (payload: WorkspaceChatConversationInput) => void;
  pendingOfferRequestId?: string | null;
  ownerRequestActions?: OwnerRequestActions;
  onOpenRequest?: (requestId: string, intent?: RequestDialogIntent) => void;
};

export type WorkspaceRequestsSurfaceModel = {
  variant: WorkspaceRequestsViewVariant;
  locale: Locale;
  isWorkspaceAuthed: boolean;
  guestLoginHref: string;
  listDensity?: RequestsListDensity | null;
  pagination?: WorkspaceRequestsSurfacePagination | null;
  favoriteState?: WorkspaceRequestsSurfaceFavoriteState | null;
  model: WorkspaceRequestsViewModel;
  isLoading: boolean;
  isError: boolean;
  decisionState: ActiveDecisionState;
  decisionQueueIds: string[];
  onEnterDecisionMode: (requestId?: string | null) => void;
  onOpenDecisionItem: (requestId: string) => void;
  onExitDecisionMode: () => void;
  listContext: WorkspaceRequestsSurfaceListContext;
  emptyCtaHref?: string;
  secondaryCtaHref?: string;
};

function resolveEmptyMode(response: WorkspaceRequestsResponseDto | null): WorkspaceRequestsViewModel['emptyMode'] {
  if (!response) return 'none';
  const allCount = response.summary.items.find((item) => item.key === 'all')?.value ?? response.list.total;
  if (allCount === 0) return 'empty';
  return response.list.items.length === 0 ? 'filtered' : 'none';
}

export function buildWorkspaceRequestsViewModelFromResponse(
  response: WorkspaceRequestsResponseDto | null | undefined,
): WorkspaceRequestsViewModel {
  return {
    response: response ?? null,
    cards: response?.list.items ?? [],
    emptyMode: resolveEmptyMode(response ?? null),
  };
}

export function buildWorkspaceRequestsSurfaceModel(
  surface: WorkspaceRequestsSurfaceModel,
): WorkspaceRequestsSurfaceModel {
  return surface;
}
