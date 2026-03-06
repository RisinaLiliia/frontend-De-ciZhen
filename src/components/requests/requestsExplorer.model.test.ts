import { describe, expect, it } from 'vitest';

import type { OfferDto } from '@/lib/api/dto/offers';
import {
  buildOffersByRequestMap,
  hasDefaultPublicFilter,
  resolveTotalPages,
} from '@/components/requests/requestsExplorer.model';

describe('requestsExplorer.model', () => {
  it('detects default public filter state', () => {
    expect(hasDefaultPublicFilter({ sort: 'date_desc', page: 1, limit: 10 })).toBe(true);
    expect(hasDefaultPublicFilter({ cityId: 'berlin', sort: 'date_desc', page: 1, limit: 10 })).toBe(false);
    expect(hasDefaultPublicFilter({ sort: 'price_desc', page: 1, limit: 10 })).toBe(false);
  });

  it('keeps latest offer per request in offers map', () => {
    const older = {
      id: 'offer-old',
      requestId: 'req-1',
      updatedAt: '2026-03-01T10:00:00.000Z',
    } as OfferDto;
    const newer = {
      id: 'offer-new',
      requestId: 'req-1',
      updatedAt: '2026-03-03T10:00:00.000Z',
    } as OfferDto;
    const otherRequest = {
      id: 'offer-2',
      requestId: 'req-2',
      updatedAt: '2026-03-02T10:00:00.000Z',
    } as OfferDto;

    const byRequest = buildOffersByRequestMap([older, newer, otherRequest]);

    expect(byRequest.size).toBe(2);
    expect(byRequest.get('req-1')?.id).toBe('offer-new');
    expect(byRequest.get('req-2')?.id).toBe('offer-2');
  });

  it('resolves total pages safely', () => {
    expect(resolveTotalPages(0, 10)).toBe(1);
    expect(resolveTotalPages(21, 10)).toBe(3);
    expect(resolveTotalPages(21, 0)).toBe(21);
  });
});
