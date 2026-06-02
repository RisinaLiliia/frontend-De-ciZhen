/** @vitest-environment happy-dom */

import type * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WorkspaceContextResultControls } from '@/features/workspace/context/contextResultControls';

vi.mock('@/features/workspace/shared', () => ({
  useMediaMatch: () => false,
  WorkspaceButton: (
    props: React.ButtonHTMLAttributes<HTMLButtonElement> & { fullWidth?: boolean },
  ) => {
    const { children, fullWidth, ...buttonProps } = props;

    void fullWidth;

    return (
      <button type="button" {...buttonProps}>
        {children}
      </button>
    );
  },
  WorkspaceFilterSelect: ({ ariaLabel }: { ariaLabel: string }) => (
    <div data-testid="workspace-filter-select">{ariaLabel}</div>
  ),
}));

afterEach(() => {
  cleanup();
});

function createProps() {
  return {
    range: {
      value: '30d' as const,
      options: [{ value: '30d' as const, label: '30 Tage' }],
      mobileOptions: [{ value: '30d' as const, label: '30 Tage' }],
      groupLabel: 'Zeitraum',
      onChange: vi.fn(),
      summaryLabel: '30 Tage',
    },
    sort: {
      options: [{ value: 'activity', label: 'Aktivitaet' }],
      value: 'activity',
      onChange: vi.fn(),
      ariaLabel: 'Sortierung',
      summaryLabel: 'Aktivitaet',
    },
    resetLabel: 'Filter zuruecksetzen',
    onReset: vi.fn(),
    action: {
      label: 'Karte',
      onClick: vi.fn(),
    },
  };
}

describe('WorkspaceContextResultControls', () => {
  it('renders one reset action in mobile mode', () => {
    render(<WorkspaceContextResultControls mobile {...createProps()} />);

    expect(screen.getAllByTestId('workspace-filter-select')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Filter zuruecksetzen' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Karte' })).toBeTruthy();
  });

  it('keeps the reset action in desktop mode', () => {
    render(<WorkspaceContextResultControls mobile={false} {...createProps()} />);

    expect(screen.getByRole('button', { name: 'Filter zuruecksetzen' })).toBeTruthy();
  });
});
