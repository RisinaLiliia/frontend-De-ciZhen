/** @vitest-environment happy-dom */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkspaceModeHeader } from '@/features/workspace/shell/WorkspaceModeHeader';

vi.mock('@/features/workspace/shell/useWorkspaceSharedContext', () => ({
  useWorkspaceSharedContext: () => ({
    title: 'Anfragen',
    description: 'Finde passende Auftraege im Markt.',
    copy: {
      eyebrow: 'Workspace',
      shellHint: 'One-window workspace',
    },
    controls: {},
  }),
  buildSharedContextControlsProps: () => ({
    cityOptions: [],
    categoryOptions: [],
    serviceOptions: [],
    sortOptions: [],
    cityId: '',
    categoryKey: '',
    subcategoryKey: '',
    sortBy: '',
    range: '30d',
    role: 'customer',
    state: 'open',
    viewerMode: 'customer',
    onCityChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onSubcategoryChange: vi.fn(),
    onSortChange: vi.fn(),
    onRangeChange: vi.fn(),
    onRoleChange: vi.fn(),
    onStateChange: vi.fn(),
    onViewerModeChange: vi.fn(),
    onReset: vi.fn(),
    closeLabel: 'Close',
  }),
}));

vi.mock('@/features/workspace/shell/WorkspaceSharedContextControls', () => ({
  WorkspaceSharedContextControls: () => <div data-testid="workspace-shared-context-controls" />,
}));

vi.mock('@/features/workspace/shell/WorkspaceHeaderAuthActions', () => ({
  WorkspaceHeaderAuthActions: () => <div data-testid="workspace-header-auth-actions" />,
}));

vi.mock('@/features/workspace/shell/WorkspaceHeaderAccountMenu', () => ({
  WorkspaceHeaderAccountMenu: () => <div data-testid="workspace-header-account-menu" />,
  WorkspaceHeaderNotificationsButton: () => <div data-testid="workspace-header-notifications" />,
}));

vi.mock('@/features/workspace/shell/WorkspaceHeaderUtilityBar', () => ({
  WorkspaceHeaderUtilityBar: () => <div data-testid="workspace-header-utility-bar" />,
}));

describe('WorkspaceModeHeader', () => {
  it('renders workspace heading and controls without top navigation', () => {
    const { container } = render(
      <WorkspaceModeHeader
        t={(key) => key}
        locale="de"
        activePublicSection="requests"
        activeWorkspaceTab="my-requests"
      />,
    );

    expect(screen.getByText('Anfragen')).toBeTruthy();
    expect(screen.getByTestId('workspace-header-utility-bar')).toBeTruthy();
    expect(screen.getByTestId('workspace-shared-context-controls')).toBeTruthy();
    expect(container.querySelector('.workspace-mode-nav')).toBeNull();
  });
});
