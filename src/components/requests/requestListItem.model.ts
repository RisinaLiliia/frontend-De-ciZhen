'use client';

import { buildPublicRequestCardPresentation } from '@/components/requests/publicRequestCard.model';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { RequestListStatusPresentation } from './requestListStatus.types';
import type { OwnerRequestActions, RequestsListProps } from './requestsList.types';

export type RequestListCardPresentation = {
  detailsHref: string;
  imageSrc: string;
  title: string;
  excerpt: string | null;
  categoryLabel: string;
  serviceLabel: string;
  cityLabel: string;
  recurringLabel: string;
  priceLabel: string;
  priceTrend: 'up' | 'down' | null;
  priceTrendLabel: string | null;
  tags: string[];
  isInactive: boolean;
  inactiveMessage: string | null;
};

export type RequestListFavoritePresentation = {
  isFavorite: boolean;
  isFavoritePending: boolean;
};

export type RequestListPresentation = {
  card: RequestListCardPresentation;
  status: RequestListStatusPresentation;
  favorite: RequestListFavoritePresentation;
};

type BuildRequestListPresentationParams = {
  item: RequestResponseDto;
  t: (key: I18nKey) => string;
  locale: Locale;
  serviceByKey: RequestsListProps['serviceByKey'];
  categoryByKey: RequestsListProps['categoryByKey'];
  cityById: RequestsListProps['cityById'];
  formatPrice: Intl.NumberFormat;
  enableOfferActions: boolean;
  offersByRequest?: Map<string, OfferDto>;
  favoriteRequestIds?: Set<string>;
  pendingOfferRequestId: string | null;
  pendingFavoriteRequestIds?: Set<string>;
  ownerRequestActions?: OwnerRequestActions;
};

export function buildRequestListPresentation({
  item,
  t,
  locale,
  serviceByKey,
  categoryByKey,
  cityById,
  formatPrice,
  enableOfferActions,
  offersByRequest,
  favoriteRequestIds,
  pendingOfferRequestId,
  pendingFavoriteRequestIds,
  ownerRequestActions,
}: BuildRequestListPresentationParams): RequestListPresentation {
  const publicPresentation = buildPublicRequestCardPresentation({
    item,
    t,
    locale,
    serviceByKey,
    categoryByKey,
    cityById,
    formatPrice,
    enableOfferActions,
    offersByRequest,
    favoriteRequestIds,
    pendingOfferRequestId,
    pendingFavoriteRequestIds,
  });
  const isOwnerRequestList = Boolean(ownerRequestActions);

  return {
    card: publicPresentation.card,
    status: {
      detailsHref: publicPresentation.card.detailsHref,
      itemId: item.id,
      itemStatus: item.status,
      itemOffer: publicPresentation.status.itemOffer,
      offerCardState: publicPresentation.status.offerCardState,
      statusLabel: publicPresentation.status.statusLabel,
      badgeStatus: publicPresentation.status.badgeStatus,
      ownerStatusLabel: mapRequestStatusLabel(item.status, t),
      isOwnerRequestList,
      isPendingWithdraw: publicPresentation.status.isPendingWithdraw,
      isPendingOwnerDelete: ownerRequestActions?.pendingDeleteRequestId === item.id,
    },
    favorite: publicPresentation.favorite,
  };
}

function mapRequestStatusLabel(status: string | undefined, t: (key: I18nKey) => string) {
  if (!status) return t(I18N_KEYS.requestsPage.statusOpen);
  if (status === 'completed') return t(I18N_KEYS.requestsPage.statusCompleted);
  if (status === 'cancelled') return t(I18N_KEYS.requestsPage.statusCancelled);
  if (status === 'in_progress' || status === 'assigned' || status === 'matched' || status === 'confirmed') {
    return t(I18N_KEYS.requestsPage.statusInProgress);
  }
  return t(I18N_KEYS.requestsPage.statusOpen);
}
