/** @vitest-environment happy-dom */
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { usePublicRequestsSeenTotal } from '@/features/workspace/explore/usePublicRequestsSeenTotal';
import { useWorkspacePublicRequestsState } from '@/features/workspace/public/useWorkspacePublicRequestsState';

afterEach(() => {
  cleanup();
});

function PublicRequestsSeenProbe() {
  const result = usePublicRequestsSeenTotal({
    isAuthed: false,
    userId: null,
    platformRequestsTotal: 10,
  });
  return (
    <div
      data-testid="seen"
      data-has-new={String(typeof result.markPublicRequestsSeen === 'function')}
      data-has-legacy={String('markPublicOrdersSeen' in (result as unknown as Record<string, unknown>))}
    />
  );
}

function PublicRequestsStateProbe() {
  const setPage = React.useMemo(() => vi.fn(), []);
  const result = useWorkspacePublicRequestsState({
    publicRequests: { items: [], total: 12 },
    allRequestsSummary: { totalPublishedRequests: 24, totalActiveProviders: 8 },
    limit: 20,
    page: 1,
    setPage,
    isWorkspacePublicSection: false,
    activePublicSection: null,
    isLoading: false,
    isError: false,
    hasActivePublicFilter: false,
    cityId: 'all',
    categoryKey: 'all',
    subcategoryKey: 'all',
    sortBy: 'date_desc',
  });

  return (
    <div
      data-testid="state"
      data-total={String(result.platformRequestsTotal)}
      data-has-legacy={String('platformOrdersTotal' in (result as unknown as Record<string, unknown>))}
    />
  );
}

describe('workspace canonical requests hooks', () => {
  it('usePublicRequestsSeenTotal exposes only requests API', () => {
    render(<PublicRequestsSeenProbe />);
    const node = screen.getByTestId('seen');
    expect(node.getAttribute('data-has-new')).toBe('true');
    expect(node.getAttribute('data-has-legacy')).toBe('false');
  });

  it('useWorkspacePublicRequestsState exposes platformRequestsTotal without legacy alias field', () => {
    render(<PublicRequestsStateProbe />);
    const node = screen.getByTestId('state');
    expect(node.getAttribute('data-total')).toBe('24');
    expect(node.getAttribute('data-has-legacy')).toBe('false');
  });
});
