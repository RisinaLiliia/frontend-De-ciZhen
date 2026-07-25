/** @vitest-environment happy-dom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { WorkspaceRouteShell } from '@/features/workspace/shell/WorkspaceRouteShell';

const {
  useRouterMock,
  useSearchParamsMock,
  useAuthSnapshotMock,
  shouldAttemptRefreshOnBootstrapMock,
} = vi.hoisted(() => ({
  useRouterMock: vi.fn(),
  useSearchParamsMock: vi.fn(),
  useAuthSnapshotMock: vi.fn(),
  shouldAttemptRefreshOnBootstrapMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => useRouterMock(),
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock('@/hooks/useAuthSnapshot', () => ({
  useAuthSnapshot: () => useAuthSnapshotMock(),
}));

vi.mock('@/lib/auth/session', () => ({
  shouldAttemptRefreshOnBootstrap: () => shouldAttemptRefreshOnBootstrapMock(),
}));

vi.mock('@/features/workspace/WorkspacePageClient', () => ({
  __esModule: true,
  default: ({
    activePublicSection,
    activeWorkspaceTab,
  }: {
    activePublicSection?: string | null;
    activeWorkspaceTab?: string | null;
  }) => (
    <div
      data-testid="workspace-page-client"
      data-public-section={activePublicSection ?? 'null'}
      data-workspace-tab={activeWorkspaceTab ?? 'null'}
    />
  ),
}));

function mockSearchParams(query: string) {
  useSearchParamsMock.mockReturnValue(new URLSearchParams(query));
}

function mockAuth(status: 'authenticated' | 'unauthenticated' | 'loading' | 'idle') {
  useAuthSnapshotMock.mockReturnValue({
    status,
    user: status === 'authenticated'
      ? { id: 'user-1', name: 'Test User', role: 'client' }
      : null,
  } as never);
}

describe('WorkspaceRouteShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams('');
    mockAuth('unauthenticated');
    shouldAttemptRefreshOnBootstrapMock.mockReturnValue(false);
    useRouterMock.mockReturnValue({
      replace: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('keeps reviews as a canonical section for authenticated users', () => {
    mockSearchParams('section=reviews');
    mockAuth('authenticated');

    render(<WorkspaceRouteShell />);

    const node = screen.getByTestId('workspace-page-client');
    expect(node.getAttribute('data-public-section')).toBe('reviews');
    expect(node.getAttribute('data-workspace-tab')).toBe('null');
  });

  it('normalizes legacy statistics alias to the canonical stats section', () => {
    const replace = vi.fn();
    useRouterMock.mockReturnValue({ replace });
    mockSearchParams('section=statistics&period=90d');
    mockAuth('authenticated');

    render(<WorkspaceRouteShell />);

    expect(replace).toHaveBeenCalledWith(
      '/workspace?section=stats&period=90d',
      { scroll: false },
    );
  });

  it('normalizes the legacy orders alias to the canonical requests section', () => {
    const replace = vi.fn();
    useRouterMock.mockReturnValue({ replace });
    mockSearchParams('section=orders');
    mockAuth('unauthenticated');

    render(<WorkspaceRouteShell />);

    expect(replace).toHaveBeenCalledWith(
      '/workspace?section=requests',
      { scroll: false },
    );
  });

  it('keeps actions as a canonical section without redirecting it to profile', () => {
    const replace = vi.fn();
    useRouterMock.mockReturnValue({ replace });
    mockSearchParams('section=actions&viewerMode=provider');
    mockAuth('authenticated');

    render(<WorkspaceRouteShell />);

    const node = screen.getByTestId('workspace-page-client');
    expect(replace).not.toHaveBeenCalled();
    expect(node.getAttribute('data-public-section')).toBe('actions');
    expect(node.getAttribute('data-workspace-tab')).toBe('null');
  });

  it('gives legacy tab redirects precedence over conflicting canonical section params', () => {
    const replace = vi.fn();
    useRouterMock.mockReturnValue({ replace });
    mockSearchParams('section=stats&tab=profile&viewerMode=customer');
    mockAuth('authenticated');

    render(<WorkspaceRouteShell />);

    expect(replace).toHaveBeenCalledWith(
      '/workspace?section=profile&viewerMode=customer',
      { scroll: false },
    );
  });

  it('keeps reviews as a canonical section for unauthenticated users', () => {
    mockSearchParams('section=reviews');
    mockAuth('unauthenticated');

    render(<WorkspaceRouteShell />);

    const node = screen.getByTestId('workspace-page-client');
    expect(node.getAttribute('data-public-section')).toBe('reviews');
    expect(node.getAttribute('data-workspace-tab')).toBe('null');
  });

  it('keeps chat as a canonical workspace section', () => {
    mockSearchParams('section=chat&conversation=custom-thread-1');
    mockAuth('authenticated');

    render(<WorkspaceRouteShell />);

    const node = screen.getByTestId('workspace-page-client');
    expect(node.getAttribute('data-public-section')).toBe('chat');
    expect(node.getAttribute('data-workspace-tab')).toBe('null');
  });

  it('redirects guest chat access to login while preserving workspace next path', () => {
    const replace = vi.fn();
    useRouterMock.mockReturnValue({ replace });
    mockSearchParams('section=chat&conversation=custom-thread-1');
    mockAuth('unauthenticated');

    const { container } = render(<WorkspaceRouteShell />);

    expect(screen.queryByTestId('workspace-page-client')).toBeNull();
    expect(container.querySelector('.min-h-dvh')).not.toBeNull();
    expect(replace).toHaveBeenCalledWith(
      '/auth/login?next=%2Fworkspace%3Fsection%3Dchat%26conversation%3Dcustom-thread-1',
      { scroll: false },
    );
  });

  it('keeps forced workspace tab precedence when provided explicitly', () => {
    mockSearchParams('section=reviews');
    mockAuth('authenticated');

    render(<WorkspaceRouteShell forcedWorkspaceTab="my-offers" />);

    const node = screen.getByTestId('workspace-page-client');
    expect(node.getAttribute('data-public-section')).toBe('null');
    expect(node.getAttribute('data-workspace-tab')).toBe('my-offers');
  });

  it('keeps overview route private while auth state is loading', () => {
    mockSearchParams('section=overview');
    mockAuth('loading');

    render(<WorkspaceRouteShell />);

    const node = screen.getByTestId('workspace-page-client');
    expect(node.getAttribute('data-public-section')).toBe('null');
    expect(node.getAttribute('data-workspace-tab')).toBe('null');
  });

  it('keeps overview route private for unauthenticated users', () => {
    mockSearchParams('section=overview');
    mockAuth('unauthenticated');

    render(<WorkspaceRouteShell />);

    const node = screen.getByTestId('workspace-page-client');
    expect(node.getAttribute('data-public-section')).toBe('null');
    expect(node.getAttribute('data-workspace-tab')).toBe('null');
  });

  it('replaces guest my-scope requests url with market scope', () => {
    const replace = vi.fn();
    useRouterMock.mockReturnValue({ replace });
    mockSearchParams('section=requests&scope=my&role=provider&state=attention');
    mockAuth('unauthenticated');

    render(<WorkspaceRouteShell />);

    expect(replace).toHaveBeenCalledWith(
      '/workspace?section=requests&scope=market',
      { scroll: false },
    );
  });

  it('collapses guest alias and scope compatibility into a single canonical redirect', () => {
    const replace = vi.fn();
    useRouterMock.mockReturnValue({ replace });
    mockSearchParams('section=orders&scope=my&role=provider&state=execution');
    mockAuth('unauthenticated');

    render(<WorkspaceRouteShell />);

    expect(replace).toHaveBeenCalledWith(
      '/workspace?section=requests&scope=market',
      { scroll: false },
    );
  });

  it('keeps bootstrap loading screen while refresh intent is active', () => {
    shouldAttemptRefreshOnBootstrapMock.mockReturnValue(true);
    mockAuth('loading');

    const { container } = render(<WorkspaceRouteShell />);

    expect(screen.queryByTestId('workspace-page-client')).toBeNull();
    expect(container.querySelector('.min-h-dvh')).not.toBeNull();
  });
});
