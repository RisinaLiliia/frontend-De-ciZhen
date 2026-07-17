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
  it('builds public requests query state with placeholder seed for default filters', () => {
    const initialPublicRequests = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    } satisfies PublicRequestsResponseDto;

    const state = buildRequestsExplorerPublicRequestsQueryState({
      filter: { sort: 'date_desc', page: 1, limit: 20 },
      locale: 'de',
      preferInitialPublicRequests: true,
      initialPublicRequests,
    });

    expect(state.enabled).toBe(true);
    expect(state.placeholderData).toBe(initialPublicRequests);
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

  it('always enables the public requests query and skips absent initial data', () => {
    expect(
      buildRequestsExplorerPublicRequestsQueryState({
        filter: { sort: 'date_desc', page: 1, limit: 20 },
        locale: 'en',
        preferInitialPublicRequests: true,
        initialPublicRequests: undefined,
      }).enabled,
    ).toBe(true);

    expect(
      buildRequestsExplorerPublicRequestsQueryState({
        filter: { sort: 'date_desc', page: 1, limit: 20 },
        locale: 'en',
        preferInitialPublicRequests: true,
        initialPublicRequests: undefined,
      }).placeholderData,
    ).toBeUndefined();
  });

  it('does not attach mismatched initial data to a different page-size query', () => {
    const state = buildRequestsExplorerPublicRequestsQueryState({
      filter: { sort: 'date_desc', page: 1, limit: 20 },
      locale: 'en',
      preferInitialPublicRequests: true,
      initialPublicRequests: {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
      },
    });

    expect(state.placeholderData).toBeUndefined();
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
    expect(resolveRequestsExplorerOfferHref('request-123')).toBe(
      '/workspace?section=requests&scope=market&requestId=request-123&requestPanel=offer',
    );
    expect(resolveRequestsExplorerLoginHref('request-123')).toBe(
      '/auth/login?next=%2Fworkspace%3Fsection%3Drequests%26scope%3Dmarket%26requestId%3Drequest-123%26requestPanel%3Doffer',
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
