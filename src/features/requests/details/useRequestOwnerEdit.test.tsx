/** @vitest-environment happy-dom */
import * as React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRequestOwnerEdit } from '@/features/requests/details/useRequestOwnerEdit';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { publishMyRequest, updateMyRequest, uploadRequestPhotos } from '@/lib/api/requests';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
  },
}));

vi.mock('@/lib/api/requests', () => ({
  updateMyRequest: vi.fn(),
  publishMyRequest: vi.fn(),
  uploadRequestPhotos: vi.fn(),
}));

const updateMyRequestMock = vi.mocked(updateMyRequest);
const publishMyRequestMock = vi.mocked(publishMyRequest);
vi.mocked(uploadRequestPhotos).mockResolvedValue({ urls: [] } as never);

const qcMock = {
  setQueriesData: vi.fn(),
  invalidateQueries: vi.fn(),
};

const OWNER_DRAFT_REQUEST: RequestResponseDto = {
  id: 'req-1',
  title: 'Draft request',
  serviceKey: 'home_cleaning',
  cityId: 'c1',
  propertyType: 'apartment',
  area: 55,
  preferredDate: '2026-04-22T10:00:00.000Z',
  isRecurring: false,
  description: 'details',
  photos: [],
  status: 'draft',
  createdAt: '2026-04-17T10:00:00.000Z',
  clientId: 'u1',
  price: 120,
};

function Probe() {
  const ownerEdit = useRequestOwnerEdit({
    request: OWNER_DRAFT_REQUEST,
    isOwner: true,
    showOwnerBadge: true,
    shouldOpenOwnerEdit: false,
    qc: qcMock as never,
    t: (key) => String(key),
  });

  return (
    <div>
      <span data-testid="edit-mode">{String(ownerEdit.isOwnerEditMode)}</span>
      <button
        type="button"
        data-testid="publish"
        onClick={() => {
          void ownerEdit.handleOwnerSave('publish');
        }}
      >
        publish
      </button>
    </div>
  );
}

describe('useRequestOwnerEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateMyRequestMock.mockResolvedValue({
      ...OWNER_DRAFT_REQUEST,
    } as never);
    publishMyRequestMock.mockResolvedValue({
      ...OWNER_DRAFT_REQUEST,
      status: 'published',
    } as never);
  });

  afterEach(() => {
    cleanup();
  });

  it('auto-opens draft owner requests and publishes after saving changes', async () => {
    render(<Probe />);

    expect(screen.getByTestId('edit-mode').textContent).toBe('true');

    await act(async () => {
      screen.getByTestId('publish').click();
    });

    await waitFor(() => {
      expect(updateMyRequestMock).toHaveBeenCalledWith(
        'req-1',
        expect.objectContaining({
          title: 'Draft request',
          cityId: 'c1',
          preferredDate: expect.any(String),
          description: 'details',
          photos: [],
          price: 120,
        }),
      );
      expect(publishMyRequestMock).toHaveBeenCalledWith('req-1');
    });
  });
});
