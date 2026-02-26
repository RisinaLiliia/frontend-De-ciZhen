// src/components/requests/RequestsList.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { IconBriefcase, IconCalendar, IconChat, IconEdit, IconHeart } from '@/components/ui/icons/icons';
import { OrderCard } from '@/components/orders/OrderCard';
import { LocationMeta } from '@/components/ui/LocationMeta';
import { OfferActionButton } from '@/components/ui/OfferActionButton';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { pickI18n } from '@/lib/i18n/helpers';
import { resolveOfferCardState } from '@/features/requests/uiState';
import { getStatusBadgeClass } from '@/lib/statusBadge';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { OfferDto } from '@/lib/api/dto/offers';

type RequestsListProps = {
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
  isProviderPersonalized?: boolean;
  offersByRequest?: Map<string, OfferDto>;
  favoriteRequestIds?: Set<string>;
  onToggleFavorite?: (requestId: string) => void;
  onSendOffer?: (requestId: string) => void;
  onEditOffer?: (requestId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
  pendingOfferRequestId?: string | null;
  pendingFavoriteRequestIds?: Set<string>;
  showStaticFavoriteIcon?: boolean;
  ownerRequestActions?: {
    onDelete?: (requestId: string) => void;
    pendingDeleteRequestId?: string | null;
  };
};

function RequestsListComponent({
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
  isProviderPersonalized = false,
  offersByRequest,
  favoriteRequestIds,
  onToggleFavorite,
  onSendOffer,
  onEditOffer,
  onWithdrawOffer,
  pendingOfferRequestId = null,
  pendingFavoriteRequestIds,
  showStaticFavoriteIcon = false,
  ownerRequestActions,
}: RequestsListProps) {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`request-skeleton-${index}`} className="request-card request-card--skeleton">
            <div className="request-card__media skeleton" />
            <div className="request-card__body">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-3 w-2/3" />
              <div className="request-card__tags">
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (isError) {
    return (
      <div className="card text-center typo-muted">
        {t(I18N_KEYS.requestsPage.error)}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="card text-center typo-muted">
        {t(I18N_KEYS.requestsPage.empty)}
      </div>
    );
  }

  return (
    <>
      {requests.map((item, index) => {
        const localizedServiceLabel = pickServiceLabel(item.serviceKey, serviceByKey, locale);
        const serviceLabel = localizedServiceLabel || item.subcategoryName || item.serviceKey;
        const fallbackCategoryKey =
          item.categoryKey ?? serviceByKey.get(item.serviceKey)?.categoryKey ?? '';
        const localizedCategoryLabel = pickCategoryLabel(fallbackCategoryKey, categoryByKey, locale);
        const categoryLabel = localizedCategoryLabel || item.categoryName || fallbackCategoryKey;
        const cityLabel = cityById.has(item.cityId)
          ? pickI18n(cityById.get(item.cityId)!.i18n, locale)
          : item.cityName ?? item.cityId;
        const recurringLabel = item.isRecurring
          ? t(I18N_KEYS.client.recurringLabel)
          : t(I18N_KEYS.client.onceLabel);
        const priceValue = item.price ?? estimatePrice(item.area, item.propertyType);
        const priceLabel = formatPrice.format(priceValue);
        const explicitPriceTrend =
          item.priceTrend === 'down' || item.priceTrend === 'up' ? item.priceTrend : null;
        const derivedPriceTrend =
          explicitPriceTrend ??
          (typeof item.previousPrice === 'number' && typeof item.price === 'number'
            ? item.price < item.previousPrice
              ? 'down'
              : item.price > item.previousPrice
                ? 'up'
                : null
            : null);
        const priceTrendLabel =
          derivedPriceTrend === 'down'
            ? t(I18N_KEYS.request.priceTrendDown)
            : derivedPriceTrend === 'up'
              ? t(I18N_KEYS.request.priceTrendUp)
              : null;
        const imageSrc =
          (item.photos?.length ? item.photos[0] : null) ||
          item.imageUrl ||
          pickRequestImage(item.categoryKey ?? '');
        const title = item.title?.trim() || item.description?.trim() || serviceLabel;
        const excerptSource = item.description?.trim() ?? '';
        const excerpt = excerptSource && excerptSource !== title ? excerptSource : null;
        const tags = item.tags ?? [];
        const detailsHref = `/requests/${item.id}`;
        const itemOffer = isProviderPersonalized ? offersByRequest?.get(item.id) : undefined;
        const isOwnerRequestList = Boolean(ownerRequestActions);
        const offerCardState = resolveOfferCardState(itemOffer);
        const badgeStatus =
          offerCardState === 'none' ? null : offerCardState;
        const statusLabel =
          offerCardState === 'accepted'
            ? t(I18N_KEYS.requestDetails.statusAccepted)
            : offerCardState === 'declined'
              ? t(I18N_KEYS.requestDetails.statusDeclined)
              : offerCardState === 'sent'
                ? t(I18N_KEYS.requestDetails.statusReview)
                : null;
        const isFavorite = favoriteRequestIds?.has(item.id) ?? false;
        const isFavoritePending = pendingFavoriteRequestIds?.has(item.id) ?? false;
        const isSentState = offerCardState === 'sent';
        const isPendingWithdraw = pendingOfferRequestId === item.id;
        const isPendingOwnerDelete = ownerRequestActions?.pendingDeleteRequestId === item.id;
        const ownerStatusLabel = mapRequestStatusLabel(item.status, t);

        return (
          <OrderCard
            key={item.id}
            prefetch={index < 2}
            href={detailsHref}
            ariaLabel={t(I18N_KEYS.requestsPage.openRequest)}
            imageSrc={imageSrc}
            imageAlt={categoryLabel}
            badges={
              isProviderPersonalized
                ? []
                : [recurringLabel]
            }
            category={categoryLabel}
            title={title}
            excerpt={excerpt}
            meta={[
              <LocationMeta key="city" label={cityLabel} />,
              <React.Fragment key="date">
                <IconCalendar />
                {formatDate.format(new Date(item.preferredDate))}
              </React.Fragment>,
            ]}
            priceLabel={priceLabel}
            priceTrend={derivedPriceTrend}
            priceTrendLabel={priceTrendLabel}
            tags={[
              categoryLabel,
              serviceLabel,
              ...tags.slice(0, 2),
            ]}
            mode={isProviderPersonalized || isOwnerRequestList ? 'static' : 'link'}
            statusSlot={
              isOwnerRequestList ? (
                <span className="request-card__status-actions">
                  <span className={`${getStatusBadgeClass(item.status)} capitalize`} title={ownerStatusLabel}>
                    {ownerStatusLabel}
                  </span>
                  <Link
                    href={detailsHref}
                    className="btn-secondary offer-action-btn offer-action-btn--icon-only request-card__status-action"
                    aria-label={t(I18N_KEYS.requestsPage.openRequest)}
                    title={t(I18N_KEYS.requestsPage.openRequest)}
                  >
                    <i className="offer-action-btn__icon">
                      <IconBriefcase />
                    </i>
                  </Link>
                  <Link
                    href={`${detailsHref}?edit=1`}
                    className="btn-secondary offer-action-btn offer-action-btn--icon-only request-card__status-action request-card__status-action--edit"
                    aria-label={t(I18N_KEYS.requestDetails.responseEditTooltip)}
                    title={t(I18N_KEYS.requestDetails.responseEditTooltip)}
                  >
                    <i className="offer-action-btn__icon">
                      <IconEdit />
                    </i>
                  </Link>
                  <OfferActionButton
                    kind="delete"
                    label={t(I18N_KEYS.requestDetails.responseCancel)}
                    ariaLabel={t(I18N_KEYS.requestDetails.responseCancel)}
                    title={t(I18N_KEYS.requestDetails.responseCancel)}
                    iconOnly
                    className="request-card__status-action request-card__status-action--danger"
                    onClick={() => ownerRequestActions?.onDelete?.(item.id)}
                    disabled={isPendingOwnerDelete}
                  />
                </span>
              ) : offerCardState === 'none' ? (
                <span className="request-card__status-actions">
                  <OfferActionButton
                    kind="submit"
                    label={t(I18N_KEYS.requestDetails.ctaApply)}
                    ariaLabel={t(I18N_KEYS.requestDetails.ctaApply)}
                    title={t(I18N_KEYS.requestDetails.ctaApply)}
                    iconOnly
                    className="request-card__status-action request-card__status-action--submit"
                    onClick={() => onSendOffer?.(item.id)}
                  />
                </span>
              ) : statusLabel && badgeStatus ? (
                <span className="request-card__status-actions">
                  <span
                    className={`${getStatusBadgeClass(badgeStatus)} capitalize`}
                    title={badgeStatus === 'sent' ? t(I18N_KEYS.requestDetails.responseSentHint) : statusLabel}
                  >
                    {statusLabel}
                  </span>
                  {isSentState ? (
                    <>
                      <OfferActionButton
                        kind="edit"
                        label={t(I18N_KEYS.requestDetails.responseEditCta)}
                        ariaLabel={t(I18N_KEYS.requestDetails.responseEditTooltip)}
                        title={t(I18N_KEYS.requestDetails.responseEditTooltip)}
                        iconOnly
                        className="request-card__status-action request-card__status-action--edit"
                        onClick={() => onEditOffer?.(item.id)}
                      />
                      <OfferActionButton
                        kind="delete"
                        label={t(I18N_KEYS.requestDetails.responseCancel)}
                        ariaLabel={t(I18N_KEYS.requestDetails.responseCancel)}
                        title={t(I18N_KEYS.requestDetails.responseCancel)}
                        iconOnly
                        className="request-card__status-action request-card__status-action--danger"
                        onClick={() => itemOffer?.id && onWithdrawOffer?.(itemOffer.id)}
                        disabled={isPendingWithdraw}
                      />
                    </>
                  ) : null}
                  {offerCardState === 'accepted' ? (
                    <>
                      <Link
                        href="/workspace?tab=completed-jobs"
                        prefetch={false}
                        className="btn-primary offer-action-btn offer-action-btn--icon-only request-card__status-action request-card__status-action--contract"
                        aria-label={t(I18N_KEYS.requestDetails.responseViewContract)}
                        title={t(I18N_KEYS.requestDetails.responseViewContract)}
                      >
                        <i className="offer-action-btn__icon">
                          <IconBriefcase />
                        </i>
                      </Link>
                      {itemOffer?.id ? (
                        <Link
                          href={`/chat/${itemOffer.id}`}
                          className="btn-secondary offer-action-btn offer-action-btn--icon-only request-card__status-action request-card__status-action--chat"
                          aria-label={t(I18N_KEYS.requestDetails.ctaChat)}
                          title={t(I18N_KEYS.requestDetails.ctaChat)}
                        >
                          <i className="offer-action-btn__icon">
                            <IconChat />
                          </i>
                        </Link>
                      ) : null}
                    </>
                  ) : null}
                  {offerCardState === 'declined' ? (
                    <OfferActionButton
                      kind="submit"
                      label={t(I18N_KEYS.requestDetails.ctaApply)}
                      ariaLabel={t(I18N_KEYS.requestDetails.ctaApply)}
                      title={t(I18N_KEYS.requestDetails.ctaApply)}
                      iconOnly
                      className="request-card__status-action request-card__status-action--submit"
                      onClick={() => onSendOffer?.(item.id)}
                    />
                  ) : null}
                </span>
              ) : null
            }
            overlaySlot={
              isProviderPersonalized || showStaticFavoriteIcon ? (
                <button
                  type="button"
                  className={`btn-ghost is-primary request-detail__save request-card__favorite-btn ${
                    isFavorite ? 'is-saved is-active' : ''
                  } ${isFavoritePending ? 'is-pending' : ''}`.trim()}
                  onClick={() => onToggleFavorite?.(item.id)}
                  aria-label={t(I18N_KEYS.requestDetails.ctaSave)}
                  title={t(I18N_KEYS.requestDetails.ctaSave)}
                  disabled={isFavoritePending || !onToggleFavorite}
                >
                  <IconHeart className="icon-heart" />
                </button>
              ) : null
            }
            actionSlot={null}
          />
        );
      })}
    </>
  );
}

