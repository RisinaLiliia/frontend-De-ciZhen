import { describe, expect, it } from 'vitest';

import { buildPublicRequestsQuery } from '@/lib/api/requests';

describe('buildPublicRequestsQuery', () => {
  it('clamps page/limit to safe backend bounds', () => {
    const qs = new URLSearchParams(
      buildPublicRequestsQuery({
        page: -5,
        limit: 999,
      }),
    );

    expect(qs.get('page')).toBe('1');
    expect(qs.get('limit')).toBe('100');
  });

  it('normalizes offset to non-negative integer and omits page when offset is used', () => {
    const qs = new URLSearchParams(
      buildPublicRequestsQuery({
        page: 5,
        offset: -12,
      }),
    );

    expect(qs.get('offset')).toBe('0');
    expect(qs.has('page')).toBe(false);
  });
});
