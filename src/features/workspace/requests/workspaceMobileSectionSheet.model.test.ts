import { describe, expect, it } from 'vitest';

import type { PersonalNavItem } from '@/components/layout/PersonalNavSection';

import {
  formatWorkspaceMobileSheetBadgeValue,
  hasWorkspaceMobileSheetHrefMatch,
  isWorkspaceMobileSheetItemActive,
  parseWorkspaceMobileSheetNumericValue,
  resolveWorkspaceMobileSheetBadgeValue,
  splitWorkspaceMobileSheetItems,
} from './workspaceMobileSectionSheet.model';

const baseItem: PersonalNavItem = {
  key: 'public-requests',
  href: '/workspace?section=requests',
  label: 'Requests',
  icon: null,
};

describe('workspaceMobileSectionSheet.model', () => {
  it('parses and formats badge values safely', () => {
    expect(parseWorkspaceMobileSheetNumericValue(12.6)).toBe(13);
    expect(parseWorkspaceMobileSheetNumericValue(' 24 offers ')).toBe(24);
    expect(parseWorkspaceMobileSheetNumericValue('none')).toBeNull();
    expect(formatWorkspaceMobileSheetBadgeValue(7)).toBe('7');
    expect(formatWorkspaceMobileSheetBadgeValue(120)).toBe('99+');
  });

  it('resolves badge visibility by item semantics', () => {
    expect(resolveWorkspaceMobileSheetBadgeValue({ ...baseItem, badgeValue: 0 })).toBe(0);
    expect(resolveWorkspaceMobileSheetBadgeValue({ ...baseItem, key: 'my-offers', badgeValue: 0 })).toBeNull();
    expect(resolveWorkspaceMobileSheetBadgeValue({ ...baseItem, key: 'reviews', value: '14 new' })).toBe(14);
  });

  it('splits items and resolves active href matches with query subset support', () => {
    const split = splitWorkspaceMobileSheetItems([
      { ...baseItem, key: 'a' },
      { ...baseItem, key: 'b', tier: 'secondary' },
    ]);

    expect(split.primaryItems).toHaveLength(1);
    expect(split.secondaryItems).toHaveLength(1);

    const searchParams = new URLSearchParams('section=requests&tab=my-offers');
    expect(hasWorkspaceMobileSheetHrefMatch(baseItem, '/workspace', searchParams)).toBe(true);
    expect(
      isWorkspaceMobileSheetItemActive(
        { ...baseItem, href: '/workspace', match: 'prefix' },
        '/workspace/profile',
        new URLSearchParams(),
      ),
    ).toBe(true);
    expect(
      isWorkspaceMobileSheetItemActive(
        { ...baseItem, disabled: true },
        '/workspace',
        searchParams,
      ),
    ).toBe(false);
  });
});
