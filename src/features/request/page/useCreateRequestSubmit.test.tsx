/** @vitest-environment happy-dom */
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';

import { useCreateRequestSubmit } from '@/features/request/page/useCreateRequestSubmit';
import type { CreateRequestValues } from '@/features/request/create.schema';
import { ApiError } from '@/lib/api/http-error';
import { createRequest, publishMyRequest, uploadRequestPhotos } from '@/lib/api/requests';
import { toast } from 'sonner';

vi.mock('@/lib/api/requests', () => ({
  createRequest: vi.fn(),
  publishMyRequest: vi.fn(),
  uploadRequestPhotos: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    message: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const createRequestMock = vi.mocked(createRequest);
const publishMyRequestMock = vi.mocked(publishMyRequest);
const uploadRequestPhotosMock = vi.mocked(uploadRequestPhotos);

const toastMessageMock = vi.mocked(toast.message);
const toastErrorMock = vi.mocked(toast.error);
const toastSuccessMock = vi.mocked(toast.success);

type SubmitHandler = ReturnType<typeof useCreateRequestSubmit>;
type SubmitParams = Parameters<typeof useCreateRequestSubmit>[0];

let capturedSubmit: SubmitHandler | null = null;

function SubmitProbe(props: SubmitParams) {
  const submit = useCreateRequestSubmit(props);
  React.useEffect(() => {
    capturedSubmit = submit;
  }, [submit]);
  return <div data-testid="submit-probe" />;
}

function buildValidValues(overrides: Partial<CreateRequestValues> = {}): CreateRequestValues {
  return {
    title: 'Window cleaning in apartment',
    serviceKey: 'window-cleaning',
    cityId: 'berlin',
    propertyType: 'apartment',
    area: 50,
    price: 120,
    preferredDate: '2026-04-12',
    isRecurring: false,
    description: '  Need help with windows  ',
    tags: ['fast'],
    ...overrides,
  };
}

function buildSubmitEvent(intent: 'draft' | 'publish'): React.BaseSyntheticEvent {
  const submitter = document.createElement('button');
  submitter.value = intent;
  return {
    nativeEvent: {
      submitter,
    },
  } as React.BaseSyntheticEvent;
}

function setupSubmit(overrides: Partial<SubmitParams> = {}) {
  const push = vi.fn();
  const onSubmitIntentChange = vi.fn();
  const clearDraft = vi.fn();

  const params: SubmitParams = {
    t: (key) => String(key),
    router: { push },
    authStatus: 'authenticated',
    searchParams: {
      toString: () => 'service=window-cleaning&city=berlin',
    },
    isDirectProviderFlow: false,
    availableDaySet: new Set<string>(),
    directSelectDateError: 'request.directSelectDateError',
    photoItems: [],
    onSubmitIntentChange,
    clearDraft,
    ...overrides,
  };

  render(<SubmitProbe {...params} />);
  expect(capturedSubmit).toBeTypeOf('function');

  return {
    push,
    onSubmitIntentChange,
    clearDraft,
  };
}

describe('useCreateRequestSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSubmit = null;

    createRequestMock.mockResolvedValue({ id: 'request-1' } as never);
    publishMyRequestMock.mockResolvedValue({ id: 'request-1' } as never);
    uploadRequestPhotosMock.mockResolvedValue({ urls: ['https://cdn.example.com/a.jpg'] } as never);
  });

  afterEach(() => {
    cleanup();
  });

  it('blocks direct flow submit when selected date is outside available slots', async () => {
    const { push, onSubmitIntentChange, clearDraft } = setupSubmit({
      isDirectProviderFlow: true,
      availableDaySet: new Set(['2026-04-15']),
      directSelectDateError: 'request.directSelectDateError',
    });

    const values = buildValidValues({ preferredDate: '2026-04-12' });

    await act(async () => {
      await capturedSubmit?.(values);
    });

    expect(createRequestMock).not.toHaveBeenCalled();
    expect(uploadRequestPhotosMock).not.toHaveBeenCalled();
    expect(publishMyRequestMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith('request.directSelectDateError');
    expect(push).not.toHaveBeenCalled();
    expect(clearDraft).not.toHaveBeenCalled();
    expect(onSubmitIntentChange).toHaveBeenNthCalledWith(1, 'publish');
    expect(onSubmitIntentChange).toHaveBeenLastCalledWith(null);
  });

  it('continues create/publish flow when photo upload is forbidden (403)', async () => {
    uploadRequestPhotosMock.mockRejectedValueOnce(new ApiError('Forbidden', 403));
    const { push, clearDraft, onSubmitIntentChange } = setupSubmit({
      photoItems: [{ file: new File(['x'], 'photo.png', { type: 'image/png' }) }],
    });

    const values = buildValidValues();

    await act(async () => {
      await capturedSubmit?.(values);
    });

    expect(uploadRequestPhotosMock).toHaveBeenCalledTimes(1);
    expect(toastMessageMock).toHaveBeenCalledWith('request.photosUploadForbidden');
    expect(createRequestMock).toHaveBeenCalledTimes(1);
    expect(createRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        preferredDate: new Date(values.preferredDate).toISOString(),
        description: 'Need help with windows',
        photos: undefined,
        tags: ['fast'],
        price: 120,
      }),
    );
    expect(publishMyRequestMock).toHaveBeenCalledWith('request-1');
    expect(clearDraft).toHaveBeenCalledTimes(1);
    expect(toastSuccessMock).toHaveBeenCalledWith('request.published');
    expect(push).toHaveBeenCalledWith('/workspace?section=requests');
    expect(onSubmitIntentChange).toHaveBeenNthCalledWith(1, 'publish');
    expect(onSubmitIntentChange).toHaveBeenLastCalledWith(null);
  });

  it('redirects to login on API 401 and keeps resumable next path intent', async () => {
    createRequestMock.mockRejectedValueOnce(new ApiError('Unauthorized', 401));
    const { push, clearDraft, onSubmitIntentChange } = setupSubmit();

    await act(async () => {
      await capturedSubmit?.(buildValidValues(), buildSubmitEvent('draft'));
    });

    expect(clearDraft).not.toHaveBeenCalled();
    expect(toastErrorMock).not.toHaveBeenCalled();
    expect(toastMessageMock).toHaveBeenCalledWith('requestDetails.loginRequired');
    expect(push).toHaveBeenCalledTimes(1);

    const pushedHref = String(push.mock.calls[0]?.[0] ?? '');
    const loginUrl = new URL(pushedHref, 'http://localhost');
    expect(loginUrl.pathname).toBe('/auth/login');

    const next = loginUrl.searchParams.get('next') ?? '';
    expect(next).toContain('/request/create');
    expect(next).toContain('service=window-cleaning');
    expect(next).toContain('city=berlin');
    expect(next).toContain('intent=draft');
    expect(onSubmitIntentChange).toHaveBeenNthCalledWith(1, 'draft');
    expect(onSubmitIntentChange).toHaveBeenLastCalledWith(null);
  });
});
