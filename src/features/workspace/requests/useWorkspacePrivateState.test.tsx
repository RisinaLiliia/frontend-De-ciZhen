/** @vitest-environment happy-dom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { EMPTY_WORKSPACE_PRIVATE_OVERVIEW } from '@/features/workspace/state/workspacePrivateState.constants';
import { useWorkspacePrivateState } from '@/features/workspace/state/useWorkspacePrivateState';
import {
  resolveWorkspacePrivateOverviewState,
  shouldBuildWorkspacePrivateTopProviders,
} from '@/features/workspace/state/workspacePrivateState.model';

type StateArgs = Parameters<typeof useWorkspacePrivateState>[0];

afterEach(() => {
  cleanup();
});

function makeOverview() {
  return structuredClone(EMPTY_WORKSPACE_PRIVATE_OVERVIEW);
}

function makeArgs(overrides: Partial<StateArgs> = {}): StateArgs {
  return {
    t: (key) => String(key),
    locale: 'de',
    isPersonalized: true,
    activeWorkspaceTab: 'my-requests',
    activePublicSection: null,
    requestsScope: 'market',
    userName: 'Anna',
    providers: [],
    publicRequestsCount: 10,
    publicProvidersCount: 4,
    publicStatsCount: 10,
    privateOverviewState: resolveWorkspacePrivateOverviewState(makeOverview()),
    setWorkspaceTab: vi.fn(),
    markPublicRequestsSeen: vi.fn(),
    guestLoginHref: '/auth/login?next=%2Fworkspace',
    onGuestLockedAction: vi.fn(),
    formatNumber: new Intl.NumberFormat('de-DE'),
    ...overrides,
  };
}

function StateProbe(props: StateArgs) {
  const state = useWorkspacePrivateState(props);
  const myRequestsItem = state.personalNavItems.find((item) => item.key === 'my-requests');
  const primaryItemsCount = state.personalNavItems.filter((item) => item.tier === 'primary').length;
  const secondaryItemsCount = state.personalNavItems.filter((item) => item.tier === 'secondary').length;

  return (
    <div
      data-testid="state"
      data-nav-title={state.navTitle}
      data-nav-count={String(state.personalNavItems.length)}
      data-my-requests-value={String(myRequestsItem?.value ?? '')}
      data-my-requests-locked={String(Boolean(myRequestsItem?.lockedHref))}
      data-progress={String(state.activityProgress)}
      data-top-providers={String(state.topProviders.length)}
      data-preferred-role={state.preferredRequestsRole ?? ''}
      data-primary-count={String(primaryItemsCount)}
      data-secondary-count={String(secondaryItemsCount)}
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
    overview.ratingSummary = {
      average: 4.74,
      count: 8,
    };

    render(
      <StateProbe
        {...makeArgs({
          privateOverviewState: resolveWorkspacePrivateOverviewState(overview),
        })}
      />,
    );

    const node = screen.getByTestId('state');
    expect(node.getAttribute('data-nav-title')).toContain('Anna');
    expect(node.getAttribute('data-nav-count')).toBe('5');
    expect(node.getAttribute('data-my-requests-value')).toBe('12');
    expect(node.getAttribute('data-my-requests-locked')).toBe('false');
    expect(node.getAttribute('data-progress')).toBe('100');
    expect(node.getAttribute('data-top-providers')).toBe('0');
    expect(node.getAttribute('data-primary-count')).toBe('3');
    expect(node.getAttribute('data-secondary-count')).toBe('2');
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
    expect(node.getAttribute('data-nav-count')).toBe('6');
    expect(node.getAttribute('data-my-requests-locked')).toBe('true');
    expect(node.getAttribute('data-my-requests-value')).toBe('');
    expect(node.getAttribute('data-primary-count')).toBe('3');
    expect(node.getAttribute('data-secondary-count')).toBe('3');
  });

  it('skips top providers in unified private requests mode', () => {
    expect(shouldBuildWorkspacePrivateTopProviders({
      activePublicSection: 'requests',
      requestsScope: 'my',
    })).toBe(false);

    expect(shouldBuildWorkspacePrivateTopProviders({
      activePublicSection: 'requests',
      requestsScope: 'market',
    })).toBe(true);

    render(
      <StateProbe
        {...makeArgs({
          activePublicSection: 'requests',
          requestsScope: 'my',
          providers: [{ id: 'provider-1', ratingAvg: 4.9, reviewCount: 10 } as never],
        })}
      />,
    );

    const node = screen.getByTestId('state');
    expect(node.getAttribute('data-top-providers')).toBe('0');
  });

  it('prefers an explicit requests role over overview preferred role when provided', () => {
    const overview = makeOverview();
    overview.preferredRole = 'provider';

    render(
      <StateProbe
        {...makeArgs({
          privateOverviewState: {
            ...resolveWorkspacePrivateOverviewState(overview),
            preferredRequestsRole: 'customer',
          },
        })}
      />,
    );

    const node = screen.getByTestId('state');
    expect(node.getAttribute('data-preferred-role')).toBe('customer');
  });
});
