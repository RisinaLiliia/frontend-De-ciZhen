import { describe, expect, it } from 'vitest';

import { mapOpportunityBadgeVariant } from './statisticsRail.mapper';

describe('statisticsRail.mapper semantic badge mapping', () => {
  it('maps market opportunity tones to semantic workspace badge variants', () => {
    expect(mapOpportunityBadgeVariant('chance')).toBe('success');
    expect(mapOpportunityBadgeVariant('risk')).toBe('risk');
    expect(mapOpportunityBadgeVariant('action')).toBe('warning');
    expect(mapOpportunityBadgeVariant('signal')).toBe('warning');
  });
});
