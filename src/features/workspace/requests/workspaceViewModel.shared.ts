'use client';

import type { BaseInput } from './workspaceViewModel.types';

export type WorkspaceListContext = Pick<
  BaseInput,
  | 't'
  | 'locale'
  | 'isPersonalized'
  | 'offersByRequest'
  | 'favoriteRequestIds'
  | 'onToggleRequestFavorite'
  | 'onOpenOfferSheet'
  | 'onWithdrawOffer'
  | 'onOpenChatThread'
  | 'pendingOfferRequestId'
  | 'pendingFavoriteRequestIds'
  | 'serviceByKey'
  | 'categoryByKey'
  | 'cityById'
  | 'formatDate'
  | 'formatPrice'
>;

export function buildWorkspaceListContext(params: WorkspaceListContext): WorkspaceListContext {
  return {
    t: params.t,
    locale: params.locale,
    isPersonalized: params.isPersonalized,
    offersByRequest: params.offersByRequest,
    favoriteRequestIds: params.favoriteRequestIds,
    onToggleRequestFavorite: params.onToggleRequestFavorite,
    onOpenOfferSheet: params.onOpenOfferSheet,
    onWithdrawOffer: params.onWithdrawOffer,
    onOpenChatThread: params.onOpenChatThread,
    pendingOfferRequestId: params.pendingOfferRequestId,
    pendingFavoriteRequestIds: params.pendingFavoriteRequestIds,
    serviceByKey: params.serviceByKey,
    categoryByKey: params.categoryByKey,
    cityById: params.cityById,
    formatDate: params.formatDate,
    formatPrice: params.formatPrice,
  };
}
