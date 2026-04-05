import { describe, expect, it } from 'vitest';

import { buildPublicRequestsQuery } from '@/lib/api/requests';

describe('buildPublicRequestsQuery', () => {
  it('clamps page/limit to safe backend bounds and derives offset from page', () => {
    const qs = new URLSearchParams(
      buildPublicRequestsQuery({
        page: -5,
        limit: 999,
      }),
    );

    expect(qs.get('page')).toBe('1');
    expect(qs.get('offset')).toBe('0');
    expect(qs.get('limit')).toBe('100');
  });

  it('normalizes explicit offset to non-negative integer and keeps page for compatibility', () => {
    const qs = new URLSearchParams(
      buildPublicRequestsQuery({
        page: 5,
        offset: -12,
      }),
    );

    expect(qs.get('offset')).toBe('0');
    expect(qs.get('page')).toBe('5');
  });

  it('derives offset from page when no explicit offset is provided', () => {
    const qs = new URLSearchParams(
      buildPublicRequestsQuery({
        page: 3,
        limit: 20,
      }),
    );

    expect(qs.get('page')).toBe('3');
    expect(qs.get('offset')).toBe('40');
    expect(qs.get('limit')).toBe('20');
  });
});
