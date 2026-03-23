'use client';

import * as React from 'react';

import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { RequestListStatusSlot } from '@/components/requests/RequestListStatusSlot';
import { RequestCard } from '@/components/requests/RequestCard';
import { buildRequestListPresentation } from '@/components/requests/requestListItem.model';
import { LocationMeta } from '@/components/ui/LocationMeta';
import { IconCalendar } from '@/components/ui/icons/icons';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { Locale } from '@/lib/i18n/t';
import type { OwnerRequestActions, RequestsListProps } from './requestsList.types';

type RequestListItemProps = {
  item: RequestResponseDto;
  index: number;
  t: RequestsListProps['t'];
  locale: Locale;
  serviceByKey: RequestsListProps['serviceByKey'];
  categoryByKey: RequestsListProps['categoryByKey'];
  cityById: RequestsListProps['cityById'];
  formatDate: Intl.DateTimeFormat;
  formatPrice: Intl.NumberFormat;
  enableOfferActions: boolean;
  showFavoriteButton: boolean;
  hideRecurringBadge: boolean;
  offersByRequest?: Map<string, OfferDto>;
  favoriteRequestIds?: Set<string>;
  onToggleFavorite?: (requestId: string) => void;
  onSendOffer?: (requestId: string) => void;
  onEditOffer?: (requestId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
  onOpenChatThread?: (offer: OfferDto) => void;
  pendingOfferRequestId: string | null;
  pendingFavoriteRequestIds?: Set<string>;
  ownerRequestActions?: OwnerRequestActions;
};

export function RequestsListItem({
  item,
  index,
  t,
  locale,
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
}: RequestListItemProps) {
  const view = buildRequestListPresentation({
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
  });

  return (
    <RequestCard
      prefetch={index < 2}
      href={view.card.detailsHref}
      ariaLabel={t(I18N_KEYS.requestsPage.openRequest)}
      imageSrc={view.card.imageSrc}
      imageAlt=""
      imagePriority={index === 0 && !hideRecurringBadge && !view.status.isOwnerRequestList}
      badges={hideRecurringBadge ? [] : [view.card.recurringLabel]}
      category={view.card.categoryLabel}
      title={view.card.title}
      excerpt={view.card.excerpt}
      meta={[
        <LocationMeta key="city" label={view.card.cityLabel} />,
        <React.Fragment key="date">
          <IconCalendar />
          {formatDate.format(new Date(item.preferredDate))}
        </React.Fragment>,
      ]}
      priceLabel={view.card.priceLabel}
      priceTrend={view.card.priceTrend}
      priceTrendLabel={view.card.priceTrendLabel}
      tags={[view.card.categoryLabel, view.card.serviceLabel, ...view.card.tags.slice(0, 2)]}
      mode="link"
      statusSlot={(
        <RequestListStatusSlot
          status={view.status}
          actions={{
            t,
            ownerRequestActions,
            onSendOffer,
            onEditOffer,
            onWithdrawOffer,
            onOpenChatThread,
          }}
        />
      )}
      overlaySlot={
        showFavoriteButton ? (
          <FavoriteButton
            variant="icon"
            isFavorite={view.favorite.isFavorite}
            isPending={view.favorite.isFavoritePending}
            onToggle={() => onToggleFavorite?.(item.id)}
            ariaLabel={t(I18N_KEYS.requestDetails.ctaSave)}
          />
        ) : null
      }
      actionSlot={null}
    />
  );
}
