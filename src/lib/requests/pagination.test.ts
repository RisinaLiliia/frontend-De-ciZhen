import { describe, it, expect } from 'vitest';

import {
  resolveRequestsListDensityForPageSize,
  resolveRequestsPageSizeForDensity,
  REQUESTS_PAGE_SIZE_SINGLE,
  REQUESTS_PAGE_SIZE_DOUBLE,
} from './pagination';

describe('requests pagination density helpers', () => {
  it('resolveRequestsListDensityForPageSize returns expected densities', () => {
    expect(resolveRequestsListDensityForPageSize(9)).toBe('single');
    expect(resolveRequestsListDensityForPageSize(10)).toBe('single');
    expect(resolveRequestsListDensityForPageSize(19)).toBe('single');
    expect(resolveRequestsListDensityForPageSize(20)).toBe('double');
  });

  it('resolveRequestsPageSizeForDensity returns expected page sizes', () => {
    expect(resolveRequestsPageSizeForDensity('single')).toBe(REQUESTS_PAGE_SIZE_SINGLE);
    expect(resolveRequestsPageSizeForDensity('double')).toBe(REQUESTS_PAGE_SIZE_DOUBLE);
  });
});
