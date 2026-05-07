/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { useWorkspaceData } from './useWorkspaceData';
import { getAccessToken } from '@/lib/auth/token';
import { resolveWorkspaceDataPlan } from './workspaceData.model';
import { buildWorkspaceDataQueries } from './workspaceData.queries';
import { useWorkspaceContractData } from './useWorkspaceContractData';
import { useWorkspaceLegacyPrivateData } from './useWorkspaceLegacyPrivateData';

vi.mock('@/lib/auth/token', () => ({
  getAccessToken: vi.fn(),
}));

vi.mock('./workspaceData.model', () => ({
  resolveWorkspaceDataPlan: vi.fn(),
}));

vi.mock('./workspaceData.queries', () => ({
  buildWorkspaceDataQueries: vi.fn(),
}));

vi.mock('./useWorkspaceContractData', () => ({
  useWorkspaceContractData: vi.fn(),
}));

vi.mock('./useWorkspaceLegacyPrivateData', () => ({
  useWorkspaceLegacyPrivateData: vi.fn(),
}));

const getAccessTokenMock = vi.mocked(getAccessToken);
const resolveWorkspaceDataPlanMock = vi.mocked(resolveWorkspaceDataPlan);
const buildWorkspaceDataQueriesMock = vi.mocked(buildWorkspaceDataQueries);
const useWorkspaceContractDataMock = vi.mocked(useWorkspaceContractData);
const useWorkspaceLegacyPrivateDataMock = vi.mocked(useWorkspaceLegacyPrivateData);

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
      data-legacy-keys={Object.keys(result.legacyPrivateData).sort().join(',')}
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

  it('returns nested contract and legacy private slices instead of a flat mixed payload', () => {
    getAccessTokenMock.mockReturnValue('token');
    resolveWorkspaceDataPlanMock.mockReturnValue({
      shouldLoadOfferRequests: false,
    } as never);
    buildWorkspaceDataQueriesMock.mockReturnValue({ workspaceRequests: {} } as never);
    useWorkspaceContractDataMock.mockReturnValue({
      workspaceRequests: { requests: [] },
      isWorkspaceRequestsLoading: false,
    } as never);
    useWorkspaceLegacyPrivateDataMock.mockReturnValue({
      myOffers: [],
      favoriteRequests: [],
    } as never);

    render(<Probe />);

    const node = screen.getByTestId('workspace-data');
    expect(node.getAttribute('data-contract-keys')).toContain('workspaceRequests');
    expect(node.getAttribute('data-legacy-keys')).toContain('myOffers');
    expect(node.getAttribute('data-has-flat-workspace-requests')).toBe('false');
    expect(node.getAttribute('data-has-flat-my-offers')).toBe('false');
  });
});
