/** @vitest-environment happy-dom */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkspacePageLayout } from '@/features/workspace/shell/WorkspacePageLayout';
import type { WorkspaceSectionRenderModel } from '@/features/workspace/shell/WorkspaceShell.types';

let isDesktopMock = true;
let isWideShellMock = true;
let hasCompactSidebarMock = true;
let isMobileMock = false;

vi.mock('next/navigation', () => ({
  usePathname: () => '/workspace',
  useSearchParams: () => new URLSearchParams('section=providers'),
}));

vi.mock('@/features/workspace/shared', () => ({
  WorkspaceTopProvidersAside: () => <div data-testid="workspace-top-providers-aside" />,
  WorkspaceContextRail: ({ children }: { children?: React.ReactNode }) => (
    <aside data-testid="workspace-context-rail">{children}</aside>
  ),
  useIsDesktop: () => isDesktopMock,
  useWorkspaceWideShell: () => isWideShellMock,
  useMediaMatch: (query: string) => {
    if (query.includes('min-width: 768px')) {
      return hasCompactSidebarMock;
    }

    return isMobileMock;
  },
}));

vi.mock('@/features/workspace/market', () => ({
  WorkspaceExploreSection: () => <div data-testid="workspace-explore-section" />,
  WorkspaceExploreRail: () => <div data-testid="workspace-explore-rail" />,
  isWorkspaceExploreRailSection: (section: string) => section === 'requests',
}));

vi.mock('@/features/workspace/providers', () => ({
  WorkspaceProvidersSection: () => <div data-testid="workspace-providers-section" />,
  WorkspaceProvidersRail: () => <div data-testid="workspace-providers-rail" />,
  WorkspaceTopProvidersAside: () => <div data-testid="workspace-top-providers-aside" />,
}));

vi.mock('@/features/workspace/profile', () => ({
  WorkspaceProfileSection: () => <div data-testid="workspace-profile-section" />,
  WorkspaceProfileRail: () => <div data-testid="workspace-profile-rail" />,
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

vi.mock('@/components/legal/ConsentManageFooter', () => ({
  ConsentManageFooter: () => <div data-testid="workspace-consent-footer" />,
}));

function buildSectionModel(
  overrides: Partial<WorkspaceSectionRenderModel> = {},
): WorkspaceSectionRenderModel {
  return {
    section: 'providers',
    content: <div data-testid="workspace-providers-section" />,
    ...overrides,
  };
}

describe('WorkspacePageLayout', () => {
  it('renders public explore sections through WorkspaceShell', () => {
    isDesktopMock = true;
    isWideShellMock = true;
    hasCompactSidebarMock = true;
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
        sectionModel={buildSectionModel()}
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
    expect(screen.getByTestId('workspace-providers-section')).toBeTruthy();
    expect(screen.getByTestId('workspace-consent-footer')).toBeTruthy();
  });

  it('mounts the workspace bottom nav on mobile widths', () => {
    isDesktopMock = false;
    isWideShellMock = false;
    hasCompactSidebarMock = false;
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
        sectionModel={buildSectionModel()}
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

  it('keeps tablet widths on the topbar-plus-overlay navigation path', () => {
    isDesktopMock = false;
    isWideShellMock = false;
    hasCompactSidebarMock = true;
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
        sectionModel={buildSectionModel()}
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
    expect(shell?.getAttribute('data-has-sidebar')).toBe('true');
    expect(shell?.getAttribute('data-has-bottom-nav')).toBe('true');
    expect(shell?.getAttribute('data-has-topbar')).toBe('true');
  });

  it('keeps 1024px widths on desktop content with compact sidebar navigation', () => {
    isDesktopMock = true;
    isWideShellMock = false;
    hasCompactSidebarMock = true;
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
        sectionModel={buildSectionModel()}
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
    expect(shell?.getAttribute('data-has-sidebar')).toBe('true');
    expect(shell?.getAttribute('data-has-bottom-nav')).toBe('true');
    expect(shell?.getAttribute('data-has-topbar')).toBe('true');
  });
});
