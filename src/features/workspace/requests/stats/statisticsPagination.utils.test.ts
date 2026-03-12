import { describe, expect, it } from 'vitest';

import { paginateItems, parsePageParam } from './statisticsPagination.utils';

describe('statisticsPagination.utils', () => {
  describe('parsePageParam', () => {
    it('parses positive integer values', () => {
      expect(parsePageParam('1')).toBe(1);
      expect(parsePageParam('15')).toBe(15);
    });

    it('returns null for invalid values', () => {
      expect(parsePageParam(null)).toBeNull();
      expect(parsePageParam('')).toBeNull();
      expect(parsePageParam('0')).toBeNull();
      expect(parsePageParam('-2')).toBeNull();
      expect(parsePageParam('abc')).toBeNull();
    });
  });

  describe('paginateItems', () => {
    it('returns clamped page and visible items for requested page', () => {
      const result = paginateItems([1, 2, 3, 4, 5, 6], 2, 2);
      expect(result.totalPages).toBe(3);
      expect(result.safePage).toBe(2);
      expect(result.startIndex).toBe(2);
      expect(result.visibleItems).toEqual([3, 4]);
    });

    it('clamps out-of-range page to bounds', () => {
      const high = paginateItems(['a', 'b', 'c'], 99, 2);
      expect(high.safePage).toBe(2);
      expect(high.visibleItems).toEqual(['c']);

      const low = paginateItems(['a', 'b', 'c'], 0, 2);
      expect(low.safePage).toBe(1);
      expect(low.visibleItems).toEqual(['a', 'b']);
    });

    it('keeps stable defaults for empty list', () => {
      const result = paginateItems([], 5, 10);
      expect(result.totalPages).toBe(1);
      expect(result.safePage).toBe(1);
      expect(result.startIndex).toBe(0);
      expect(result.visibleItems).toEqual([]);
    });
  });
});
