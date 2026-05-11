/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { useWorkspaceData } from './useWorkspaceData';
import { getAccessToken } from '@/lib/auth/token';
import { resolveWorkspaceDataPlan } from './workspaceData.model';
import { buildWorkspaceDataQueries } from './workspaceData.queries';
import { useWorkspaceContractData } from './useWorkspaceContractData';
import { useWorkspaceLegacyPublicOverviewData } from './useWorkspaceLegacyPublicOverviewData';
import { useWorkspaceLegacyProviderSupportData } from './useWorkspaceLegacyProviderSupportData';
import { useWorkspaceLegacyRequestSupportData } from './useWorkspaceLegacyRequestSupportData';
import { useWorkspaceRequestUserStateData } from './useWorkspaceRequestUserStateData';

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

vi.mock('./useWorkspaceLegacyPublicOverviewData', () => ({
  useWorkspaceLegacyPublicOverviewData: vi.fn(),
}));

vi.mock('./useWorkspaceLegacyProviderSupportData', () => ({
  useWorkspaceLegacyProviderSupportData: vi.fn(),
}));

vi.mock('./useWorkspaceLegacyRequestSupportData', () => ({
  useWorkspaceLegacyRequestSupportData: vi.fn(),
}));

vi.mock('./useWorkspaceRequestUserStateData', () => ({
  useWorkspaceRequestUserStateData: vi.fn(),
}));

const getAccessTokenMock = vi.mocked(getAccessToken);
const resolveWorkspaceDataPlanMock = vi.mocked(resolveWorkspaceDataPlan);
const buildWorkspaceDataQueriesMock = vi.mocked(buildWorkspaceDataQueries);
const useWorkspaceContractDataMock = vi.mocked(useWorkspaceContractData);
const useWorkspaceLegacyPublicOverviewDataMock = vi.mocked(useWorkspaceLegacyPublicOverviewData);
const useWorkspaceLegacyProviderSupportDataMock = vi.mocked(useWorkspaceLegacyProviderSupportData);
const useWorkspaceLegacyRequestSupportDataMock = vi.mocked(useWorkspaceLegacyRequestSupportData);
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
      data-legacy-public-overview-keys={Object.keys(result.legacyPublicOverviewData).sort().join(',')}
      data-request-user-state-keys={Object.keys(result.requestUserStateData).sort().join(',')}
      data-legacy-my-requests-keys={Object.keys(result.legacyMyRequestsData).sort().join(',')}
      data-legacy-contract-keys={Object.keys(result.legacyContractSupportData).sort().join(',')}
      data-legacy-review-keys={Object.keys(result.legacyReviewSupportData).sort().join(',')}
      data-legacy-provider-keys={Object.keys(result.legacyProviderSupportData).sort().join(',')}
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
    useWorkspaceLegacyPublicOverviewDataMock.mockReturnValue({
      overviewRequests: { items: [], total: 0 },
      isLoading: false,
      isError: false,
    } as never);
    useWorkspaceRequestUserStateDataMock.mockReturnValue({
      myOffers: [],
      favoriteRequests: [],
    } as never);
    useWorkspaceLegacyRequestSupportDataMock.mockReturnValue({
      myRequests: [],
    } as never);
    useWorkspaceLegacyProviderSupportDataMock.mockReturnValue({
      providers: [],
    } as never);

    render(<Probe />);

    const node = screen.getByTestId('workspace-data');
    expect(node.getAttribute('data-contract-keys')).toContain('workspaceRequests');
    expect(node.getAttribute('data-legacy-public-overview-keys')).toContain('overviewRequests');
    expect(node.getAttribute('data-request-user-state-keys')).toContain('myOffers');
    expect(node.getAttribute('data-legacy-my-requests-keys')).toContain('myRequests');
    expect(node.getAttribute('data-legacy-contract-keys')).toContain('myProviderContracts');
    expect(node.getAttribute('data-legacy-review-keys')).toContain('myReviews');
    expect(node.getAttribute('data-legacy-provider-keys')).toContain('providers');
    expect(node.getAttribute('data-has-flat-workspace-requests')).toBe('false');
    expect(node.getAttribute('data-has-flat-my-offers')).toBe('false');
  });
});
