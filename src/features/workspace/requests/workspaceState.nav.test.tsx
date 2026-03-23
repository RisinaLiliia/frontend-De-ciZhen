import { describe, expect, it, vi } from 'vitest';

import {
  buildPublicNavItems,
  buildWorkspaceNavHeader,
  buildWorkspacePersonalNavItems,
} from '@/features/workspace/requests/workspaceState.nav';

describe('workspaceState.nav', () => {
  it('builds public primary nav items with stable counters and request seen callback', () => {
    const markPublicRequestsSeen = vi.fn();
    const items = buildPublicNavItems({
      t: (key) => String(key),
      formatNumber: new Intl.NumberFormat('de-DE'),
      publicRequestsCount: 24,
      publicProvidersCount: 9,
      publicStatsCount: 24,
      activePublicSection: 'requests',
      markPublicRequestsSeen,
    });

    expect(items.map((item) => item.key)).toEqual([
      'public-requests',
      'public-providers',
      'public-stats',
    ]);
    expect(items[0]?.value).toBe('24');
    expect(typeof items[0]?.onClick).toBe('function');
    expect(items[0]?.forceActive).toBe(true);
  });

  it('builds personalized workspace nav with reviews and secondary tabs', () => {
    const items = buildWorkspacePersonalNavItems({
      t: (key) => String(key),
      formatNumber: new Intl.NumberFormat('de-DE'),
      isPersonalized: true,
      activeWorkspaceTab: 'my-offers',
      activePublicSection: null,
      publicRequestsCount: 24,
      publicProvidersCount: 9,
      publicStatsCount: 24,
      myRequestsTotal: 12,
      sentCount: 7,
      completedJobsCount: 3,
      favoriteRequestCount: 5,
      navRatingValue: '4.7',
      navReviewsCount: 11,
      markPublicRequestsSeen: vi.fn(),
      setWorkspaceTab: vi.fn(),
      guestLoginHref: '/auth/login',
      onGuestLockedAction: vi.fn(),
      reviewsHref: '/workspace?tab=reviews',
      reviewsMatch: 'exact',
      reviewsForceActive: false,
      includeCompletedJobsInSecondary: true,
    });

    expect(items.map((item) => item.key)).toEqual([
      'public-requests',
      'public-providers',
      'public-stats',
      'reviews',
      'my-requests',
      'my-offers',
      'completed-jobs',
      'my-favorites',
    ]);
    expect(items.find((item) => item.key === 'reviews')?.rating?.value).toBe('4.7');
    expect(items.find((item) => item.key === 'my-offers')?.forceActive).toBe(true);
  });

  it('builds guest workspace nav with locked private tabs and profile entry', () => {
    const items = buildWorkspacePersonalNavItems({
      t: (key) => String(key),
      formatNumber: new Intl.NumberFormat('de-DE'),
      isPersonalized: false,
      activeWorkspaceTab: 'my-requests',
      activePublicSection: 'requests',
      publicRequestsCount: 24,
      publicProvidersCount: 9,
      publicStatsCount: 24,
      myRequestsTotal: 0,
      sentCount: 0,
      completedJobsCount: 0,
      favoriteRequestCount: 0,
      navRatingValue: '4.7',
      navReviewsCount: 11,
      markPublicRequestsSeen: vi.fn(),
      setWorkspaceTab: vi.fn(),
      guestLoginHref: '/auth/login',
      onGuestLockedAction: vi.fn(),
      reviewsHref: '/workspace?section=reviews',
      reviewsForceActive: false,
    });

    expect(buildWorkspaceNavHeader({ t: (key) => String(key), userName: 'Anna' }).navTitle).toContain('Anna');
    expect(items.find((item) => item.key === 'guest-profile')?.tier).toBe('secondary');
    expect(items.find((item) => item.key === 'my-requests')?.lockedHref).toBe('/auth/login');
    expect(items.find((item) => item.key === 'my-favorites')?.lockedHref).toBeUndefined();
  });
});
