/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { useWorkspaceData } from './useWorkspaceData';
import { getAccessToken } from '@/lib/auth/token';
import { resolveWorkspaceDataPlan } from './workspaceData.model';
import { buildWorkspaceDataQueries } from './workspaceData.queries';
import { buildWorkspaceRequestUserStateQueries } from '@/features/workspace/requests/workspaceRequestUserState.queries';
import { useWorkspaceContractData } from '@/features/workspace/contracts/useWorkspaceContractData';
import { useWorkspaceRequestUserStateData } from '@/features/workspace/requests/useWorkspaceRequestUserStateData';

vi.mock('@/lib/auth/token', () => ({
  getAccessToken: vi.fn(),
}));

vi.mock('./workspaceData.model', () => ({
  resolveWorkspaceDataPlan: vi.fn(),
}));

vi.mock('./workspaceData.queries', () => ({
  buildWorkspaceDataQueries: vi.fn(),
}));

vi.mock('@/features/workspace/requests/workspaceRequestUserState.queries', () => ({
  buildWorkspaceRequestUserStateQueries: vi.fn(),
}));

vi.mock('@/features/workspace/contracts/useWorkspaceContractData', () => ({
  useWorkspaceContractData: vi.fn(),
}));

vi.mock('@/features/workspace/requests/useWorkspaceRequestUserStateData', () => ({
  useWorkspaceRequestUserStateData: vi.fn(),
}));

const getAccessTokenMock = vi.mocked(getAccessToken);
const resolveWorkspaceDataPlanMock = vi.mocked(resolveWorkspaceDataPlan);
const buildWorkspaceDataQueriesMock = vi.mocked(buildWorkspaceDataQueries);
const buildWorkspaceRequestUserStateQueriesMock = vi.mocked(buildWorkspaceRequestUserStateQueries);
const useWorkspaceContractDataMock = vi.mocked(useWorkspaceContractData);
const useWorkspaceRequestUserStateDataMock = vi.mocked(useWorkspaceRequestUserStateData);

function Probe() {
  const result = useWorkspaceData({
    filter: {},
    locale: 'de',
    isAuthed: true,
    isWorkspaceAuthed: true,
    isWorkspacePublicSection: false,
    shouldLoadPrivateData: true,
    activeWorkspaceTab: 'my-requests',
    requestsScope: 'market',
    activeRequestsRole: 'all',
    activeRequestsState: 'all',
    activeRequestsPeriod: '30d',
    activeRequestsSort: null,
  });

  return (
    <div
      data-testid="workspace-data"
      data-contract-keys={Object.keys(result.contractData).sort().join(',')}
      data-request-user-state-keys={Object.keys(result.requestUserStateData).sort().join(',')}
      data-has-legacy-my-requests={String('legacyMyRequestsData' in result)}
      data-has-legacy-contracts={String('legacyContractSupportData' in result)}
      data-has-legacy-reviews={String('legacyReviewSupportData' in result)}
      data-has-legacy-providers={String('legacyProviderSupportData' in result)}
      data-has-flat-workspace-requests={String('workspaceRequests' in result)}
      data-has-flat-my-offers={String('myOffers' in result)}
    />
  );
}

describe('useWorkspaceData', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('returns section-oriented contract and user-state slices without legacy private tab payloads', () => {
    getAccessTokenMock.mockReturnValue('token');
    resolveWorkspaceDataPlanMock.mockReturnValue({
      shouldLoadOfferRequests: false,
    } as never);
    buildWorkspaceDataQueriesMock.mockReturnValue({ workspaceRequests: {} } as never);
    buildWorkspaceRequestUserStateQueriesMock.mockReturnValue({ myOffers: {}, favoriteRequests: {} } as never);
    useWorkspaceContractDataMock.mockReturnValue({
      workspaceRequests: { requests: [] },
      isWorkspaceRequestsLoading: false,
    } as never);
    useWorkspaceRequestUserStateDataMock.mockReturnValue({
      myOffers: [],
      favoriteRequests: [],
    } as never);

    render(<Probe />);

    const node = screen.getByTestId('workspace-data');
    expect(node.getAttribute('data-contract-keys')).toContain('workspaceRequests');
    expect(node.getAttribute('data-request-user-state-keys')).toContain('myOffers');
    expect(node.getAttribute('data-has-legacy-my-requests')).toBe('false');
    expect(node.getAttribute('data-has-legacy-contracts')).toBe('false');
    expect(node.getAttribute('data-has-legacy-reviews')).toBe('false');
    expect(node.getAttribute('data-has-legacy-providers')).toBe('false');
    expect(node.getAttribute('data-has-flat-workspace-requests')).toBe('false');
    expect(node.getAttribute('data-has-flat-my-offers')).toBe('false');
  });
});
