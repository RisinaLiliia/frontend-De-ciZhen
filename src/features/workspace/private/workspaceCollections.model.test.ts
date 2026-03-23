import { describe, expect, it } from 'vitest';

import { buildWorkspaceCollections } from './workspaceCollections.model';

describe('workspaceCollections.model', () => {
  it('builds combined lookup, favorites and contracts state for workspace private flow', () => {
    const result = buildWorkspaceCollections({
      requests: [{ id: 'req-1' }] as never,
      favoriteRequests: [{ id: 'req-2' }] as never,
      providers: [{ id: 'provider-1' }, { id: 'provider-2' }] as never,
      favoriteProviders: [
        { id: 'provider-1', cityId: 'city-1', serviceKey: 'svc-1' },
      ] as never,
      myOffers: [
        { id: 'offer-1', requestId: 'req-1', updatedAt: '2026-03-20T10:00:00.000Z' },
        { id: 'offer-2', requestId: 'req-1', updatedAt: '2026-03-21T10:00:00.000Z' },
      ] as never,
      myProviderContracts: [{ id: 'contract-1', updatedAt: '2026-03-19T10:00:00.000Z' }] as never,
      myClientContracts: [{ id: 'contract-2', updatedAt: '2026-03-22T10:00:00.000Z' }] as never,
      cityById: new Map([['city-1', { i18n: { de: 'Berlin' } }]]),
      serviceByKey: new Map([['svc-1', { i18n: { de: 'Elektriker' } }]]),
      locale: 'de',
    });

    expect(result.favoriteRequestIds).toEqual(new Set(['req-2']));
    expect(result.requestById.get('req-1')).toEqual({ id: 'req-1' });
    expect(result.providerById.get('provider-1')).toEqual({
      id: 'provider-1',
      cityId: 'city-1',
      serviceKey: 'svc-1',
    });
    expect(result.favoriteProviderLookup).toEqual(new Set(['provider-1']));
    expect(result.favoriteProviderIds).toEqual(new Set(['provider-1']));
    expect(result.offersByRequest.get('req-1')?.id).toBe('offer-2');
    expect(result.allMyContracts.map((item) => item.id)).toEqual(['contract-2', 'contract-1']);
    expect(result.favoriteProviderCityLabelById.get('provider-1')).toBe('Berlin');
    expect(result.favoriteProviderRoleLabelById.get('provider-1')).toBe('Elektriker');
  });
});
