/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import type { I18nKey } from '@/lib/i18n/keys';

import { useWorkspaceDerived } from './useWorkspaceDerived';

afterEach(() => {
  cleanup();
});

function Probe({ enabled }: { enabled?: boolean }) {
  const derived = useWorkspaceDerived({
    enabled,
    t: (key: I18nKey) => String(key),
    activeStatusFilter: 'all',
    activeWorkspaceTab: 'my-offers',
    activeFavoritesView: 'requests',
    myRequests: [{ id: 'req-1' }] as never[],
    myOffers: [{ id: 'offer-1', requestId: 'req-1' }] as never[],
    myOfferRequestsById: new Map([['req-1', { id: 'req-1' }]]) as never,
    allMyContracts: [{ id: 'contract-1', requestId: 'req-1' }] as never[],
    favoriteRequests: [{ id: 'req-1' }],
    favoriteProviders: [{ id: 'provider-1' }],
    isFavoriteRequestsLoading: false,
    isFavoriteProvidersLoading: false,
  });

  return (
    <div
      data-testid="derived"
      data-my-requests={String(derived.filteredMyRequests.length)}
      data-my-offers={String(derived.filteredMyOffers.length)}
      data-contracts={String(derived.filteredContracts.length)}
      data-favorites={String(derived.favoritesItems.length)}
      data-primary-action={derived.primaryAction.href}
    />
  );
}

function ProfileProbe() {
  const derived = useWorkspaceDerived({
    enabled: true,
    t: (key: I18nKey) => String(key),
    activeStatusFilter: 'all',
    activeWorkspaceTab: 'profile',
    activeFavoritesView: 'providers',
    myRequests: [{ id: 'req-1' }] as never[],
    myOffers: [{ id: 'offer-1', requestId: 'req-1' }] as never[],
    myOfferRequestsById: new Map([['req-1', { id: 'req-1' }]]) as never,
    allMyContracts: [{ id: 'contract-1', requestId: 'req-1' }] as never[],
    favoriteRequests: [{ id: 'req-1' }],
    favoriteProviders: [{ id: 'provider-1' }],
    isFavoriteRequestsLoading: false,
    isFavoriteProvidersLoading: false,
  });

  return (
    <div
      data-testid="profile-derived"
      data-my-requests={String(derived.filteredMyRequests.length)}
      data-my-offers={String(derived.filteredMyOffers.length)}
      data-contracts={String(derived.filteredContracts.length)}
      data-favorites={String(derived.favoritesItems.length)}
      data-filters={String(derived.statusFilters.length)}
    />
  );
}

describe('useWorkspaceDerived', () => {
  it('returns idle collections but preserves primary action when disabled', () => {
    render(<Probe enabled={false} />);

    const node = screen.getByTestId('derived');
    expect(node.getAttribute('data-my-requests')).toBe('0');
    expect(node.getAttribute('data-my-offers')).toBe('0');
    expect(node.getAttribute('data-contracts')).toBe('0');
    expect(node.getAttribute('data-favorites')).toBe('0');
    expect(node.getAttribute('data-primary-action')).toBe(
      '/workspace?section=requests&scope=my&period=90d&range=90d',
    );
  });

  it('builds only the active tab collection when enabled', () => {
    render(<Probe enabled />);

    const node = screen.getByTestId('derived');
    expect(node.getAttribute('data-my-requests')).toBe('0');
    expect(node.getAttribute('data-my-offers')).toBe('1');
    expect(node.getAttribute('data-contracts')).toBe('0');
    expect(node.getAttribute('data-favorites')).toBe('0');
  });

  it('skips unrelated request-side derivations for profile tab', () => {
    render(<ProfileProbe />);

    const node = screen.getByTestId('profile-derived');
    expect(node.getAttribute('data-my-requests')).toBe('0');
    expect(node.getAttribute('data-my-offers')).toBe('0');
    expect(node.getAttribute('data-contracts')).toBe('0');
    expect(node.getAttribute('data-favorites')).toBe('0');
    expect(node.getAttribute('data-filters')).toBe('0');
  });
});
