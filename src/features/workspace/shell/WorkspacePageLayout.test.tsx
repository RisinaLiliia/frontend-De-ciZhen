/** @vitest-environment happy-dom */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkspacePageLayout } from '@/features/workspace/shell/WorkspacePageLayout';

vi.mock('next/navigation', () => ({
  usePathname: () => '/workspace',
  useSearchParams: () => new URLSearchParams('section=providers'),
}));

vi.mock('@/features/workspace/shared', () => ({
  WorkspaceTopProvidersAside: () => <div data-testid="workspace-top-providers-aside" />,
  useIsDesktop: () => true,
}));

vi.mock('@/features/workspace/explore', () => ({
  WorkspaceExploreSection: () => <div data-testid="workspace-explore-section" />,
  WorkspaceExploreRail: () => <div data-testid="workspace-explore-rail" />,
  isWorkspaceExploreRailSection: (section: string) => section === 'providers' || section === 'profile' || section === 'requests',
}));

vi.mock('@/features/workspace/shell/WorkspaceShell', () => ({
  WorkspaceShell: ({
    children,
    sidebar,
    bottomNav,
  }: {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    bottomNav?: React.ReactNode;
  }) => (
    <div
      data-testid="workspace-shell"
      data-has-sidebar={sidebar ? 'true' : 'false'}
      data-has-bottom-nav={bottomNav ? 'true' : 'false'}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/features/workspace/shell/WorkspaceSidebar', () => ({
  WorkspaceSidebar: () => <div data-testid="workspace-sidebar" />,
}));

vi.mock('@/features/workspace/shell/WorkspaceBottomNav', () => ({
  WorkspaceBottomNav: () => <div data-testid="workspace-bottom-nav" />,
}));

vi.mock('@/features/workspace/shell/WorkspaceContextFocusPanel', () => ({
  WorkspaceContextAside: ({ children }: { children?: React.ReactNode }) => (
    <aside data-testid="workspace-context-aside">{children}</aside>
  ),
}));

describe('WorkspacePageLayout', () => {
  it('renders public explore sections through WorkspaceShell', () => {
    render(
      <WorkspacePageLayout
        isWorkspacePublicSection={true}
        isWorkspaceAuthed={false}
        activePublicSection="providers"
        activeWorkspaceTab="my-requests"
        t={(key) => key}
        locale="de"
        intro={<div>intro</div>}
        explore={{
          exploreListDensity: 'double',
          setExploreListDensity: vi.fn(),
          sidebarNearbyLimit: 3,
          sidebarTopProvidersLimit: 3,
          sidebarProofCases: [],
          proofIndex: 0,
        }}
        privateMain={null}
        publicMain={null}
        workspaceAsideBaseProps={{
          isLoading: false,
          isError: false,
          errorLabel: '',
          title: '',
          subtitle: '',
          ctaLabel: '',
          providers: [],
          favoriteProviderIds: new Set(),
        }}
        pendingFavoriteProviderIds={new Set()}
        onToggleProviderFavorite={vi.fn()}
      />,
    );

    const shell = screen.getByTestId('workspace-shell');
    expect(shell.getAttribute('data-has-sidebar')).toBe('true');
    expect(shell.getAttribute('data-has-bottom-nav')).toBe('false');
    expect(screen.getByTestId('workspace-explore-section')).toBeTruthy();
  });
});
