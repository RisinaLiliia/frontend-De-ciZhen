/** @vitest-environment happy-dom */
import * as React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useWorkspaceActions } from '@/features/workspace/private/useWorkspaceActions';
import { duplicateMyRequest } from '@/lib/api/requests';

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
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    } as never,
    router: {
      push: pushSpy,
    },
  });

  return (
    <button
      type="button"
      data-testid="duplicate"
      onClick={() => actions.ownerRequestActions.onDuplicate('req-1')}
    >
      duplicate
    </button>
  );
}

const duplicateMyRequestMock = vi.mocked(duplicateMyRequest);
const pushSpy = vi.fn();

describe('useWorkspaceActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    duplicateMyRequestMock.mockResolvedValue({ id: 'dup-1' } as never);
  });

  afterEach(() => {
    cleanup();
  });

  it('opens duplicated requests in the existing request detail route', async () => {
    render(<UseWorkspaceActionsProbe />);

    await act(async () => {
      screen.getByTestId('duplicate').click();
    });

    await waitFor(() => {
      expect(duplicateMyRequestMock).toHaveBeenCalledWith('req-1');
      expect(pushSpy).toHaveBeenCalledWith('/requests/dup-1');
    });
  });
});
