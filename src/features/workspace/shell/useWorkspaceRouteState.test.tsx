/** @vitest-environment happy-dom */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { ReadonlyURLSearchParams } from 'next/navigation';

import { useWorkspaceRouteState } from '@/features/workspace/shell/useWorkspaceRouteState';

type ProbeProps = {
  query: string;
  forcedPublicSection?: 'requests' | 'providers' | 'stats' | 'reviews' | null;
};

function Probe({ query, forcedPublicSection = null }: ProbeProps) {
  const searchParams = new URLSearchParams(query) as unknown as ReadonlyURLSearchParams;
  const state = useWorkspaceRouteState({
    forcedPublicSection,
    forcedWorkspaceTab: null,
    searchParams,
    workspacePath: '/workspace',
    t: (key) => String(key),
  });

  return (
    <div
      data-testid="state"
      data-public-section={state.activePublicSection ?? 'null'}
      data-is-public={String(state.isWorkspacePublicSection)}
      data-tab={state.activeWorkspaceTab}
    />
  );
}

afterEach(() => {
  cleanup();
});

describe('useWorkspaceRouteState', () => {
  it('prioritizes explicit tab over forced public section', () => {
    render(<Probe query="tab=reviews&status=all" forcedPublicSection="requests" />);
    const node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('null');
    expect(node.getAttribute('data-is-public')).toBe('false');
    expect(node.getAttribute('data-tab')).toBe('reviews');
  });

  it('keeps public section when no tab is provided', () => {
    render(<Probe query="section=providers" forcedPublicSection="requests" />);
    const node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('requests');
    expect(node.getAttribute('data-is-public')).toBe('true');
    expect(node.getAttribute('data-tab')).toBe('my-requests');
  });

  it('ignores invalid tab query and preserves valid public section', () => {
    render(<Probe query="section=providers&tab=unknown" />);
    const node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('providers');
    expect(node.getAttribute('data-is-public')).toBe('true');
    expect(node.getAttribute('data-tab')).toBe('my-requests');
  });
});
