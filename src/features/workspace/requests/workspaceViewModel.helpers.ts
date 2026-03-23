'use client';

import { buildRequestsListProps } from '@/components/requests/requestsListProps';
import type { RequestsListProps } from '@/components/requests/requestsList.types';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { OwnerRequestActions } from './workspaceViewModel.types';
import type { WorkspaceListContext } from './workspaceViewModel.shared';

type WorkspacePagerArgs = {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
};

export function buildWorkspaceState(isLoading: boolean, isEmpty: boolean) {
  return {
    isLoading,
    isEmpty,
  };
}

export function buildWorkspacePager({ page, totalPages, setPage }: WorkspacePagerArgs) {
  return {
    onPrevPage: () => setPage(Math.max(1, page - 1)),
    onNextPage: () => setPage(Math.min(totalPages, page + 1)),
  };
}

export function buildWorkspaceOwnerRequestsListProps(
  context: WorkspaceListContext,
  params: {
    requests: RequestResponseDto[];
    isLoading: boolean;
    ownerRequestActions: OwnerRequestActions;
  },
): RequestsListProps {
  return buildRequestsListProps({
    t: context.t,
    locale: context.locale,
    requests: params.requests,
    isLoading: params.isLoading,
    serviceByKey: context.serviceByKey,
    categoryByKey: context.categoryByKey,
    cityById: context.cityById,
    formatDate: context.formatDate,
    formatPrice: context.formatPrice,
    ownerRequestActions: params.ownerRequestActions,
  });
}

export function buildWorkspaceOfferRequestsListProps(
  context: WorkspaceListContext,
  params: {
    requests: RequestResponseDto[];
    isLoading: boolean;
    offersByRequest?: Map<string, OfferDto>;
  },
): RequestsListProps {
  return buildRequestsListProps({
    t: context.t,
    locale: context.locale,
    requests: params.requests,
    isLoading: params.isLoading,
    serviceByKey: context.serviceByKey,
    categoryByKey: context.categoryByKey,
    cityById: context.cityById,
    formatDate: context.formatDate,
    formatPrice: context.formatPrice,
    enableOfferActions: true,
    hideRecurringBadge: true,
    showFavoriteButton: false,
    offersByRequest: params.offersByRequest ?? context.offersByRequest,
    onSendOffer: context.onOpenOfferSheet,
    onEditOffer: context.onOpenOfferSheet,
    onWithdrawOffer: context.onWithdrawOffer,
    onOpenChatThread: context.onOpenChatThread,
    pendingOfferRequestId: context.pendingOfferRequestId,
  });
}

export function buildWorkspaceFavoriteRequestsListProps(
  context: WorkspaceListContext,
  params: {
    requests: RequestResponseDto[];
    isLoading: boolean;
  },
): RequestsListProps {
  return buildRequestsListProps({
    t: context.t,
    locale: context.locale,
    requests: params.requests,
    isLoading: params.isLoading,
    serviceByKey: context.serviceByKey,
    categoryByKey: context.categoryByKey,
    cityById: context.cityById,
    formatDate: context.formatDate,
    formatPrice: context.formatPrice,
    enableOfferActions: true,
    hideRecurringBadge: context.isPersonalized,
    showFavoriteButton: true,
    offersByRequest: context.offersByRequest,
    favoriteRequestIds: context.favoriteRequestIds,
    onToggleFavorite: context.onToggleRequestFavorite,
    onSendOffer: context.onOpenOfferSheet,
    onEditOffer: context.onOpenOfferSheet,
    onWithdrawOffer: context.onWithdrawOffer,
    onOpenChatThread: context.onOpenChatThread,
    pendingOfferRequestId: context.pendingOfferRequestId,
    pendingFavoriteRequestIds: context.pendingFavoriteRequestIds,
  });
}

export function buildWorkspacePublicRequestsListProps(
  context: WorkspaceListContext,
  params: {
    requests: RequestResponseDto[];
    isLoading: boolean;
    isError: boolean;
  },
): RequestsListProps {
  return buildRequestsListProps({
    t: context.t,
    locale: context.locale,
    requests: params.requests,
    isLoading: params.isLoading,
    isError: params.isError,
    serviceByKey: context.serviceByKey,
    categoryByKey: context.categoryByKey,
    cityById: context.cityById,
    formatDate: context.formatDate,
    formatPrice: context.formatPrice,
    enableOfferActions: true,
    hideRecurringBadge: context.isPersonalized,
    showFavoriteButton: true,
    offersByRequest: context.offersByRequest,
    favoriteRequestIds: context.favoriteRequestIds,
    onToggleFavorite: context.onToggleRequestFavorite,
    onSendOffer: context.onOpenOfferSheet,
    onEditOffer: context.onOpenOfferSheet,
    onWithdrawOffer: context.onWithdrawOffer,
    onOpenChatThread: context.onOpenChatThread,
    pendingOfferRequestId: context.pendingOfferRequestId,
    pendingFavoriteRequestIds: context.pendingFavoriteRequestIds,
  });
}
