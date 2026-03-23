'use client';

import type { OfferCardState } from '@/features/requests/uiState';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { I18nKey } from '@/lib/i18n/keys';
import type { OwnerRequestActions } from './requestsList.types';

export type RequestListStatusPresentation = {
  detailsHref: string;
  itemId: string;
  itemStatus: string | undefined;
  itemOffer: OfferDto | undefined;
  offerCardState: OfferCardState;
  statusLabel: string | null;
  badgeStatus: Exclude<OfferCardState, 'none'> | null;
  ownerStatusLabel: string;
  isOwnerRequestList: boolean;
  isPendingWithdraw: boolean;
  isPendingOwnerDelete: boolean;
};

export type RequestListStatusActions = {
  t: (key: I18nKey) => string;
  ownerRequestActions?: OwnerRequestActions;
  onSendOffer?: (requestId: string) => void;
  onEditOffer?: (requestId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
  onOpenChatThread?: (offer: OfferDto) => void;
};
