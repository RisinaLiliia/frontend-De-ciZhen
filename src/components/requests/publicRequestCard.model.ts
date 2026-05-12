'use client';

import { resolveOfferCardState, type OfferCardState } from '@/features/requests/uiState';
import { pickI18n } from '@/lib/i18n/helpers';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { pickRequestImage } from '@/lib/requests/images';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type ServiceCatalogEntry = {
  categoryKey: string;
  i18n: Record<string, string>;
};

type CategoryCatalogEntry = {
  i18n: Record<string, string>;
};

type CityCatalogEntry = {
  i18n: Record<string, string>;
};

export type PublicRequestCardView = {
  detailsHref: string;
  imageSrc: string;
  title: string;
  excerpt: string | null;
  categoryLabel: string;
  serviceLabel: string;
  cityLabel: string;
  dateLabel: string | null;
  recurringLabel: string;
  priceLabel: string;
  priceTrend: 'up' | 'down' | null;
  priceTrendLabel: string | null;
  tags: string[];
  isInactive: boolean;
  inactiveMessage: string | null;
};

export type PublicRequestCardFavoriteView = {
  isFavorite: boolean;
  isFavoritePending: boolean;
};

export type PublicRequestCardStatusView = {
  itemId: string;
  itemOffer: OfferDto | undefined;
  offerCardState: OfferCardState;
  statusLabel: string | null;
  badgeStatus: Exclude<OfferCardState, 'none'> | null;
  isPendingWithdraw: boolean;
};

export type PublicRequestCardPresentation = {
  card: PublicRequestCardView;
  favorite: PublicRequestCardFavoriteView;
  status: PublicRequestCardStatusView;
};

type BuildPublicRequestCardPresentationParams = {
  item: RequestResponseDto;
  t: (key: I18nKey) => string;
  locale: Locale;
  formatPrice: Intl.NumberFormat;
  formatDate?: Intl.DateTimeFormat;
  serviceByKey?: Map<string, ServiceCatalogEntry>;
  categoryByKey?: Map<string, CategoryCatalogEntry>;
  cityById?: Map<string, CityCatalogEntry>;
  enableOfferActions?: boolean;
  offersByRequest?: Map<string, OfferDto>;
  favoriteRequestIds?: ReadonlySet<string>;
  pendingOfferRequestId?: string | null;
  pendingFavoriteRequestIds?: ReadonlySet<string>;
};

export function buildPublicRequestCardPresentation({
  item,
  t,
  locale,
  formatPrice,
  formatDate,
  serviceByKey = new Map<string, ServiceCatalogEntry>(),
  categoryByKey = new Map<string, CategoryCatalogEntry>(),
  cityById = new Map<string, CityCatalogEntry>(),
  enableOfferActions = false,
  offersByRequest,
  favoriteRequestIds,
  pendingOfferRequestId = null,
  pendingFavoriteRequestIds,
}: BuildPublicRequestCardPresentationParams): PublicRequestCardPresentation {
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
  const priceTrend = item.priceTrend === 'down' || item.priceTrend === 'up' ? item.priceTrend : null;
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
  const preferredDate = item.preferredDate ? new Date(item.preferredDate) : null;
  const itemOffer = enableOfferActions ? offersByRequest?.get(item.id) : undefined;
  const offerCardState = resolveOfferCardState(itemOffer);

  return {
    card: {
      detailsHref,
      imageSrc,
      title,
      excerpt: excerptSource && excerptSource !== title ? excerptSource : null,
      categoryLabel,
      serviceLabel,
      cityLabel,
      dateLabel: preferredDate && !Number.isNaN(preferredDate.getTime()) && formatDate
        ? formatDate.format(preferredDate)
        : null,
      recurringLabel,
      priceLabel: formatPrice.format(priceValue),
      priceTrend,
      priceTrendLabel,
      tags: item.tags ?? [],
      isInactive: item.isInactive === true || item.status === 'cancelled',
      inactiveMessage: item.inactiveMessage?.trim() || null,
    },
    status: {
      itemId: item.id,
      itemOffer,
      offerCardState,
      statusLabel: mapOfferStatusLabel(offerCardState, t),
      badgeStatus: offerCardState === 'none' ? null : offerCardState,
      isPendingWithdraw: pendingOfferRequestId === item.id,
    },
    favorite: {
      isFavorite: favoriteRequestIds?.has(item.id) ?? false,
      isFavoritePending: pendingFavoriteRequestIds?.has(item.id) ?? false,
    },
  };
}

function mapOfferStatusLabel(
  offerCardState: OfferCardState,
  t: (key: I18nKey) => string,
) {
  if (offerCardState === 'accepted') return t(I18N_KEYS.requestDetails.statusAccepted);
  if (offerCardState === 'declined') return t(I18N_KEYS.requestDetails.statusDeclined);
  if (offerCardState === 'sent') return t(I18N_KEYS.requestDetails.statusReview);
  return null;
}

function pickServiceLabel(
  serviceKey: string,
  serviceByKey: Map<string, ServiceCatalogEntry>,
  locale: Locale,
) {
  const service = serviceByKey.get(serviceKey);
  if (!service) return serviceKey;
  return pickI18n(service.i18n, locale);
}

function pickCategoryLabel(
  categoryKey: string,
  categoryByKey: Map<string, CategoryCatalogEntry>,
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
