/** @vitest-environment happy-dom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { WorkspaceShell } from '@/features/workspace/shell/WorkspaceShell.container';

const {
  useRouterMock,
  useSearchParamsMock,
  useAuthSnapshotMock,
} = vi.hoisted(() => ({
  useRouterMock: vi.fn(),
  useSearchParamsMock: vi.fn(),
  useAuthSnapshotMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => useRouterMock(),
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock('@/hooks/useAuthSnapshot', () => ({
  useAuthSnapshot: () => useAuthSnapshotMock(),
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

describe('WorkspaceShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams('');
    mockAuth('unauthenticated');
    useRouterMock.mockReturnValue({
      replace: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('promotes reviews section to private reviews tab for authenticated users', () => {
    mockSearchParams('section=reviews');
    mockAuth('authenticated');

    render(<WorkspaceShell />);

    const node = screen.getByTestId('workspace-page-client');
    expect(node.getAttribute('data-public-section')).toBe('null');
    expect(node.getAttribute('data-workspace-tab')).toBe('reviews');
  });

  it('keeps reviews section public for unauthenticated users', () => {
    mockSearchParams('section=reviews');
    mockAuth('unauthenticated');

    render(<WorkspaceShell />);

    const node = screen.getByTestId('workspace-page-client');
    expect(node.getAttribute('data-public-section')).toBe('reviews');
    expect(node.getAttribute('data-workspace-tab')).toBe('null');
  });

  it('keeps forced workspace tab precedence over promoted reviews tab', () => {
    mockSearchParams('section=reviews');
    mockAuth('authenticated');

    render(<WorkspaceShell forcedWorkspaceTab="my-offers" />);

    const node = screen.getByTestId('workspace-page-client');
    expect(node.getAttribute('data-public-section')).toBe('null');
    expect(node.getAttribute('data-workspace-tab')).toBe('my-offers');
  });

  it('keeps overview route private while auth state is loading', () => {
    mockSearchParams('section=overview');
    mockAuth('loading');

    render(<WorkspaceShell />);

    const node = screen.getByTestId('workspace-page-client');
    expect(node.getAttribute('data-public-section')).toBe('null');
    expect(node.getAttribute('data-workspace-tab')).toBe('null');
  });

  it('keeps overview route private for unauthenticated users', () => {
    mockSearchParams('section=overview');
    mockAuth('unauthenticated');

    render(<WorkspaceShell />);

    const node = screen.getByTestId('workspace-page-client');
    expect(node.getAttribute('data-public-section')).toBe('null');
    expect(node.getAttribute('data-workspace-tab')).toBe('null');
  });

  it('replaces guest my-scope requests url with market scope', () => {
    const replace = vi.fn();
    useRouterMock.mockReturnValue({ replace });
    mockSearchParams('section=requests&scope=my&role=provider&state=attention');
    mockAuth('unauthenticated');

    render(<WorkspaceShell />);

    expect(replace).toHaveBeenCalledWith(
      '/workspace?section=requests&scope=market',
      { scroll: false },
    );
  });
});
