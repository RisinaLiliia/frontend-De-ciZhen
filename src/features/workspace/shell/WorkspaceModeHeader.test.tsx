/** @vitest-environment happy-dom */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkspaceModeHeader } from '@/features/workspace/shell/WorkspaceModeHeader';

vi.mock('@/features/workspace/context', () => ({
  useWorkspaceContext: () => ({
    title: 'Anfragen',
    description: 'Finde passende Auftraege im Markt.',
    controls: {},
  }),
}));

describe('WorkspaceModeHeader', () => {
  it('renders workspace heading and hero shell without embedded top bar or mode navigation', () => {
    const { container } = render(
      <WorkspaceModeHeader
        t={(key) => key}
        locale="de"
        activePublicSection="requests"
        activeWorkspaceTab="my-requests"
      />,
    );

    expect(screen.getByText('Anfragen')).toBeTruthy();
    expect(screen.getByText('Finde passende Auftraege im Markt.')).toBeTruthy();
    expect(container.querySelector('.workspace-environment__hero')).not.toBeNull();
    expect(container.querySelector('.workspace-mode-nav')).toBeNull();
  });
});
