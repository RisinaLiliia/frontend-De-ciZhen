// src/components/requests/RequestsList.tsx
'use client';

import * as React from 'react';

import { I18N_KEYS } from '@/lib/i18n/keys';
import { RequestsListItem } from '@/components/requests/RequestsListItem';
import type { RequestsListProps } from '@/components/requests/requestsList.types';

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
  pendingOfferRequestId = null,
  pendingFavoriteRequestIds,
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
        return (
          <RequestsListItem
            key={item.id}
            item={item}
            index={index}
            t={t}
            locale={locale}
            serviceByKey={serviceByKey}
            categoryByKey={categoryByKey}
            cityById={cityById}
            formatDate={formatDate}
            formatPrice={formatPrice}
            enableOfferActions={enableOfferActions}
            showFavoriteButton={showFavoriteButton}
            hideRecurringBadge={hideRecurringBadge}
            offersByRequest={offersByRequest}
            favoriteRequestIds={favoriteRequestIds}
            onToggleFavorite={onToggleFavorite}
            onSendOffer={onSendOffer}
            onEditOffer={onEditOffer}
            onWithdrawOffer={onWithdrawOffer}
            onOpenChatThread={onOpenChatThread}
            pendingOfferRequestId={pendingOfferRequestId}
            pendingFavoriteRequestIds={pendingFavoriteRequestIds}
            ownerRequestActions={ownerRequestActions}
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
    prev.enableOfferActions === next.enableOfferActions &&
    prev.showFavoriteButton === next.showFavoriteButton &&
    prev.hideRecurringBadge === next.hideRecurringBadge &&
    prev.offersByRequest === next.offersByRequest &&
    prev.favoriteRequestIds === next.favoriteRequestIds &&
    prev.onToggleFavorite === next.onToggleFavorite &&
    prev.onSendOffer === next.onSendOffer &&
    prev.onEditOffer === next.onEditOffer &&
    prev.onWithdrawOffer === next.onWithdrawOffer &&
    prev.onOpenChatThread === next.onOpenChatThread &&
    prev.pendingOfferRequestId === next.pendingOfferRequestId &&
    prev.pendingFavoriteRequestIds === next.pendingFavoriteRequestIds &&
    prev.ownerRequestActions === next.ownerRequestActions
  );
}

export const RequestsList = React.memo(RequestsListComponent, areRequestsListPropsEqual);
