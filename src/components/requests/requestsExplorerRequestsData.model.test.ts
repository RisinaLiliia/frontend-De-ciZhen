import { describe, expect, it } from 'vitest';

import {
  buildFavoriteRequestIds,
  buildRequestByIdMap,
  buildRequestsExplorerPublicRequestsQueryState,
  findOfferRequestId,
  formatRequestsExplorerTotalResultsLabel,
  resolveRequestsExplorerLoginHref,
  resolveRequestsExplorerOfferHref,
} from '@/components/requests/requestsExplorerRequestsData.model';
import type { OfferDto } from '@/lib/api/dto/offers';
import type { PublicRequestsResponseDto, RequestResponseDto } from '@/lib/api/dto/requests';

describe('requestsExplorerRequestsData.model', () => {
  it('builds public requests query state with initial data preference for default filters', () => {
    const initialPublicRequests = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    } satisfies PublicRequestsResponseDto;

    const state = buildRequestsExplorerPublicRequestsQueryState({
      filter: { sort: 'date_desc', page: 1, limit: 20 },
      locale: 'de',
      isProvidersView: false,
      preferInitialPublicRequests: true,
      initialPublicRequests,
    });

    expect(state.enabled).toBe(true);
    expect(state.initialData).toBe(initialPublicRequests);
    expect(state.queryKey).toEqual([
      'requests-explorer-public',
      undefined,
      undefined,
      undefined,
      'date_desc',
      1,
      20,
      'de',
    ]);
  });

  it('disables public requests query in providers mode and without ready initial data', () => {
    expect(
      buildRequestsExplorerPublicRequestsQueryState({
        filter: { sort: 'date_desc', page: 1, limit: 20 },
        locale: 'en',
        isProvidersView: true,
        preferInitialPublicRequests: true,
        initialPublicRequests: undefined,
      }).enabled,
    ).toBe(false);

    expect(
      buildRequestsExplorerPublicRequestsQueryState({
        filter: { sort: 'date_desc', page: 1, limit: 20 },
        locale: 'en',
        isProvidersView: false,
        preferInitialPublicRequests: true,
        initialPublicRequests: undefined,
      }).enabled,
    ).toBe(true);
  });

  it('does not attach mismatched initial data to a different page-size query', () => {
    const state = buildRequestsExplorerPublicRequestsQueryState({
      filter: { sort: 'date_desc', page: 1, limit: 20 },
      locale: 'en',
      isProvidersView: false,
      preferInitialPublicRequests: true,
      initialPublicRequests: {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
      },
    });

    expect(state.initialData).toBeUndefined();
  });

  it('builds request maps and favorite ids', () => {
    const requests = [
      { id: 'request-1' },
      { id: 'request-2' },
    ] as RequestResponseDto[];

    expect(buildRequestByIdMap(requests).get('request-2')?.id).toBe('request-2');
    expect(buildFavoriteRequestIds(requests)).toEqual(new Set(['request-1', 'request-2']));
  });

  it('resolves offer and login hrefs consistently', () => {
    expect(resolveRequestsExplorerOfferHref('request-123')).toBe('/requests/request-123?offer=1');
    expect(resolveRequestsExplorerLoginHref('request-123')).toBe(
      '/auth/login?next=%2Frequests%2Frequest-123%3Foffer%3D1',
    );
  });

  it('finds request id for an offer and formats totals per locale', () => {
    const offers = [
      { id: 'offer-1', requestId: 'request-1' },
      { id: 'offer-2', requestId: 'request-2' },
    ] as OfferDto[];

    expect(findOfferRequestId(offers, 'offer-2')).toBe('request-2');
    expect(findOfferRequestId(offers, 'missing')).toBeNull();
    expect(formatRequestsExplorerTotalResultsLabel('de', 12345)).toBe('12.345');
    expect(formatRequestsExplorerTotalResultsLabel('en', 12345)).toBe('12,345');
  });
});