function areRequestsListPropsEqual(prev: RequestsListProps, next: RequestsListProps) {
  return (
    prev.t === next.t &&
    prev.locale === next.locale &&
    prev.requests === next.requests &&
    prev.isLoading === next.isLoading &&
    prev.isError === next.isError &&
    prev.serviceByKey === next.serviceByKey &&
    prev.categoryByKey === next.categoryByKey &&
    prev.cityById === next.cityById &&
    prev.formatDate === next.formatDate &&
    prev.formatPrice === next.formatPrice &&
    prev.isProviderPersonalized === next.isProviderPersonalized &&
    prev.offersByRequest === next.offersByRequest &&
    prev.favoriteRequestIds === next.favoriteRequestIds &&
    prev.onToggleFavorite === next.onToggleFavorite &&
    prev.onSendOffer === next.onSendOffer &&
    prev.onEditOffer === next.onEditOffer &&
    prev.onWithdrawOffer === next.onWithdrawOffer &&
    prev.pendingOfferRequestId === next.pendingOfferRequestId &&
    prev.pendingFavoriteRequestIds === next.pendingFavoriteRequestIds &&
    prev.showStaticFavoriteIcon === next.showStaticFavoriteIcon &&
    prev.ownerRequestActions === next.ownerRequestActions
  );
}

