import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/lib/i18n/keys';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { buildRequestListPresentation } from './requestListItem.model';

const t = (key: string) => key;
const formatPrice = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

function createRequest(overrides: Partial<RequestResponseDto> = {}): RequestResponseDto {
  return {
    id: 'req-1',
    serviceKey: 'cleaning',
    cityId: 'berlin',
    categoryKey: 'home',
    propertyType: 'apartment',
    area: 80,
    preferredDate: '2026-03-22T10:00:00.000Z',
    isRecurring: false,
    status: 'published',
    createdAt: '2026-03-20T10:00:00.000Z',
    ...overrides,
  };
}

describe('requestListItem.model', () => {
  it('builds separated card, status and favorite view models', () => {
    const request = createRequest({
      title: 'Kitchen deep clean',
      description: 'Kitchen deep clean with windows',
      price: 120,
      previousPrice: 140,
      priceTrend: 'down',
      tags: ['urgent', 'insured'],
    });
    const offer = {
      id: 'offer-1',
      requestId: 'req-1',
      status: 'sent',
      providerUserId: 'provider-1',
      clientUserId: 'client-1',
      createdAt: '2026-03-20T11:00:00.000Z',
      updatedAt: '2026-03-20T11:00:00.000Z',
    } as OfferDto;

    const view = buildRequestListPresentation({
      item: request,
      t,
      locale: 'en',
      serviceByKey: new Map([['cleaning', { categoryKey: 'home', i18n: { en: 'Cleaning' } }]]),
      categoryByKey: new Map([['home', { i18n: { en: 'Home services' } }]]),
      cityById: new Map([['berlin', { i18n: { en: 'Berlin' } }]]),
      formatPrice,
      enableOfferActions: true,
      offersByRequest: new Map([['req-1', offer]]),
      favoriteRequestIds: new Set(['req-1']),
      pendingOfferRequestId: 'req-1',
      pendingFavoriteRequestIds: new Set(['req-1']),
    });

    expect(view.card.title).toBe('Kitchen deep clean');
    expect(view.card.categoryLabel).toBe('Home services');
    expect(view.card.serviceLabel).toBe('Cleaning');
    expect(view.card.cityLabel).toBe('Berlin');
    expect(view.card.priceTrend).toBe('down');
    expect(view.card.tags).toEqual(['urgent', 'insured']);

    expect(view.status.detailsHref).toBe('/requests/req-1');
    expect(view.status.itemOffer?.id).toBe('offer-1');
    expect(view.status.offerCardState).toBe('sent');
    expect(view.status.statusLabel).toBe(I18N_KEYS.requestDetails.statusReview);
    expect(view.status.badgeStatus).toBe('sent');
    expect(view.status.isPendingWithdraw).toBe(true);

    expect(view.favorite.isFavorite).toBe(true);
    expect(view.favorite.isFavoritePending).toBe(true);
  });

  it('renders inactive request state from backend fields', () => {
    const view = buildRequestListPresentation({
      item: createRequest({
        status: 'cancelled',
        isInactive: true,
        inactiveMessage: 'Dieser Auftrag wurde vom Auftraggeber storniert.',
      }),
      t,
      locale: 'en',
      serviceByKey: new Map(),
      categoryByKey: new Map(),
      cityById: new Map(),
      formatPrice,
      enableOfferActions: false,
      pendingOfferRequestId: null,
    });

    expect(view.card.isInactive).toBe(true);
    expect(view.card.inactiveMessage).toBe('Dieser Auftrag wurde vom Auftraggeber storniert.');
    expect(view.status.ownerStatusLabel).toBe(I18N_KEYS.requestsPage.statusCancelled);
  });

  it('maps owner list state and pending delete independently from offer state', () => {
    const view = buildRequestListPresentation({
      item: createRequest({ id: 'req-owner', status: 'matched' }),
      t,
      locale: 'en',
      serviceByKey: new Map([['cleaning', { categoryKey: 'home', i18n: { en: 'Cleaning' } }]]),
      categoryByKey: new Map([['home', { i18n: { en: 'Home services' } }]]),
      cityById: new Map([['berlin', { i18n: { en: 'Berlin' } }]]),
      formatPrice,
      enableOfferActions: false,
      pendingOfferRequestId: null,
      ownerRequestActions: { pendingDeleteRequestId: 'req-owner' },
    });

    expect(view.status.isOwnerRequestList).toBe(true);
    expect(view.status.ownerStatusLabel).toBe(I18N_KEYS.requestsPage.statusInProgress);
    expect(view.status.isPendingOwnerDelete).toBe(true);
    expect(view.status.offerCardState).toBe('none');
  });

  it('falls back to estimated price when request has no explicit price', () => {
    const apartment = buildRequestListPresentation({
      item: createRequest({ area: 50, price: null }),
      t,
      locale: 'en',
      serviceByKey: new Map(),
      categoryByKey: new Map(),
      cityById: new Map(),
      formatPrice,
      enableOfferActions: false,
      pendingOfferRequestId: null,
    });

    const house = buildRequestListPresentation({
      item: createRequest({ id: 'req-house', propertyType: 'house', area: 50, price: null }),
      t,
      locale: 'en',
      serviceByKey: new Map(),
      categoryByKey: new Map(),
      cityById: new Map(),
      formatPrice,
      enableOfferActions: false,
      pendingOfferRequestId: null,
    });

    expect(apartment.card.priceLabel).toBe('€58');
    expect(house.card.priceLabel).toBe('€72');
  });
});
