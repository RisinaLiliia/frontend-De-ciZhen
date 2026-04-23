import * as React from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { publishMyRequest, updateMyRequest, uploadRequestPhotos } from '@/lib/api/requests';
import { ApiError } from '@/lib/api/http-error';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { RequestResponseDto } from '@/lib/api/dto/requests';

type Translate = (key: I18nKey) => string;

type UseRequestOwnerEditParams = {
  request: RequestResponseDto | null | undefined;
  isOwner: boolean;
  showOwnerBadge: boolean;
  shouldOpenOwnerEdit: boolean;
  qc: QueryClient;
  t: Translate;
};

function resolveRequestPriceTrend(request: RequestResponseDto) {
  return request.priceTrend === 'down' || request.priceTrend === 'up'
    ? request.priceTrend
    : null;
}

function toDateInputValue(value?: string | null) {
  const date = value ? new Date(value) : new Date();
  if (!Number.isFinite(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
}

function toPreferredDateIso(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T09:00:00`);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function patchRequestCollectionPayload(
  payload: unknown,
  requestId: string,
  patchedRequest: RequestResponseDto,
) {
  if (Array.isArray(payload)) {
    return payload.map((item) => {
      if (!item || typeof item !== 'object' || !('id' in item)) return item;
      return (item as RequestResponseDto).id === requestId
        ? { ...(item as RequestResponseDto), ...patchedRequest }
        : item;
    });
  }

  if (!payload || typeof payload !== 'object') return payload;
  if (!('items' in (payload as Record<string, unknown>))) return payload;
  const currentItems = (payload as { items?: RequestResponseDto[] }).items;
  if (!Array.isArray(currentItems)) return payload;
  return {
    ...(payload as Record<string, unknown>),
    items: currentItems.map((item) => (item.id === requestId ? { ...item, ...patchedRequest } : item)),
  };
}

function patchWorkspaceManagedRequestPayload(
  payload: unknown,
  requestId: string,
  patchedRequest: RequestResponseDto,
) {
  if (!payload || typeof payload !== 'object') return payload;
  if (!('request' in (payload as Record<string, unknown>))) return payload;

  const currentRequest = (payload as { request?: RequestResponseDto | null }).request;
  if (!currentRequest || currentRequest.id !== requestId) return payload;

  return {
    ...(payload as Record<string, unknown>),
    request: {
      ...currentRequest,
      ...patchedRequest,
    },
  };
}

export function useRequestOwnerEdit({
  request,
  isOwner,
  showOwnerBadge,
  shouldOpenOwnerEdit,
  qc,
  t,
}: UseRequestOwnerEditParams) {
  const [isOwnerEditMode, setIsOwnerEditMode] = React.useState(false);
  const [ownerTitle, setOwnerTitle] = React.useState('');
  const [ownerDescription, setOwnerDescription] = React.useState('');
  const [ownerPrice, setOwnerPrice] = React.useState('');
  const [ownerCityId, setOwnerCityId] = React.useState('');
  const [ownerPreferredDate, setOwnerPreferredDate] = React.useState('');
  const [ownerPhotos, setOwnerPhotos] = React.useState<string[]>([]);
  const [isSavingOwner, setIsSavingOwner] = React.useState(false);
  const [isUploadingOwnerPhoto, setIsUploadingOwnerPhoto] = React.useState(false);
  const [activeOwnerSubmitIntent, setActiveOwnerSubmitIntent] = React.useState<'draft' | 'publish' | null>(null);
  const [ownerPriceTrend, setOwnerPriceTrend] = React.useState<'up' | 'down' | null>(null);

  React.useEffect(() => {
    if (!request) return;
    setOwnerTitle(request.title?.trim() || '');
    setOwnerDescription(request.description?.trim() || '');
    setOwnerPrice(
      typeof request.price === 'number' && Number.isFinite(request.price) ? String(Math.round(request.price)) : '',
    );
    setOwnerCityId(request.cityId ?? '');
    setOwnerPreferredDate(toDateInputValue(request.preferredDate));
    setOwnerPhotos((request.photos ?? []).filter(Boolean).slice(0, 4));
    setOwnerPriceTrend(resolveRequestPriceTrend(request));
  }, [request]);

  React.useEffect(() => {
    if (!showOwnerBadge) {
      setIsOwnerEditMode(false);
      return;
    }
    if (shouldOpenOwnerEdit || request?.status === 'draft') {
      setIsOwnerEditMode(true);
    }
  }, [request?.status, showOwnerBadge, shouldOpenOwnerEdit]);

  const handleOwnerClearText = React.useCallback(() => {
    setOwnerTitle('');
    setOwnerDescription('');
  }, []);

  const handleOwnerPhotoPick = React.useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      if (ownerPhotos.length >= 4) return;

      const first = Array.from(files).slice(0, 4 - ownerPhotos.length);
      if (!first.length) return;
      setIsUploadingOwnerPhoto(true);
      try {
        const uploaded = await uploadRequestPhotos(first);
        if (uploaded.urls.length) {
          setOwnerPhotos((prev) => [...prev, ...uploaded.urls].slice(0, 4));
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) {
          toast.message(t(I18N_KEYS.request.photosUploadForbidden));
        } else {
          toast.error(t(I18N_KEYS.request.photosError));
        }
      } finally {
        setIsUploadingOwnerPhoto(false);
      }
    },
    [ownerPhotos.length, t],
  );

  const handleOwnerSave = React.useCallback(async (intent: 'draft' | 'publish' = 'draft') => {
    if (!request || !isOwner) return;
    const nextTitle = ownerTitle.trim();
    if (!nextTitle) return;
    const nextDescription = ownerDescription.trim();
    const nextCityId = ownerCityId.trim();
    if (!nextCityId) {
      toast.message(t(I18N_KEYS.request.errorCityRequired));
      return;
    }
    const nextPreferredDate = toPreferredDateIso(ownerPreferredDate);
    if (!nextPreferredDate) {
      toast.message(t(I18N_KEYS.request.errorDateRequired));
      return;
    }
    const parsedPrice = ownerPrice.trim() === '' ? undefined : Number(ownerPrice);
    if (parsedPrice !== undefined && (!Number.isFinite(parsedPrice) || parsedPrice <= 0)) {
      toast.message(t(I18N_KEYS.requestDetails.responseAmountInvalid));
      return;
    }

    setIsSavingOwner(true);
    setActiveOwnerSubmitIntent(intent);
    try {
      const updated = await updateMyRequest(request.id, {
        title: nextTitle,
        cityId: nextCityId,
        preferredDate: nextPreferredDate,
        description: nextDescription || undefined,
        price: parsedPrice,
        photos: ownerPhotos,
      });

      const finalRequest =
        intent === 'publish' && updated.status === 'draft'
          ? await publishMyRequest(request.id)
          : updated;
      setOwnerPriceTrend(resolveRequestPriceTrend(finalRequest));
      qc.setQueriesData({ queryKey: ['request-detail', request.id] }, finalRequest);
      qc.setQueriesData(
        { queryKey: ['workspace-managed-request', request.id] },
        (current) => patchWorkspaceManagedRequestPayload(current, request.id, finalRequest),
      );

      const patchCollection = (payload: unknown) => patchRequestCollectionPayload(payload, request.id, finalRequest);
      qc.setQueriesData({ queryKey: ['requests-explorer-public'] }, patchCollection);
      qc.setQueriesData({ queryKey: ['requests-public'] }, patchCollection);
      qc.setQueriesData({ queryKey: ['requests-my'] }, patchCollection);
      qc.setQueriesData({ queryKey: ['home-nearby-requests'] }, patchCollection);
      qc.setQueriesData({ queryKey: ['requests-latest'] }, patchCollection);
      qc.setQueriesData({ queryKey: ['request-similar'] }, patchCollection);

      qc.invalidateQueries({ queryKey: ['requests-explorer-public'] });
      qc.invalidateQueries({ queryKey: ['requests-public'] });
      qc.invalidateQueries({ queryKey: ['requests-my'] });
      qc.invalidateQueries({ queryKey: ['workspace-requests'] });
      qc.invalidateQueries({ queryKey: ['workspace-private-overview'] });
      qc.invalidateQueries({ queryKey: ['requests-latest'] });
      qc.invalidateQueries({ queryKey: ['request-similar'] });
      qc.invalidateQueries({ queryKey: ['home-nearby-requests'] });

      setIsOwnerEditMode(false);
      toast.success(
        intent === 'publish'
          ? t(I18N_KEYS.request.published)
          : t(I18N_KEYS.requestDetails.ownerUpdated),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setIsSavingOwner(false);
      setActiveOwnerSubmitIntent(null);
    }
  }, [isOwner, ownerCityId, ownerDescription, ownerPhotos, ownerPreferredDate, ownerPrice, ownerTitle, qc, request, t]);

  return {
    isOwnerEditMode,
    ownerTitle,
    ownerDescription,
    ownerPrice,
    ownerCityId,
    ownerPreferredDate,
    ownerPhotos,
    isSavingOwner,
    isUploadingOwnerPhoto,
    activeOwnerSubmitIntent,
    ownerPriceTrend,
    setIsOwnerEditMode,
    setOwnerTitle,
    setOwnerDescription,
    setOwnerPrice,
    setOwnerCityId,
    setOwnerPreferredDate,
    setOwnerPhotos,
    handleOwnerClearText,
    handleOwnerPhotoPick,
    handleOwnerSave,
  };
}
