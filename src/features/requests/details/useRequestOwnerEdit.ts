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
  const explicitTrend =
    request.priceTrend === 'down' || request.priceTrend === 'up' ? request.priceTrend : null;
  return (
    explicitTrend ??
    (typeof request.previousPrice === 'number' && typeof request.price === 'number'
      ? request.price < request.previousPrice
        ? 'down'
        : request.price > request.previousPrice
          ? 'up'
          : null
      : null)
  );
}

function patchRequestListPayload(
  payload: unknown,
  requestId: string,
  patchedRequest: RequestResponseDto,
) {
  if (!payload || typeof payload !== 'object') return payload;
  if (!('items' in (payload as Record<string, unknown>))) return payload;
  const currentItems = (payload as { items?: RequestResponseDto[] }).items;
  if (!Array.isArray(currentItems)) return payload;
  return {
    ...(payload as Record<string, unknown>),
    items: currentItems.map((item) => (item.id === requestId ? { ...item, ...patchedRequest } : item)),
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
        description: nextDescription || undefined,
        price: parsedPrice,
        photos: ownerPhotos,
      });

      const finalRequest =
        intent === 'publish' && updated.status === 'draft'
          ? await publishMyRequest(request.id)
          : updated;

      const prevPrice = typeof request.price === 'number' ? request.price : null;
      const nextPrice = typeof finalRequest.price === 'number' ? finalRequest.price : null;
      const explicitTrend =
        finalRequest.priceTrend === 'down' || finalRequest.priceTrend === 'up'
          ? finalRequest.priceTrend
          : null;
      const derivedTrend =
        explicitTrend ??
        (prevPrice != null && nextPrice != null
          ? nextPrice < prevPrice
            ? 'down'
            : nextPrice > prevPrice
              ? 'up'
              : null
          : null);
      const patchedRequest: RequestResponseDto = {
        ...finalRequest,
        previousPrice:
          typeof finalRequest.previousPrice === 'number'
            ? finalRequest.previousPrice
            : derivedTrend && prevPrice != null
              ? prevPrice
              : null,
        priceTrend: derivedTrend,
      };

      setOwnerPriceTrend(derivedTrend);
      qc.setQueriesData({ queryKey: ['request-detail', request.id] }, patchedRequest);

      const patchList = (payload: unknown) => patchRequestListPayload(payload, request.id, patchedRequest);
      qc.setQueriesData({ queryKey: ['requests-explorer-public'] }, patchList);
      qc.setQueriesData({ queryKey: ['requests-public'] }, patchList);
      qc.setQueriesData({ queryKey: ['requests-my'] }, patchList);
      qc.setQueriesData({ queryKey: ['workspace-requests'] }, patchList);
      qc.setQueriesData({ queryKey: ['home-nearby-requests'] }, patchList);
      qc.setQueriesData({ queryKey: ['requests-latest'] }, patchList);
      qc.setQueriesData({ queryKey: ['request-similar'] }, patchList);

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
  }, [isOwner, ownerDescription, ownerPhotos, ownerPrice, ownerTitle, qc, request, t]);

  return {
    isOwnerEditMode,
    ownerTitle,
    ownerDescription,
    ownerPrice,
    ownerPhotos,
    isSavingOwner,
    isUploadingOwnerPhoto,
    activeOwnerSubmitIntent,
    ownerPriceTrend,
    setIsOwnerEditMode,
    setOwnerTitle,
    setOwnerDescription,
    setOwnerPrice,
    setOwnerPhotos,
    handleOwnerClearText,
    handleOwnerPhotoPick,
    handleOwnerSave,
  };
}
