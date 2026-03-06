/** @vitest-environment happy-dom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
import { EMPTY_WORKSPACE_PRIVATE_OVERVIEW } from '@/features/workspace/requests/workspacePrivateState.constants';
import { useWorkspacePrivateState } from '@/features/workspace/requests/useWorkspacePrivateState';

type StateArgs = Parameters<typeof useWorkspacePrivateState>[0];

afterEach(() => {
  cleanup();
});

function makeOverview(): WorkspacePrivateOverviewDto {
  return structuredClone(EMPTY_WORKSPACE_PRIVATE_OVERVIEW);
}

function makeArgs(overrides: Partial<StateArgs> = {}): StateArgs {
  return {
    t: (key) => String(key),
    locale: 'de',
    isPersonalized: true,
    activeWorkspaceTab: 'my-requests',
    activePublicSection: null,
    userName: 'Anna',
    myOffers: [],
    providers: [],
    publicRequestsCount: 10,
    publicProvidersCount: 4,
    publicStatsCount: 10,
    workspacePrivateOverview: makeOverview(),
    setWorkspaceTab: vi.fn(),
    markPublicRequestsSeen: vi.fn(),
    guestLoginHref: '/auth/login?next=%2Fworkspace',
    onGuestLockedAction: vi.fn(),
    formatNumber: new Intl.NumberFormat('de-DE'),
    chartMonthLabel: new Intl.DateTimeFormat('de-DE', { month: 'short' }),
    ...overrides,
  };
}

function StateProbe(props: StateArgs) {
  const state = useWorkspacePrivateState(props);
  const myRequestsItem = state.personalNavItems.find((item) => item.key === 'my-requests');
  const reviewsItem = state.personalNavItems.find((item) => item.key === 'reviews');

  return (
    <div
      data-testid="state"
      data-nav-title={state.navTitle}
      data-nav-count={String(state.personalNavItems.length)}
      data-my-requests-value={String(myRequestsItem?.value ?? '')}
      data-my-requests-locked={String(Boolean(myRequestsItem?.lockedHref))}
      data-reviews-rating={String(reviewsItem?.rating?.value ?? '')}
      data-progress={String(state.activityProgress)}
      data-stats-first={state.statsOrder[0]?.tab ?? ''}
      data-top-providers={String(state.topProviders.length)}
    />
  );
}

describe('useWorkspacePrivateState', () => {
  it('builds personalized nav and stats payload from private overview counters', () => {
    const overview = makeOverview();
    overview.requestsByStatus.total = 12;
    overview.providerOffersByStatus.sent = 7;
    overview.providerContractsByStatus.completed = 3;
    overview.favorites.requests = 5;
    overview.kpis.activityProgress = 132;
    overview.kpis.acceptanceRate = 64;
    overview.kpis.providerActiveContracts = 2;
    overview.kpis.recentOffers7d = 3;
    overview.insights.providerCompletedDeltaKind = 'percent';
    overview.insights.providerCompletedDeltaPercent = 18;
    overview.insights.providerCompletedThisMonth = 4;

    const ratedOffer = {
      id: 'offer-1',
      requestId: 'req-1',
      providerRatingAvg: 4.74,
      providerRatingCount: 8,
    } as OfferDto;

    render(
      <StateProbe
        {...makeArgs({
          myOffers: [ratedOffer],
          workspacePrivateOverview: overview,
        })}
      />,
    );

    const node = screen.getByTestId('state');
    expect(node.getAttribute('data-nav-title')).toContain('Anna');
    expect(node.getAttribute('data-nav-count')).toBe('8');
    expect(node.getAttribute('data-my-requests-value')).toBe('12');
    expect(node.getAttribute('data-my-requests-locked')).toBe('false');
    expect(node.getAttribute('data-reviews-rating')).toBe('4.7');
    expect(node.getAttribute('data-progress')).toBe('100');
    expect(node.getAttribute('data-stats-first')).toBe('provider');
    expect(node.getAttribute('data-top-providers')).toBe('0');
  });

  it('locks private tabs for guests and keeps public items available', () => {
    render(
      <StateProbe
        {...makeArgs({
          isPersonalized: false,
          userName: null,
          activeWorkspaceTab: 'my-offers',
          activePublicSection: 'requests',
        })}
      />,
    );

    const node = screen.getByTestId('state');
    expect(node.getAttribute('data-nav-count')).toBe('7');
    expect(node.getAttribute('data-my-requests-locked')).toBe('true');
    expect(node.getAttribute('data-my-requests-value')).toBe('');
  });
});
