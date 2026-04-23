/** @vitest-environment happy-dom */
import * as React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';

import { useWorkspaceActions } from '@/features/workspace/private/useWorkspaceActions';
import { duplicateMyRequest, publishMyRequest, unpublishMyRequest } from '@/lib/api/requests';
import { I18N_KEYS } from '@/lib/i18n/keys';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
  },
}));

vi.mock('@/lib/api/requests', () => ({
  archiveMyRequest: vi.fn(),
  deleteMyRequest: vi.fn(),
  duplicateMyRequest: vi.fn(),
  publishMyRequest: vi.fn(),
  unpublishMyRequest: vi.fn(),
}));

vi.mock('@/lib/api/chat', () => ({
  createConversation: vi.fn(),
}));

function UseWorkspaceActionsProbe() {
  const actions = useWorkspaceActions({
    isAuthed: true,
    myOffers: [],
    t: (key) => String(key),
    qc: {
      invalidateQueries: invalidateQueriesSpy,
    } as never,
    router: {
      push: pushSpy,
    },
  });

  return (
    <>
      <button
        type="button"
        data-testid="duplicate"
        onClick={() => actions.ownerRequestActions.onDuplicate('req-1')}
      >
        duplicate
      </button>
      <button
        type="button"
        data-testid="publish"
        onClick={() => actions.ownerRequestActions.onPublish?.('req-1')}
      >
        publish
      </button>
      <button
        type="button"
        data-testid="unpublish"
        onClick={() => actions.ownerRequestActions.onUnpublish?.('req-1')}
      >
        unpublish
      </button>
    </>
  );
}

const duplicateMyRequestMock = vi.mocked(duplicateMyRequest);
const publishMyRequestMock = vi.mocked(publishMyRequest);
const unpublishMyRequestMock = vi.mocked(unpublishMyRequest);
const toastSuccessMock = vi.mocked(toast.success);
const invalidateQueriesSpy = vi.fn().mockResolvedValue(undefined);
const pushSpy = vi.fn();

describe('useWorkspaceActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateQueriesSpy.mockResolvedValue(undefined);
    duplicateMyRequestMock.mockResolvedValue({ id: 'dup-1' } as never);
    publishMyRequestMock.mockResolvedValue({ id: 'req-1' } as never);
    unpublishMyRequestMock.mockResolvedValue({ id: 'req-1' } as never);
  });

  afterEach(() => {
    cleanup();
  });

  it('duplicates requests without leaving the workspace flow', async () => {
    render(<UseWorkspaceActionsProbe />);

    await act(async () => {
      screen.getByTestId('duplicate').click();
    });

    await waitFor(() => {
      expect(duplicateMyRequestMock).toHaveBeenCalledWith('req-1');
      expect(pushSpy).not.toHaveBeenCalled();
    });
  });

  it('refreshes public request feeds after publishing inside workspace', async () => {
    render(<UseWorkspaceActionsProbe />);

    await act(async () => {
      screen.getByTestId('publish').click();
    });

    await waitFor(() => {
      expect(publishMyRequestMock).toHaveBeenCalledWith('req-1');
      expect(toastSuccessMock).toHaveBeenCalledWith(I18N_KEYS.client.requestPublished);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['requests-explorer-public'] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['workspace-public-overview'] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['home-nearby-requests'] });
    });
  });

  it('uses the unpublish toast and refreshes request caches after unpublishing', async () => {
    render(<UseWorkspaceActionsProbe />);

    await act(async () => {
      screen.getByTestId('unpublish').click();
    });

    await waitFor(() => {
      expect(unpublishMyRequestMock).toHaveBeenCalledWith('req-1');
      expect(toastSuccessMock).toHaveBeenCalledWith(I18N_KEYS.client.requestUnpublished);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['requests-my'] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['favorite-requests'] });
    });
  });
});
