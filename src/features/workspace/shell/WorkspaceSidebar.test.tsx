/** @vitest-environment happy-dom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WorkspaceSidebar } from '@/features/workspace/shell/WorkspaceSidebar';
import { WORKSPACE_MOBILE_NAV_OPEN_EVENT } from '@/lib/workspaceMobileNavigation';

const pushMock = vi.fn();
const replaceMock = vi.fn();
const logoutMock = vi.fn();
const useAuthStatusMock = vi.fn();
const useAuthUserMock = vi.fn();
const useAuthMeMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
  usePathname: () => '/workspace',
  useSearchParams: () => new URLSearchParams('section=requests'),
}));

vi.mock('@/hooks/useAuthSnapshot', () => ({
  useAuthStatus: () => useAuthStatusMock(),
  useAuthUser: () => useAuthUserMock(),
  useAuthMe: () => useAuthMeMock(),
  useAuthLogout: () => logoutMock,
}));

afterEach(() => {
  cleanup();
});

describe('WorkspaceSidebar', () => {
  it('does not render guest auth actions in the sidebar footer', () => {
    useAuthStatusMock.mockReturnValue('unauthenticated');
    useAuthUserMock.mockReturnValue(null);
    useAuthMeMock.mockReturnValue(null);

    render(
      <WorkspaceSidebar
        t={(key: string) => key}
        locale="de"
        activePublicSection="requests"
        activeWorkspaceTab="my-requests"
      />,
    );

    expect(screen.queryByRole('button', { name: 'auth.loginCta' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'auth.registerCta' })).toBeNull();
    expect(screen.queryByRole('link', { name: /Angebote/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Aufträge/i })).toBeNull();
  });

  it('allows explicit active navigation override for chat shell pages', () => {
    useAuthStatusMock.mockReturnValue('authenticated');
    useAuthUserMock.mockReturnValue({ name: 'Lilia', role: 'provider' });
    useAuthMeMock.mockReturnValue({ name: 'Lilia Müller' });

    render(
      <WorkspaceSidebar
        t={(key: string) => key}
        locale="de"
        activePublicSection={null}
        activeWorkspaceTab="my-requests"
        activeNavigationSection="chat"
      />,
    );

    const chatLink = screen.getByRole('link', { name: /Nachrichten/i });
    const requestsLink = screen.getByRole('link', { name: /Anfragen/i });
    const offersLink = screen.getByRole('link', { name: /Angebote/i });
    const contractsLink = screen.getByRole('link', { name: /Aufträge/i });

    expect(chatLink.className).toContain('workspace-sidebar__item--active');
    expect(requestsLink.className).not.toContain('workspace-sidebar__item--active');
    expect(offersLink).toBeTruthy();
    expect(contractsLink).toBeTruthy();
    expect(screen.getByText('Lilia Müller')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'auth.logoutLabel' })).toBeNull();
  });

  it('opens drawer navigation from the compact brand button', () => {
    useAuthStatusMock.mockReturnValue('unauthenticated');
    useAuthUserMock.mockReturnValue(null);
    useAuthMeMock.mockReturnValue(null);
    const openHandler = vi.fn();
    window.addEventListener(WORKSPACE_MOBILE_NAV_OPEN_EVENT, openHandler);

    render(
      <WorkspaceSidebar
        t={(key: string) => key}
        locale="de"
        activePublicSection="requests"
        activeWorkspaceTab="my-requests"
        variant="compact"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'auth.navigationLabel' }));

    expect(openHandler).toHaveBeenCalledTimes(1);
    window.removeEventListener(WORKSPACE_MOBILE_NAV_OPEN_EVENT, openHandler);
  });

  it('can render drawer navigation without a duplicate brand', () => {
    useAuthStatusMock.mockReturnValue('unauthenticated');
    useAuthUserMock.mockReturnValue(null);
    useAuthMeMock.mockReturnValue(null);

    render(
      <WorkspaceSidebar
        t={(key: string) => key}
        locale="de"
        activePublicSection="requests"
        activeWorkspaceTab="my-requests"
        variant="drawer"
        showBrand={false}
      />,
    );

    expect(screen.queryByRole('link', { name: /De.ciZhen/i })).toBeNull();
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeTruthy();
  });
});
