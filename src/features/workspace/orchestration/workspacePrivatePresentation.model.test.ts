import { describe, expect, it, vi } from 'vitest';

import type { I18nKey } from '@/lib/i18n/keys';
import { DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF } from '@/features/workspace/requests/workspaceRequestRoute.model';

import {
  buildWorkspacePrivateStateArgs,
  buildWorkspacePublicIntroProps,
  buildWorkspacePublicSummaryView,
  resolveWorkspaceEffectiveRequestsRole,
  resolveWorkspacePrivateRequestsLoading,
} from './workspacePrivatePresentation.model';

function createBranch() {
  return {
    t: (key: I18nKey) => String(key),
    locale: 'en',
    auth: { user: { name: 'Liliya' } },
    isAuthed: true,
    isWorkspaceAuthed: true,
    isPersonalized: true,
    routeState: {} as never,
  };
}

function createData() {
  return {
    activePublicSection: 'requests',
    activeWorkspaceTab: 'my-offers',
    providerDirectoryState: {
      items: [{ id: 'provider-1' }],
      isLoading: false,
      isError: true,
      byId: new Map([['provider-1', { id: 'provider-1' }]]),
    },
    favoriteProvidersState: {
      items: [{ id: 'provider-1' }],
      isLoading: false,
      ids: new Set(['provider-1']),
      lookup: new Set(['provider-1']),
      roleLabelsById: new Map([['provider-1', 'Role']]),
      cityLabelsById: new Map([['provider-1', 'Berlin']]),
    },
    platformRequestsTotal: 12,
    allRequestsSummary: undefined,
    privateOverviewState: {
      activityProgress: 75,
      navRatingValue: '4.8',
      navReviewsCount: 12,
      preferredRequestsRole: 'provider',
      myRequestsTotal: 6,
      sentCount: 4,
      completedJobsCount: 2,
      favoriteRequestCount: 3,
    },
    setWorkspaceTab: vi.fn(),
    markPublicRequestsSeen: vi.fn(),
    guestLoginHref: '/auth/login',
    onGuestLockedAction: vi.fn(),
    formatNumber: new Intl.NumberFormat('en'),
    publicCityActivity: [],
    isPublicSummaryLoading: false,
    isPublicSummaryError: false,
    requestsScope: 'market',
    activeRequestsRole: 'all',
  };
}

describe('workspacePrivatePresentation.model', () => {
  it('builds private state args with provider-count fallback and public intro props', () => {
    const branch = createBranch();
    const data = createData();

    const privateStateArgs = buildWorkspacePrivateStateArgs({
      branch: branch as never,
      data: data as never,
    });
    const publicIntroProps = buildWorkspacePublicIntroProps({
      branch: branch as never,
      data: data as never,
    });

    expect(privateStateArgs.publicProvidersCount).toBe(1);
    expect(privateStateArgs.userName).toBe('Liliya');
    expect(publicIntroProps.activePublicSection).toBe('requests');
    expect(publicIntroProps.activeWorkspaceTab).toBe('my-offers');
    expect(publicIntroProps.quickActionHref).toBe(DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF);
    expect(publicIntroProps.hideDemandMapOnMobile).toBe(true);
    expect(publicIntroProps.isMapLoading).toBe(false);
  });

  it('passes explicit preferred role for unified private requests with a concrete route role', () => {
    const branch = createBranch();
    const data = {
      ...createData(),
      activeWorkspaceTab: 'my-requests',
      requestsScope: 'my',
      activeRequestsRole: 'customer',
    };

    const privateStateArgs = buildWorkspacePrivateStateArgs({
      branch: branch as never,
      data: data as never,
    });

    expect(privateStateArgs.privateOverviewState?.preferredRequestsRole).toBe('customer');
  });

  it('resolves effective requests role from preferred role only for the all mode', () => {
    expect(
      resolveWorkspaceEffectiveRequestsRole({
        activeRequestsRole: 'all',
        preferredRequestsRole: 'provider',
      }),
    ).toBe('provider');

    expect(
      resolveWorkspaceEffectiveRequestsRole({
        activeRequestsRole: 'customer',
        preferredRequestsRole: 'provider',
      }),
    ).toBe('customer');
  });

  it('keeps private requests loading scoped to the fallback overview path', () => {
    expect(
      resolveWorkspacePrivateRequestsLoading({
        workspaceRequests: { requests: [] } as never,
        isWorkspaceRequestsLoading: true,
        activeRequestsRole: 'all',
        isWorkspacePrivateRequestsFallbackLoading: false,
      }),
    ).toBe(true);

    expect(
      resolveWorkspacePrivateRequestsLoading({
        workspaceRequests: null,
        isWorkspaceRequestsLoading: false,
        activeRequestsRole: 'all',
        isWorkspacePrivateRequestsFallbackLoading: true,
      }),
    ).toBe(true);
  });

  it('builds public summary view from canonical summary payloads', () => {
    expect(
      buildWorkspacePublicSummaryView({
        allRequestsSummary: { totalPublishedRequests: 2 } as never,
        publicCityActivity: { items: [] } as never,
        isPublicSummaryLoading: false,
        isPublicSummaryError: true,
      }),
    ).toEqual({
      cityActivity: { items: [] },
      summary: { totalPublishedRequests: 2 },
      isMapLoading: false,
      isMapError: true,
    });
  });
});
