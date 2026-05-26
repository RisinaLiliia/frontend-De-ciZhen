/** @vitest-environment happy-dom */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import WorkspacePageClient from '@/features/workspace/WorkspacePageClient';
import { DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF } from '@/features/workspace/requests/workspaceRequestRoute.model';

const {
  routeStateRef,
  publicBranchModelMock,
  privateBranchModelMock,
  pageLayoutMountsRef,
  pageLayoutUnmountsRef,
} = vi.hoisted(() => ({
  routeStateRef: {
    current: {
      isWorkspacePublicSection: true,
      activePublicSection: 'requests',
      activeWorkspaceTab: 'my-requests',
    },
  },
  publicBranchModelMock: vi.fn(),
  privateBranchModelMock: vi.fn(),
  pageLayoutMountsRef: { current: 0 },
  pageLayoutUnmountsRef: { current: 0 },
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('section=requests&scope=market'),
}));

vi.mock('@/hooks/useAuthSnapshot', () => ({
  useAuthSnapshot: () => ({
    status: 'authenticated',
    user: { id: 'user-1', name: 'Test User', role: 'provider' },
  }),
}));

vi.mock('@/lib/i18n/I18nProvider', () => ({
  useI18n: () => ({ locale: 'de' }),
}));

vi.mock('@/lib/i18n/useT', () => ({
  useT: () => ((key: string) => key),
}));

vi.mock('@/lib/perf/useDevRenderMetric', () => ({
  useDevRenderMetric: () => undefined,
}));

vi.mock('@/features/workspace', async () => {
  const ReactModule = await import('react');

  function WorkspacePageLayout(props: {
    isWorkspacePublicSection: boolean;
    activePublicSection?: string | null;
  }) {
    ReactModule.useEffect(() => {
      pageLayoutMountsRef.current += 1;
      return () => {
        pageLayoutUnmountsRef.current += 1;
      };
    }, []);

    return (
      <div
        data-testid="workspace-page-layout"
        data-mode={props.isWorkspacePublicSection ? 'public' : 'private'}
        data-section={props.activePublicSection ?? 'null'}
      />
    );
  }

  return {
    WorkspacePageLayout,
    WorkspaceMobilePrimaryAction: ({ label }: { label: string }) => (
      <button type="button" data-testid="workspace-mobile-primary-action">{label}</button>
    ),
    useWorkspaceRouteState: () => ({
      ...routeStateRef.current,
      activeStatusFilter: 'all',
      activeFavoritesView: 'requests',
      requestsScope: routeStateRef.current.isWorkspacePublicSection ? 'market' : 'my',
      activeRequestsRole: 'all',
      activeRequestsState: 'all',
      activeRequestsPeriod: '30d',
      activeRequestsSort: null,
      nextPath: '/workspace',
      guestLoginHref: '/auth/login?next=%2Fworkspace',
      onGuestLockedAction: vi.fn(),
    }),
  };
});

vi.mock('@/features/workspace/page/useWorkspacePublicBranchModel', () => ({
  useWorkspacePublicBranchModel: (...args: unknown[]) => publicBranchModelMock(...args),
}));

vi.mock('@/features/workspace/page/useWorkspacePrivateBranchModel', () => ({
  useWorkspacePrivateBranchModel: (...args: unknown[]) => privateBranchModelMock(...args),
}));

describe('WorkspacePageClient', () => {
  beforeEach(() => {
    pageLayoutMountsRef.current = 0;
    pageLayoutUnmountsRef.current = 0;
    routeStateRef.current = {
      isWorkspacePublicSection: true,
      activePublicSection: 'requests',
      activeWorkspaceTab: 'my-requests',
    };

    publicBranchModelMock.mockReset();
    privateBranchModelMock.mockReset();

    publicBranchModelMock.mockReturnValue({
      workspaceLayoutProps: {
        isWorkspacePublicSection: true,
        isWorkspaceAuthed: true,
        activePublicSection: 'requests',
        activeWorkspaceTab: 'my-requests',
        t: (key: string) => key,
        locale: 'de',
        intro: null,
        sectionModel: null,
        workspaceAsideBaseProps: {
          isLoading: false,
          isError: false,
          errorLabel: '',
          title: '',
          subtitle: '',
          ctaLabel: '',
          providers: [],
          favoriteProviderIds: new Set(),
        },
        pendingFavoriteProviderIds: new Set(),
        onToggleProviderFavorite: vi.fn(),
      },
      renderMetricPayload: {
        isAuthed: true,
        activeWorkspaceTab: 'my-requests',
        activePublicSection: 'requests',
        platformRequestsTotal: 24,
        localeTag: 'de-DE',
      },
    });

    privateBranchModelMock.mockReturnValue({
      activePublicSection: 'requests',
      activeWorkspaceTab: 'my-requests',
      pendingFavoriteProviderIds: new Set(),
      onToggleProviderFavorite: vi.fn(),
      workspaceIntroNode: null,
      workspaceAsideBaseProps: {
        isLoading: false,
        isError: false,
        errorLabel: '',
        title: '',
        subtitle: '',
        ctaLabel: '',
        providers: [],
        favoriteProviderIds: new Set(),
      },
      asideTopSlot: null,
      preferredRequestsRole: null,
      overviewDecisionPanelRef: { current: null },
      sectionModel: null,
      primaryAction: {
        href: DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF,
        label: 'Create',
      },
      isLoading: false,
      overviewRequestsCount: 0,
    });
  });

  it('keeps WorkspacePageLayout mounted while switching between public and private workspace modes', () => {
    const { rerender } = render(<WorkspacePageClient />);

    expect(screen.getByTestId('workspace-page-layout').getAttribute('data-mode')).toBe('public');
    expect(pageLayoutMountsRef.current).toBe(1);
    expect(pageLayoutUnmountsRef.current).toBe(0);
    expect(publicBranchModelMock).toHaveBeenLastCalledWith(expect.anything(), { enabled: true });
    expect(privateBranchModelMock).toHaveBeenLastCalledWith(expect.anything(), { enabled: false });

    routeStateRef.current = {
      isWorkspacePublicSection: false,
      activePublicSection: 'requests',
      activeWorkspaceTab: 'my-requests',
    };

    rerender(<WorkspacePageClient />);

    expect(screen.getByTestId('workspace-page-layout').getAttribute('data-mode')).toBe('private');
    expect(screen.getByTestId('workspace-mobile-primary-action')).toBeTruthy();
    expect(pageLayoutMountsRef.current).toBe(1);
    expect(pageLayoutUnmountsRef.current).toBe(0);
    expect(publicBranchModelMock).toHaveBeenLastCalledWith(expect.anything(), { enabled: false });
    expect(privateBranchModelMock).toHaveBeenLastCalledWith(expect.anything(), { enabled: true });
  });
});
