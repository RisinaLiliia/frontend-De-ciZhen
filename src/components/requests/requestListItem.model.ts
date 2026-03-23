'use client';

import { resolveOfferCardState } from '@/features/requests/uiState';
import { pickI18n } from '@/lib/i18n/helpers';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { pickRequestImage } from '@/lib/requests/images';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
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
  const localizedServiceLabel = pickServiceLabel(item.serviceKey, serviceByKey, locale);
  const serviceLabel = localizedServiceLabel || item.subcategoryName || item.serviceKey;
  const fallbackCategoryKey = item.categoryKey ?? serviceByKey.get(item.serviceKey)?.categoryKey ?? '';
  const localizedCategoryLabel = pickCategoryLabel(fallbackCategoryKey, categoryByKey, locale);
  const categoryLabel = localizedCategoryLabel || item.categoryName || fallbackCategoryKey;
  const cityLabel = cityById.has(item.cityId)
    ? pickI18n(cityById.get(item.cityId)!.i18n, locale)
    : item.cityName ?? item.cityId;
  const recurringLabel = item.isRecurring
    ? t(I18N_KEYS.client.recurringLabel)
    : t(I18N_KEYS.client.onceLabel);
  const priceValue = item.price ?? estimatePrice(item.area, item.propertyType);
  const explicitPriceTrend =
    item.priceTrend === 'down' || item.priceTrend === 'up' ? item.priceTrend : null;
  const priceTrend =
    explicitPriceTrend ??
    (typeof item.previousPrice === 'number' && typeof item.price === 'number'
      ? item.price < item.previousPrice
        ? 'down'
        : item.price > item.previousPrice
          ? 'up'
          : null
      : null);
  const priceTrendLabel =
    priceTrend === 'down'
      ? t(I18N_KEYS.request.priceTrendDown)
      : priceTrend === 'up'
        ? t(I18N_KEYS.request.priceTrendUp)
        : null;
  const imageSrc =
    (item.photos?.length ? item.photos[0] : null) || item.imageUrl || pickRequestImage(item.categoryKey ?? '');
  const title = item.title?.trim() || item.description?.trim() || serviceLabel;
  const excerptSource = item.description?.trim() ?? '';
  const detailsHref = `/requests/${item.id}`;
  const itemOffer = enableOfferActions ? offersByRequest?.get(item.id) : undefined;
  const offerCardState = resolveOfferCardState(itemOffer);
  const isOwnerRequestList = Boolean(ownerRequestActions);

  return {
    card: {
      detailsHref,
      imageSrc,
      title,
      excerpt: excerptSource && excerptSource !== title ? excerptSource : null,
      categoryLabel,
      serviceLabel,
      cityLabel,
      recurringLabel,
      priceLabel: formatPrice.format(priceValue),
      priceTrend,
      priceTrendLabel,
      tags: item.tags ?? [],
    },
    status: {
      detailsHref,
      itemId: item.id,
      itemStatus: item.status,
      itemOffer,
      offerCardState,
      statusLabel: mapOfferStatusLabel(offerCardState, t),
      badgeStatus: offerCardState === 'none' ? null : offerCardState,
      ownerStatusLabel: mapRequestStatusLabel(item.status, t),
      isOwnerRequestList,
      isPendingWithdraw: pendingOfferRequestId === item.id,
      isPendingOwnerDelete: ownerRequestActions?.pendingDeleteRequestId === item.id,
    },
    favorite: {
      isFavorite: favoriteRequestIds?.has(item.id) ?? false,
      isFavoritePending: pendingFavoriteRequestIds?.has(item.id) ?? false,
    },
  };
}

function mapOfferStatusLabel(
  offerCardState: ReturnType<typeof resolveOfferCardState>,
  t: (key: I18nKey) => string,
) {
  if (offerCardState === 'accepted') return t(I18N_KEYS.requestDetails.statusAccepted);
  if (offerCardState === 'declined') return t(I18N_KEYS.requestDetails.statusDeclined);
  if (offerCardState === 'sent') return t(I18N_KEYS.requestDetails.statusReview);
  return null;
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

function pickServiceLabel(
  serviceKey: string,
  serviceByKey: Map<string, { i18n: Record<string, string> }>,
  locale: Locale,
) {
  const service = serviceByKey.get(serviceKey);
  if (!service) return serviceKey;
  return pickI18n(service.i18n, locale);
}

function pickCategoryLabel(
  categoryKey: string,
  categoryByKey: Map<string, { i18n: Record<string, string> }>,
  locale: Locale,
) {
  const category = categoryByKey.get(categoryKey);
  if (!category) return categoryKey;
  return pickI18n(category.i18n, locale);
}

function estimatePrice(area: number, propertyType: string) {
  const basisPoints = propertyType === 'house' ? 14375 : 11500;
  return Math.max(35, Math.round((area * basisPoints) / 10000));
}
