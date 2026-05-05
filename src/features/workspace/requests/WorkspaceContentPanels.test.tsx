// @vitest-environment jsdom

import * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WorkspaceContentPanels } from '@/features/workspace/requests/WorkspaceContentPanels';

let queryString = '';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(queryString),
}));

vi.mock('@/features/workspace/requests/WorkspaceProfileOnboardingForm', () => ({
  WorkspaceProfileOnboardingForm: ({ viewerMode }: { viewerMode: 'provider' | 'customer' }) => (
    <div data-testid="workspace-profile-form" data-viewer-mode={viewerMode} />
  ),
}));

afterEach(() => {
  cleanup();
});

function renderPanels() {
  render(
    <WorkspaceContentPanels
      t={(key) => String(key)}
      isWorkspaceAuthed
      activeWorkspaceTab="profile"
      showWorkspaceHeading={false}
      myRequestsState={{ isLoading: false, isEmpty: true }}
      myRequestsListProps={{ items: [] } as never}
      myOffersState={{ isLoading: false, isEmpty: true }}
      myOffersListProps={{ items: [] } as never}
      contractsState={{ isLoading: false, isEmpty: true }}
      contractsListProps={{ items: [] } as never}
      favoritesState={{
        isLoading: false,
        isEmpty: true,
        hasFavoriteRequests: false,
        hasFavoriteProviders: false,
        resolvedView: 'requests',
      }}
      onFavoritesViewChange={vi.fn()}
      favoriteRequestsListProps={{ items: [] } as never}
      favoriteProvidersNode={null}
      reviewsState={{ isLoading: false, items: [] }}
    />,
  );
}

describe('WorkspaceContentPanels', () => {
  it('renders provider profile form by default', () => {
    queryString = 'section=actions';
    renderPanels();

    expect(screen.getByTestId('workspace-profile-form').getAttribute('data-viewer-mode')).toBe('provider');
  });

  it('renders customer profile form when viewerMode=customer', () => {
    queryString = 'section=actions&viewerMode=customer';
    renderPanels();

    expect(screen.getByTestId('workspace-profile-form').getAttribute('data-viewer-mode')).toBe('customer');
  });
});
