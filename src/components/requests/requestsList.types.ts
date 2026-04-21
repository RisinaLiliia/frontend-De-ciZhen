'use client';

import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { OfferDto } from '@/lib/api/dto/offers';

export type OwnerRequestActions = {
  onDelete?: (requestId: string) => void;
  onArchive?: (requestId: string) => void;
  onDuplicate?: (requestId: string) => void;
  pendingArchiveRequestId?: string | null;
  pendingDuplicateRequestId?: string | null;
  pendingDeleteRequestId?: string | null;
};

export type RequestsListProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  requests: RequestResponseDto[];
  isLoading: boolean;
  isError: boolean;
  serviceByKey: Map<string, { categoryKey: string; i18n: Record<string, string> }>;
  categoryByKey: Map<string, { i18n: Record<string, string> }>;
  cityById: Map<string, { i18n: Record<string, string> }>;
  formatDate: Intl.DateTimeFormat;
  formatPrice: Intl.NumberFormat;
  enableOfferActions?: boolean;
  showFavoriteButton?: boolean;
  hideRecurringBadge?: boolean;
  offersByRequest?: Map<string, OfferDto>;
  favoriteRequestIds?: Set<string>;
  onToggleFavorite?: (requestId: string) => void;
  onOpenRequest?: (requestId: string) => void;
  onSendOffer?: (requestId: string) => void;
  onEditOffer?: (requestId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
  onOpenChatThread?: (offer: OfferDto) => void;
  pendingOfferRequestId?: string | null;
  pendingFavoriteRequestIds?: Set<string>;
  ownerRequestActions?: OwnerRequestActions;
};
