// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WorkspacePublicRequestDialog } from '@/features/workspace/requests/WorkspacePublicRequestDialog';

let authStatusValue: 'guest' | 'authenticated' = 'guest';
let authUserValue: { id: string } | null = null;

vi.mock('next/navigation', () => ({
  usePathname: () => '/workspace',
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams('section=requests'),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({}),
}));

vi.mock('@/hooks/useAuthSnapshot', () => ({
  useAuthStatus: () => authStatusValue,
  useAuthUser: () => authUserValue,
  useAuthMe: () => null,
}));

vi.mock('@/lib/i18n/useT', () => ({
  useT: () => ((key: string) => key),
}));

const defaultRequestDetailsPageData = {
  request: null,
  isLoading: false,
  isError: false,
  providerProfile: null,
  existingResponse: null,
  pendingFavoriteRequestIds: new Set<string>(),
  toggleRequestFavorite: vi.fn(),
  isSaved: false,
};
let requestDetailsPageDataValue: unknown = defaultRequestDetailsPageData;
const requestDetailsPageDataMock = vi.fn(() => requestDetailsPageDataValue);

vi.mock('@/features/requests/details/useRequestDetailsPageData', () => ({
  useRequestDetailsPageData: () => requestDetailsPageDataMock(),
}));

const defaultRequestDetailsContentState = {
  activeOwnerSubmitIntent: null,
  applyLabel: 'Apply',
  applyState: 'default',
  applyTitle: undefined,
  formatPriceValue: (value: number) => String(value),
  handleOwnerClearText: vi.fn(),
  handleOwnerPhotoPick: vi.fn(),
  handleOwnerSave: vi.fn(),
  isOwnerEditMode: false,
  isSavingOwner: false,
  isUploadingOwnerPhoto: false,
  ownerDescription: '',
  ownerPhotos: [],
  ownerPrice: '',
  ownerPriceTrend: null,
  ownerTitle: '',
  requestPriceTrend: null,
  requestPriceTrendLabel: null,
  requestStatusView: { token: 'sent', label: 'Review' },
  setIsOwnerEditMode: vi.fn(),
  setOwnerDescription: vi.fn(),
  setOwnerPhotos: vi.fn(),
  setOwnerPrice: vi.fn(),
  setOwnerTitle: vi.fn(),
  similarFallbackMessage: undefined,
  similarForRender: [],
  similarHref: undefined,
  similarTitle: undefined,
  viewModel: null,
};
let requestDetailsContentStateValue: unknown = defaultRequestDetailsContentState;
const requestDetailsContentStateMock = vi.fn(() => requestDetailsContentStateValue);

vi.mock('@/features/requests/details/useRequestDetailsContentState', () => ({
  useRequestDetailsContentState: () => requestDetailsContentStateMock(),
}));

vi.mock('@/features/requests/details/RequestDetailsContent', () => ({
  RequestDetailsContent: ({ onApply }: { onApply: () => void }) => (
    <button type="button" onClick={onApply}>
      request-details-content
    </button>
  ),
}));

describe('WorkspacePublicRequestDialog', () => {
  afterEach(() => {
    authStatusValue = 'guest';
    authUserValue = null;
    requestDetailsPageDataValue = defaultRequestDetailsPageData;
    requestDetailsContentStateValue = defaultRequestDetailsContentState;
    requestDetailsPageDataMock.mockClear();
    requestDetailsContentStateMock.mockClear();
  });

  it('does not crash before request details are hydrated', async () => {
    requestDetailsPageDataValue = {
      request: null,
      isLoading: false,
      isError: false,
      providerProfile: null,
      existingResponse: null,
      pendingFavoriteRequestIds: new Set<string>(),
      toggleRequestFavorite: vi.fn(),
      isSaved: false,
    };
    requestDetailsContentStateValue = {
      activeOwnerSubmitIntent: null,
      applyLabel: 'Apply',
      applyState: 'default',
      applyTitle: undefined,
      formatPriceValue: (value: number) => String(value),
      handleOwnerClearText: vi.fn(),
      handleOwnerPhotoPick: vi.fn(),
      handleOwnerSave: vi.fn(),
      isOwnerEditMode: false,
      isSavingOwner: false,
      isUploadingOwnerPhoto: false,
      ownerDescription: '',
      ownerPhotos: [],
      ownerPrice: '',
      ownerPriceTrend: null,
      ownerTitle: '',
      requestPriceTrend: null,
      requestPriceTrendLabel: null,
      requestStatusView: { token: 'sent', label: 'Review' },
      setIsOwnerEditMode: vi.fn(),
      setOwnerDescription: vi.fn(),
      setOwnerPhotos: vi.fn(),
      setOwnerPrice: vi.fn(),
      setOwnerTitle: vi.fn(),
      similarFallbackMessage: undefined,
      similarForRender: [],
      similarHref: undefined,
      similarTitle: undefined,
      viewModel: null,
    };

    render(
      <WorkspacePublicRequestDialog
        locale="de"
        requestId="req-1"
        initialIntent="view"
        onClose={vi.fn()}
        onOpenRequest={vi.fn()}
        onOpenOfferSheet={vi.fn()}
        onOpenChatConversation={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
    expect(screen.queryByText('request-details-content')).toBeNull();
  });

  it('closes request dialog and opens offer sheet when edit action is triggered from detail modal', async () => {
    const onOpenOfferSheet = vi.fn();
    authStatusValue = 'authenticated';
    authUserValue = { id: 'provider-1' };

    requestDetailsPageDataValue = {
      request: {
        id: 'req-1',
        clientId: 'client-1',
        title: 'Test request',
      },
      isLoading: false,
      isError: false,
      providerProfile: null,
      existingResponse: {
        id: 'offer-1',
        requestId: 'req-1',
        status: 'sent',
      },
      pendingFavoriteRequestIds: new Set<string>(),
      toggleRequestFavorite: vi.fn(),
      isSaved: false,
    };
    requestDetailsContentStateValue = {
      activeOwnerSubmitIntent: null,
      applyLabel: 'Angebot bearbeiten',
      applyState: 'edit',
      applyTitle: undefined,
      formatPriceValue: (value: number) => String(value),
      handleOwnerClearText: vi.fn(),
      handleOwnerPhotoPick: vi.fn(),
      handleOwnerSave: vi.fn(),
      isOwnerEditMode: false,
      isSavingOwner: false,
      isUploadingOwnerPhoto: false,
      ownerDescription: '',
      ownerPhotos: [],
      ownerPrice: '',
      ownerPriceTrend: null,
      ownerTitle: '',
      requestPriceTrend: null,
      requestPriceTrendLabel: null,
      requestStatusView: { token: 'sent', label: 'Review' },
      setIsOwnerEditMode: vi.fn(),
      setOwnerDescription: vi.fn(),
      setOwnerPhotos: vi.fn(),
      setOwnerPrice: vi.fn(),
      setOwnerTitle: vi.fn(),
      similarFallbackMessage: undefined,
      similarForRender: [],
      similarHref: undefined,
      similarTitle: undefined,
      viewModel: {
        title: 'Test request',
      },
    };

    render(
      <WorkspacePublicRequestDialog
        locale="de"
        requestId="req-1"
        initialIntent="view"
        onClose={vi.fn()}
        onOpenRequest={vi.fn()}
        onOpenOfferSheet={onOpenOfferSheet}
        onOpenChatConversation={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'request-details-content' })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'request-details-content' }));

    await waitFor(() => {
      expect(onOpenOfferSheet).toHaveBeenCalledWith('req-1');
    });
  });
});
