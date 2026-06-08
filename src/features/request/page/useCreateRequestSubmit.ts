import * as React from 'react';
import { toast } from 'sonner';
import type { I18nKey } from '@/lib/i18n/keys';
import { ApiError } from '@/lib/api/http-error';
import { createRequest, publishMyRequest, uploadRequestPhotos } from '@/lib/api/requests';
import type { CreateRequestValues } from '@/features/request/create.schema';
import { parseDateSafe, toIsoDayLocal } from '@/lib/utils/date';

type Translate = (key: I18nKey) => string;

type SubmitIntent = 'draft' | 'publish';

type RouterLike = {
  push: (href: string) => void;
};

type Params = {
  t: Translate;
  router: RouterLike;
  authStatus: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  searchParams: { toString: () => string };
  isDirectProviderFlow: boolean;
  availableDaySet: Set<string>;
  directSelectDateError: string;
  photoItems: Array<{ file: File }>;
  onSubmitIntentChange: (intent: SubmitIntent | null) => void;
  clearDraft: () => void;
};

function buildCreateRequestNextPath(searchParams: { toString: () => string }, submitIntent: SubmitIntent) {
  const currentParams = new URLSearchParams(searchParams.toString());
  currentParams.set('intent', submitIntent);
  return `/request/create${currentParams.toString() ? `?${currentParams.toString()}` : ''}`;
}

export function useCreateRequestSubmit({
  t,
  router,
  authStatus,
  searchParams,
  isDirectProviderFlow,
  availableDaySet,
  directSelectDateError,
  photoItems,
  onSubmitIntentChange,
  clearDraft,
}: Params) {
  return React.useCallback(
    async (values: CreateRequestValues, event?: React.BaseSyntheticEvent) => {
      const submitter = (event?.nativeEvent as SubmitEvent | undefined)?.submitter;
      const submitIntent: SubmitIntent =
        submitter instanceof HTMLButtonElement && submitter.value === 'draft' ? 'draft' : 'publish';
      onSubmitIntentChange(submitIntent);

      if (authStatus !== 'authenticated') {
        toast.message(t('requestDetails.loginRequired'));
        const nextPath = buildCreateRequestNextPath(searchParams, submitIntent);
        router.push(`/auth/login?next=${encodeURIComponent(nextPath)}`);
        onSubmitIntentChange(null);
        return;
      }

      try {
        if (isDirectProviderFlow) {
          const selected = parseDateSafe(values.preferredDate);
          const selectedIso = selected ? toIsoDayLocal(selected) : '';
          if (!selectedIso || !availableDaySet.has(selectedIso)) {
            toast.error(directSelectDateError);
            return;
          }
        }

        const preferredDateIso = values.preferredDate
          ? new Date(values.preferredDate).toISOString()
          : values.preferredDate;

        let uploads: { urls: string[] } = { urls: [] };
        if (photoItems.length > 0) {
          try {
            uploads = await uploadRequestPhotos(photoItems.map((item) => item.file));
          } catch (error) {
            if (error instanceof ApiError && error.status === 403) {
              uploads = { urls: [] };
              toast.message(t('request.photosUploadForbidden'));
            } else {
              throw error;
            }
          }
        }

        const response = await createRequest({
          ...values,
          preferredDate: preferredDateIso,
          description: values.description?.trim() || undefined,
          photos: uploads.urls.length ? uploads.urls : undefined,
          tags: values.tags?.length ? values.tags : undefined,
          price: values.price ?? undefined,
        });

        if (submitIntent === 'publish') {
          await publishMyRequest(response.id);
        }

        clearDraft();
        toast.success(t(submitIntent === 'publish' ? 'request.published' : 'request.created'));
        router.push(
          submitIntent === 'publish'
            ? '/workspace?section=requests'
            : '/workspace?section=requests&scope=my&period=90d&range=90d',
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          toast.message(t('requestDetails.loginRequired'));
          const nextPath = buildCreateRequestNextPath(searchParams, submitIntent);
          router.push(`/auth/login?next=${encodeURIComponent(nextPath)}`);
          return;
        }
        const message = error instanceof Error ? error.message : t('common.loadError');
        toast.error(message);
      } finally {
        onSubmitIntentChange(null);
      }
    },
    [
      authStatus,
      availableDaySet,
      clearDraft,
      directSelectDateError,
      isDirectProviderFlow,
      onSubmitIntentChange,
      photoItems,
      router,
      searchParams,
      t,
    ],
  );
}
