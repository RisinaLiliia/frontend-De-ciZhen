/** @vitest-environment happy-dom */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { ReadonlyURLSearchParams } from 'next/navigation';

import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import { useWorkspaceRouteState } from '@/features/workspace/orchestration/useWorkspaceRouteState';

type ProbeProps = {
  query: string;
  forcedPublicSection?: PublicWorkspaceSection | null;
  isAuthed?: boolean;
};

function Probe({ query, forcedPublicSection = null, isAuthed = false }: ProbeProps) {
  const searchParams = new URLSearchParams(query) as unknown as ReadonlyURLSearchParams;
  const state = useWorkspaceRouteState({
    forcedPublicSection,
    forcedWorkspaceTab: null,
    isAuthed,
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
      data-scope={state.requestsScope}
      data-next-path={state.nextPath}
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

  it('normalizes my scope to public market for guests', () => {
    render(<Probe query="section=requests&scope=my" />);
    const node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('requests');
    expect(node.getAttribute('data-is-public')).toBe('true');
    expect(node.getAttribute('data-scope')).toBe('market');
  });

  it('keeps my scope private for authenticated users', () => {
    render(<Probe query="section=requests&scope=my" isAuthed />);
    const node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('requests');
    expect(node.getAttribute('data-is-public')).toBe('false');
    expect(node.getAttribute('data-scope')).toBe('my');
  });

  it('routes authenticated profile through the private workspace shell', () => {
    render(<Probe query="section=profile&period=90d&range=90d" isAuthed />);
    const node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('profile');
    expect(node.getAttribute('data-is-public')).toBe('false');
    expect(node.getAttribute('data-tab')).toBe('my-requests');
  });

  it('routes authenticated providers and stats through the private workspace shell', () => {
    const { rerender } = render(<Probe query="section=providers" isAuthed />);
    let node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('providers');
    expect(node.getAttribute('data-is-public')).toBe('false');

    rerender(<Probe query="section=stats" isAuthed />);
    node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('stats');
    expect(node.getAttribute('data-is-public')).toBe('false');
  });

  it('keeps reviews as a dedicated workspace section', () => {
    render(<Probe query="section=reviews" />);
    const node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('reviews');
    expect(node.getAttribute('data-is-public')).toBe('true');
  });

  it('supports legacy workspace section aliases', () => {
    const { rerender } = render(<Probe query="section=statistics" isAuthed />);
    let node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('stats');
    expect(node.getAttribute('data-is-public')).toBe('false');

    rerender(<Probe query="section=orders" />);
    node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('requests');
    expect(node.getAttribute('data-is-public')).toBe('true');
  });

  it('keeps actions as a canonical section instead of remapping it to profile', () => {
    render(<Probe query="section=actions" isAuthed />);
    const node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('actions');
    expect(node.getAttribute('data-is-public')).toBe('false');
  });

  it('keeps explicit overview out of the public section shell state', () => {
    render(<Probe query="section=overview" isAuthed />);
    const node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('null');
    expect(node.getAttribute('data-is-public')).toBe('false');
  });

  it('keeps chat as a workspace section but routes it through the private shell', () => {
    render(<Probe query="section=chat&conversation=thread-1" isAuthed />);
    const node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('chat');
    expect(node.getAttribute('data-is-public')).toBe('false');
  });

  it('keeps settings as a workspace section and routes it through the private shell', () => {
    render(<Probe query="section=settings" />);
    const node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('settings');
    expect(node.getAttribute('data-is-public')).toBe('false');
  });

  it('keeps help as a workspace section and routes it through the private shell', () => {
    render(<Probe query="section=help" />);
    const node = screen.getByTestId('state');

    expect(node.getAttribute('data-public-section')).toBe('help');
    expect(node.getAttribute('data-is-public')).toBe('false');
  });

  it('removes request overlay query keys from nextPath', () => {
    render(
      <Probe query="section=requests&scope=market&period=90d&range=90d&requestId=req-1&requestPanel=offer" />,
    );
    const node = screen.getByTestId('state');

    expect(node.getAttribute('data-next-path')).toBe('/workspace?section=requests&scope=market&period=90d&range=90d');
  });
});
