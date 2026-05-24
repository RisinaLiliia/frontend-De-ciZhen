/** @vitest-environment happy-dom */

import type * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkspaceContextResultControls } from '@/features/workspace/context/WorkspaceContextResultControls';
import type { WorkspacePublicActivityRange } from '@/lib/api/dto/workspace';

vi.mock('@/components/ui/RangeActionToolbar', () => ({
  RangeActionToolbar: ({ groupLabel }: { groupLabel: string }) => (
    <div data-testid="range-toolbar">{groupLabel}</div>
  ),
}));

vi.mock('@/features/workspace/shared', () => ({
  WorkspaceButton: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>{children}</button>
  ),
  WorkspaceFilterSelect: ({ ariaLabel }: { ariaLabel: string }) => (
    <div data-testid="workspace-filter-select">{ariaLabel}</div>
  ),
}));

function createProps() {
  const rangeOptions = [{ value: '30d' as WorkspacePublicActivityRange, label: '30 Tage' }];

  return {
    range: {
      groupLabel: 'Zeitraum',
      options: rangeOptions,
      mobileOptions: rangeOptions,
      value: '30d' as WorkspacePublicActivityRange,
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
  it('does not render a duplicate reset action in mobile mode', () => {
    render(
      <WorkspaceContextResultControls
        mobile
        {...createProps()}
      />,
    );

    expect(screen.getByTestId('range-toolbar')).toBeTruthy();
    expect(screen.getByTestId('workspace-filter-select')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Filter zuruecksetzen' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Karte' })).toBeTruthy();
  });

  it('keeps the reset action in desktop mode', () => {
    render(
      <WorkspaceContextResultControls
        mobile={false}
        {...createProps()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Filter zuruecksetzen' })).toBeTruthy();
  });
});
