'use client';

import * as React from 'react';

import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { PublicRequestCardActionRow } from '@/components/requests/PublicRequestCardActionRow';
import { WorkspaceGuestRequestCard } from '@/components/requests/WorkspaceGuestRequestCard';
import { buildPublicRequestCardPresentation } from '@/components/requests/publicRequestCard.model';
import type { RequestsListProps } from '@/components/requests/requestsList.types';
import { I18N_KEYS } from '@/lib/i18n/keys';

export function PublicRequestsCardList({
  t,
  locale,
  requests,
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
  onOpenRequest,
  onSendOffer,
  onEditOffer,
  onWithdrawOffer,
  onOpenChatThread,
  pendingOfferRequestId = null,
  pendingFavoriteRequestIds,
}: RequestsListProps) {
  if (isError) {
    return (
      <div className="card text-center typo-muted">
        {t(I18N_KEYS.requestsPage.error)}
      </div>
    );
  }

  return (
    <>
      {requests.map((item, index) => {
        const view = buildPublicRequestCardPresentation({
          item,
          t,
          locale,
          serviceByKey,
          categoryByKey,
          cityById,
          formatPrice,
          formatDate,
          enableOfferActions,
          offersByRequest,
          favoriteRequestIds,
          pendingOfferRequestId,
          pendingFavoriteRequestIds,
        });

        return (
          <div key={item.id} className="workspace-guest-request-card-shell">
            <WorkspaceGuestRequestCard
              prefetch={index < 2}
              href={view.card.detailsHref}
              className="workspace-guest-request-card workspace-guest-request-card--explore"
              ariaLabel={t(I18N_KEYS.requestsPage.openRequest)}
              imageSrc={view.card.imageSrc}
              imageAlt=""
              imagePriority={index === 0}
              categoryLabel={view.card.categoryLabel}
              title={view.card.title}
              excerpt={view.card.excerpt}
              cityLabel={view.card.cityLabel}
              dateLabel={view.card.dateLabel}
              priceLabel={view.card.priceLabel}
              priceTrend={view.card.priceTrend}
              priceTrendLabel={view.card.priceTrendLabel}
              badgeLabel={hideRecurringBadge ? null : view.card.recurringLabel}
              onOpen={onOpenRequest ? () => onOpenRequest(item.id) : undefined}
              contentSlot={view.card.isInactive && view.card.inactiveMessage ? (
                <div className="request-card__inactive-message">
                  {view.card.inactiveMessage}
                </div>
              ) : null}
              actionSlot={enableOfferActions ? (
                <PublicRequestCardActionRow
                  status={view.status}
                  actions={{
                    t,
                    onSendOffer,
                    onEditOffer,
                    onWithdrawOffer,
                    onOpenChatThread,
                  }}
                />
              ) : null}
              overlaySlot={showFavoriteButton ? (
                <FavoriteButton
                  variant="icon"
                  isFavorite={view.favorite.isFavorite}
                  isPending={view.favorite.isFavoritePending}
                  onToggle={() => onToggleFavorite?.(item.id)}
                  ariaLabel={t(I18N_KEYS.requestDetails.ctaSave)}
                  title={t(I18N_KEYS.requestDetails.ctaSave)}
                />
              ) : null}
            />
          </div>
        );
      })}
    </>
  );
}
