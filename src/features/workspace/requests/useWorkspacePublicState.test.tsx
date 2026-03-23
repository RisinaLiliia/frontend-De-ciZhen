/** @vitest-environment happy-dom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { useWorkspacePublicState } from '@/features/workspace/requests/useWorkspacePublicState';

type StateArgs = Parameters<typeof useWorkspacePublicState>[0];

afterEach(() => {
  cleanup();
});

function makeArgs(overrides: Partial<StateArgs> = {}): StateArgs {
  return {
    t: (key) => String(key),
    isPersonalized: false,
    activeWorkspaceTab: 'my-requests',
    activePublicSection: 'requests',
    userName: 'Anna',
    publicRequestsCount: 24,
    publicProvidersCount: 9,
    publicStatsCount: 24,
    platformRatingAvg: 4.76,
    platformReviewsCount: 11,
    setWorkspaceTab: vi.fn(),
    markPublicRequestsSeen: vi.fn(),
    guestLoginHref: '/auth/login?next=%2Fworkspace',
    onGuestLockedAction: vi.fn(),
    formatNumber: new Intl.NumberFormat('de-DE'),
    ...overrides,
  };
}

function StateProbe(props: StateArgs) {
  const state = useWorkspacePublicState(props);
  const requestsItem = state.personalNavItems.find((item) => item.key === 'public-requests');
  const reviewsItem = state.personalNavItems.find((item) => item.key === 'reviews');

  return (
    <div
      data-testid="state"
      data-nav-title={state.navTitle}
      data-nav-subtitle={state.navSubtitle}
      data-nav-count={String(state.personalNavItems.length)}
      data-requests-value={String(requestsItem?.value ?? '')}
      data-requests-has-callback={String(typeof requestsItem?.onClick === 'function')}
      data-reviews-rating={String(reviewsItem?.rating?.value ?? '')}
      data-progress={String(state.activityProgress)}
      data-insight={state.insightText}
    />
  );
}

describe('useWorkspacePublicState', () => {
  it('builds public nav items and review meta from platform counters', () => {
    render(<StateProbe {...makeArgs()} />);

    const node = screen.getByTestId('state');
    expect(node.getAttribute('data-nav-title')).toContain('Anna');
    expect(node.getAttribute('data-nav-subtitle')).toBe('requestsPage.navSubtitle');
    expect(node.getAttribute('data-nav-count')).toBe('8');
    expect(node.getAttribute('data-requests-value')).toBe('24');
    expect(node.getAttribute('data-requests-has-callback')).toBe('true');
    expect(node.getAttribute('data-reviews-rating')).toBe('4.8');
    expect(node.getAttribute('data-progress')).toBe('12');
    expect(node.getAttribute('data-insight')).toBe('');
  });

  it('keeps personalized mode compatible with the same public-state contract', () => {
    render(
      <StateProbe
        {...makeArgs({
          isPersonalized: true,
          activePublicSection: 'reviews',
        })}
      />,
    );

    const node = screen.getByTestId('state');
    expect(node.getAttribute('data-nav-count')).toBe('8');
    expect(node.getAttribute('data-reviews-rating')).toBe('4.8');
    expect(node.getAttribute('data-progress')).toBe('12');
  });
});
