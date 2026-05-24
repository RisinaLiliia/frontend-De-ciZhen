/** @vitest-environment happy-dom */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkspacePageLayout } from '@/features/workspace/shell/WorkspacePageLayout';

let isDesktopMock = true;
let isWideDesktopMock = true;
let isMobileMock = false;

vi.mock('next/navigation', () => ({
  usePathname: () => '/workspace',
  useSearchParams: () => new URLSearchParams('section=providers'),
}));

vi.mock('@/features/workspace/shared', () => ({
  WorkspaceTopProvidersAside: () => <div data-testid="workspace-top-providers-aside" />,
  useIsDesktop: () => isDesktopMock,
  useIsWideDesktop: () => isWideDesktopMock,
  useMediaMatch: () => isMobileMock,
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
    topBar,
  }: {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    bottomNav?: React.ReactNode;
    topBar?: React.ReactNode;
  }) => (
    <div
      data-testid="workspace-shell"
      data-has-sidebar={sidebar ? 'true' : 'false'}
      data-has-bottom-nav={bottomNav ? 'true' : 'false'}
      data-has-topbar={topBar ? 'true' : 'false'}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/features/workspace/shell/WorkspaceSidebar', () => ({
  WorkspaceSidebar: () => <div data-testid="workspace-sidebar" />,
}));

vi.mock('@/features/workspace/shell/WorkspaceMobileNavigation', () => ({
  WorkspaceMobileNavigation: () => <div data-testid="workspace-mobile-navigation" />,
}));

vi.mock('@/features/workspace/shell/WorkspaceContextAside', () => ({
  WorkspaceContextAside: ({ children }: { children?: React.ReactNode }) => (
    <aside data-testid="workspace-context-aside">{children}</aside>
  ),
}));

describe('WorkspacePageLayout', () => {
  it('renders public explore sections through WorkspaceShell', () => {
    isDesktopMock = true;
    isWideDesktopMock = true;
    isMobileMock = false;

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
    expect(shell.getAttribute('data-has-topbar')).toBe('true');
    expect(screen.getByTestId('workspace-explore-section')).toBeTruthy();
  });

  it('mounts the workspace bottom nav on mobile widths', () => {
    isDesktopMock = false;
    isWideDesktopMock = false;
    isMobileMock = true;

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

    const shell = screen.getAllByTestId('workspace-shell').at(-1);
    expect(shell).toBeTruthy();
    expect(shell?.getAttribute('data-has-sidebar')).toBe('false');
    expect(shell?.getAttribute('data-has-bottom-nav')).toBe('true');
    expect(shell?.getAttribute('data-has-topbar')).toBe('false');
  });
});
