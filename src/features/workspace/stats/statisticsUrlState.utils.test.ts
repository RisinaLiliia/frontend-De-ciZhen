import { describe, expect, it } from 'vitest';

import { applyPageQuery, isPageQueryInSync, toPageQueryValue } from './statisticsUrlState.utils';

describe('statisticsUrlState.utils', () => {
  it('returns query value only for pages > 1', () => {
    expect(toPageQueryValue(1)).toBeNull();
    expect(toPageQueryValue(2)).toBe('2');
  });

  it('checks if page query is already in sync', () => {
    const params = new URLSearchParams('section=stats&statsCityPage=3');
    expect(isPageQueryInSync(params, 'statsCityPage', '3')).toBe(true);
    expect(isPageQueryInSync(params, 'statsCityPage', '2')).toBe(false);
    expect(isPageQueryInSync(params, 'statsCityPage', null)).toBe(false);
  });

  it('applies page query update and cleanup', () => {
    const params = new URLSearchParams('section=stats');
    applyPageQuery(params, 'statsCityPage', '4');
    expect(params.get('statsCityPage')).toBe('4');

    applyPageQuery(params, 'statsCityPage', null);
    expect(params.get('statsCityPage')).toBeNull();
  });
});
