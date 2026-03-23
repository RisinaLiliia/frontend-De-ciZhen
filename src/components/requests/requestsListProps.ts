'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { OwnerRequestActions, RequestsListProps } from './requestsList.types';

type BuildRequestsListPropsArgs = {
  t: (key: I18nKey) => string;
  locale: Locale;
  serviceByKey: Map<string, { categoryKey: string; i18n: Record<string, string> }>;
  categoryByKey: Map<string, { i18n: Record<string, string> }>;
  cityById: Map<string, { i18n: Record<string, string> }>;
  formatDate: Intl.DateTimeFormat;
  formatPrice: Intl.NumberFormat;
  requests: RequestResponseDto[];
  isLoading: boolean;
  isError?: boolean;
  enableOfferActions?: boolean;
  showFavoriteButton?: boolean;
  hideRecurringBadge?: boolean;
  offersByRequest?: Map<string, OfferDto>;
  favoriteRequestIds?: Set<string>;
  onToggleFavorite?: (requestId: string) => void;
  onSendOffer?: (requestId: string) => void;
  onEditOffer?: (requestId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
  onOpenChatThread?: (offer: OfferDto) => void;
  pendingOfferRequestId?: string | null;
  pendingFavoriteRequestIds?: Set<string>;
  ownerRequestActions?: OwnerRequestActions;
};

export function buildRequestsListProps({
  t,
  locale,
  requests,
  isLoading,
  isError = false,
  serviceByKey,
  categoryByKey,
  cityById,
  formatDate,
  formatPrice,
  enableOfferActions = false,
  showFavoriteButton = false,
  hideRecurringBadge = false,
  offersByRequest,
  favoriteRequestIds,
  onToggleFavorite,
  onSendOffer,
  onEditOffer,
  onWithdrawOffer,
  onOpenChatThread,
  pendingOfferRequestId,
  pendingFavoriteRequestIds,
  ownerRequestActions,
}: BuildRequestsListPropsArgs): RequestsListProps {
  return {
    t,
    locale,
    requests,
    isLoading,
    isError,
    serviceByKey,
    categoryByKey,
    cityById,
    formatDate,
    formatPrice,
    enableOfferActions,
    showFavoriteButton,
    hideRecurringBadge,
    offersByRequest,
    favoriteRequestIds,
    onToggleFavorite,
    onSendOffer,
    onEditOffer,
    onWithdrawOffer,
    onOpenChatThread,
    pendingOfferRequestId,
    pendingFavoriteRequestIds,
    ownerRequestActions,
  };
}