export const RequestsList = React.memo(RequestsListComponent, areRequestsListPropsEqual);

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
  return pickI18n(service.i18n, locale as Locale);
}

function pickCategoryLabel(
  categoryKey: string,
  categoryByKey: Map<string, { i18n: Record<string, string> }>,
  locale: Locale,
) {
  const category = categoryByKey.get(categoryKey);
  if (!category) return categoryKey;
  return pickI18n(category.i18n, locale as Locale);
}

function estimatePrice(area: number, propertyType: string) {
  const factor = propertyType === 'house' ? 1.25 : 1;
  return Math.max(35, Math.round(area * 1.15 * factor));
}

function pickRequestImage(categoryKey: string) {
  const map: Record<string, string> = {
    cleaning: '/Reinigung im modernen Wohnzimmer.jpg',
    electric: '/Elektriker bei der Arbeit an Schaltschrank.jpg',
    plumbing: '/Freundlicher Klempner bei der Arbeit.jpg',
    repair: '/Techniker repariert Smartphone in Werkstatt.jpg',
    moving: '/L%C3%A4dt%20Kisten%20aus%20einem%20Transporter.jpg',
  };
  return map[categoryKey] ?? '/Handwerker%20in%20einem%20modernen%20Wohnzimmer.jpg';
}
