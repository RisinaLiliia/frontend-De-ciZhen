import { describe, expect, it } from 'vitest';

import { EMPTY_WORKSPACE_PRIVATE_OVERVIEW } from '@/features/workspace/requests/workspacePrivateState.constants';
import {
  buildWorkspacePrivateNavModelArgs,
  resolveWorkspacePreferredRequestsRole,
  buildWorkspacePrivateTopProvidersArgs,
  resolveWorkspacePrivateMeta,
  resolveWorkspacePrivateOverview,
  resolveWorkspacePrivateStateResult,
} from './workspacePrivateState.model';

describe('workspacePrivateState.model', () => {
  it('falls back to empty overview when private overview is missing', () => {
    expect(resolveWorkspacePrivateOverview(null)).toEqual(EMPTY_WORKSPACE_PRIVATE_OVERVIEW);
  });

  it('derives activity progress and rating meta from overview', () => {
    const overview = structuredClone(EMPTY_WORKSPACE_PRIVATE_OVERVIEW);
    overview.kpis.activityProgress = 132;
    overview.ratingSummary = {
      average: 4.74,
      count: 8,
    };

    const meta = resolveWorkspacePrivateMeta({
      overview,
    });

    expect(meta.activityProgress).toBe(100);
    expect(meta.navRatingValue).toBe('4.7');
    expect(meta.navReviewsCount).toBe(8);
  });

  it('derives preferred requests role from overview', () => {
    const overview = structuredClone(EMPTY_WORKSPACE_PRIVATE_OVERVIEW);
    overview.preferredRole = 'provider';

    expect(resolveWorkspacePreferredRequestsRole(overview)).toBe('provider');
  });

  it('builds private state sub-hook args and final state result from overview counters', () => {
    const overview = structuredClone(EMPTY_WORKSPACE_PRIVATE_OVERVIEW);
    overview.requestsByStatus.total = 12;
    overview.providerOffersByStatus.sent = 7;
    overview.providerContractsByStatus.completed = 3;
    overview.favorites.requests = 5;

    const navArgs = buildWorkspacePrivateNavModelArgs({
      t: (key) => String(key),
      formatNumber: new Intl.NumberFormat('de-DE'),
      isPersonalized: true,
      activeWorkspaceTab: 'my-requests',
      activePublicSection: null,
      userName: 'Anna',
      publicRequestsCount: 10,
      publicProvidersCount: 4,
      publicStatsCount: 10,
      overview,
      navRatingValue: '4.7',
      navReviewsCount: 8,
      setWorkspaceTab: () => undefined,
      markPublicRequestsSeen: () => undefined,
      guestLoginHref: '/auth/login',
      onGuestLockedAction: () => undefined,
    });
    const topProvidersArgs = buildWorkspacePrivateTopProvidersArgs({
      t: (key) => String(key),
      locale: 'de',
      providers: [],
    });

    expect(navArgs.myRequestsTotal).toBe(12);
    expect(navArgs.sentCount).toBe(7);
    expect(navArgs.completedJobsCount).toBe(3);
    expect(navArgs.favoriteRequestCount).toBe(5);
    expect(topProvidersArgs.providers).toEqual([]);

    expect(
      resolveWorkspacePrivateStateResult({
        topProviders: [],
        activityProgress: 100,
        preferredRequestsRole: 'provider',
        nav: {
          navTitle: 'Title',
          navSubtitle: 'Subtitle',
          personalNavItems: [],
        },
      }),
    ).toEqual({
      topProviders: [],
      navTitle: 'Title',
      navSubtitle: 'Subtitle',
      activityProgress: 100,
      preferredRequestsRole: 'provider',
      personalNavItems: [],
    });
  });
});
