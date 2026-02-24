//src/app/requests/[id]/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { IconEdit, IconTrash } from '@/components/ui/icons/icons';
import {
  RequestDetailAbout,
  RequestDetailAside,
  RequestDetailClient,
  RequestDetailError,
  RequestDetailGallery,
  RequestDetailHeader,
  RequestDetailLoading,
  RequestDetailMobileCta,
  RequestOfferSheet,
  RequestDetailSimilar,
} from '@/components/requests/details';
import { getStatusBadgeClass } from '@/lib/statusBadge';
import { getPublicRequestById, listPublicRequests, updateMyRequest, uploadRequestPhotos } from '@/lib/api/requests';
import { createOffer, deleteOffer, listMyProviderOffers, updateOffer } from '@/lib/api/offers';
import { addFavorite, listFavorites, removeFavorite } from '@/lib/api/favorites';
import { getMyProviderProfile } from '@/lib/api/providers';
import { ApiError } from '@/lib/api/http-error';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { useAuthMe, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { buildRequestImageList } from '@/lib/requests/images';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import {
  buildRequestDetailsViewModel,
  type RequestDetailsViewModel,
} from '@/features/requests/details/viewModel';

const SIMILAR_LIMIT = 2;
const WORKSPACE_MY_REQUESTS_URL = '/orders?tab=my-requests&sort=date_desc&page=1&limit=10';
const WORKSPACE_NEW_ORDERS_URL = '/orders?tab=new-orders&sort=date_desc&page=1&limit=10';

export default function RequestDetailsPage() {
  const t = useT();
  const { locale } = useI18n();
  const authStatus = useAuthStatus();
  const authUser = useAuthUser();
  const authMe = useAuthMe();
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const requestId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const actionHandledRef = React.useRef(false);

  const [offerAmount, setOfferAmount] = React.useState('');
  const [offerComment, setOfferComment] = React.useState('');
  const [offerAvailability, setOfferAvailability] = React.useState('');
  const [offerSheetMode, setOfferSheetMode] = React.useState<'form' | 'success'>('form');
  const [isSubmittingOffer, setIsSubmittingOffer] = React.useState(false);
  const [submittedOfferAmount, setSubmittedOfferAmount] = React.useState<number | null>(null);
  const [isOwnerEditMode, setIsOwnerEditMode] = React.useState(false);
  const [ownerTitle, setOwnerTitle] = React.useState('');
  const [ownerDescription, setOwnerDescription] = React.useState('');
  const [ownerPrice, setOwnerPrice] = React.useState('');
  const [ownerPhotos, setOwnerPhotos] = React.useState<string[]>([]);
  const [isSavingOwner, setIsSavingOwner] = React.useState(false);
  const [isUploadingOwnerPhoto, setIsUploadingOwnerPhoto] = React.useState(false);
  const [ownerPriceTrend, setOwnerPriceTrend] = React.useState<'up' | 'down' | null>(null);
  const ownerPhotoInputRef = React.useRef<HTMLInputElement | null>(null);

  const isAuthed = authStatus === 'authenticated';

  const {
    data: request,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['request-detail', requestId],
    enabled: Boolean(requestId),
    queryFn: () => getPublicRequestById(String(requestId)),
  });

  const { data: similarData } = useQuery({
    queryKey: ['request-similar', request?.id, request?.categoryKey, request?.serviceKey],
    enabled: Boolean(request?.id),
    queryFn: () =>
      listPublicRequests({
        categoryKey: request?.categoryKey ?? undefined,
        sort: 'date_desc',
        limit: 20,
      }),
  });

  const { data: myResponses } = useQuery({
    queryKey: ['offers-my'],
    enabled: authStatus === 'authenticated',
    queryFn: () => withStatusFallback(() => listMyProviderOffers(), []),
  });

  const { data: providerProfile } = useQuery({
    queryKey: ['provider-profile'],
    enabled: authStatus === 'authenticated',
    queryFn: () => withStatusFallback(() => getMyProviderProfile(), null),
  });

  const { data: favoriteRequests } = useQuery({
    queryKey: ['favorite-requests'],
    enabled: authStatus === 'authenticated',
    queryFn: () => withStatusFallback(() => listFavorites('request'), []),
  });

  const existingResponse = React.useMemo(() => {
    if (!isAuthed || !request || !myResponses) return null;
    return myResponses.find((response) => response.requestId === request.id) ?? null;
  }, [isAuthed, myResponses, request]);

  const isSaved = React.useMemo(() => {
    if (!request || !favoriteRequests) return false;
    return favoriteRequests.some((item) => item.id === request.id);
  }, [favoriteRequests, request]);

  const updateFavoritesCache = React.useCallback(
    (nextSaved: boolean) => {
      if (!request) return;
      qc.setQueryData<RequestResponseDto[]>(['favorite-requests'], (prev) => {
        const list = prev ? [...prev] : [];
        const exists = list.some((item) => item.id === request.id);
        if (nextSaved && !exists) return [request, ...list];
        if (!nextSaved && exists) return list.filter((item) => item.id !== request.id);
        return list;
      });
    },
    [qc, request],
  );

  const setFavorite = React.useCallback(
    async (nextSaved: boolean) => {
      if (!request) return;
      updateFavoritesCache(nextSaved);
      try {
        if (nextSaved) {
          await addFavorite('request', request.id);
          toast.success(t(I18N_KEYS.requestDetails.saved));
        } else {
          await removeFavorite('request', request.id);
          toast.message(t(I18N_KEYS.requestDetails.favoritesRemoved));
        }
      } catch {
        updateFavoritesCache(!nextSaved);
        toast.error(t(I18N_KEYS.requestDetails.favoritesFailed));
      }
    },
    [request, t, updateFavoritesCache],
  );

  const isOwner = isAuthed && Boolean(request?.clientId) && request?.clientId === authUser?.id;
  const shouldOpenOwnerEdit = searchParams?.get('edit') === '1';
  const isOfferSheetOpen = searchParams?.get('offer') === '1';
  const isOfferAccepted = existingResponse?.status === 'accepted';
  const hasOffer = isAuthed && Boolean(existingResponse || submittedOfferAmount !== null);
  const showOfferCta = !isOwner;
  const showChatCta = !isOwner;
  const showFavoriteCta = !isOwner;
  const showOwnerBadge = isAuthed && isOwner;

  React.useEffect(() => {
    if (!request) return;
    setOwnerTitle(request.title?.trim() || '');
    setOwnerDescription(request.description?.trim() || '');
    setOwnerPrice(
      typeof request.price === 'number' && Number.isFinite(request.price) ? String(Math.round(request.price)) : '',
    );
    setOwnerPhotos((request.photos ?? []).filter(Boolean).slice(0, 4));
    const explicitTrend =
      request.priceTrend === 'down' || request.priceTrend === 'up' ? request.priceTrend : null;
    const derivedTrend =
      explicitTrend ??
      (typeof request.previousPrice === 'number' && typeof request.price === 'number'
        ? request.price < request.previousPrice
          ? 'down'
          : request.price > request.previousPrice
            ? 'up'
            : null
        : null);
    setOwnerPriceTrend(derivedTrend);
  }, [request]);

  React.useEffect(() => {
    if (!showOwnerBadge) {
      setIsOwnerEditMode(false);
      return;
    }
    if (shouldOpenOwnerEdit) {
      setIsOwnerEditMode(true);
    }
  }, [showOwnerBadge, shouldOpenOwnerEdit]);

  React.useEffect(() => {
    if (isAuthed) return;
    setSubmittedOfferAmount(null);
    setOfferAmount('');
    setOfferComment('');
    setOfferAvailability('');
  }, [isAuthed]);

  const requireAuth = React.useCallback(
    () => {
      router.push('/auth/login');
      toast.message(t(I18N_KEYS.requestDetails.loginRequired));
    },
    [router, t],
  );

  const setOfferSheetInUrl = React.useCallback(
    (open: boolean) => {
      const nextParams = new URLSearchParams(searchParams?.toString());
      if (open) {
        nextParams.set('offer', '1');
      } else {
        nextParams.delete('offer');
      }
      const qs = nextParams.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`);
    },
    [pathname, router, searchParams],
  );

  const openOfferForm = React.useCallback(() => {
    if (existingResponse) {
      setOfferAmount(
        typeof existingResponse.amount === 'number'
          ? String(Math.max(1, Math.round(existingResponse.amount)))
          : '',
      );
      setOfferComment(existingResponse.message ?? '');
      setOfferAvailability(existingResponse.availabilityNote ?? existingResponse.availableAt ?? '');
    } else {
      if (!offerAmount && request?.price) {
        setOfferAmount(String(Math.max(1, Math.round(request.price))));
      }
      setOfferComment('');
      setOfferAvailability('');
    }
    setOfferSheetMode('form');
    setOfferSheetInUrl(true);
  }, [existingResponse, offerAmount, request?.price, setOfferSheetInUrl]);

  const handleApply = React.useCallback(() => {
    if (!request) return;
    if (authStatus !== 'authenticated') {
      requireAuth();
      return;
    }
    if (isOwner) {
      toast.message(t(I18N_KEYS.requestDetails.selfBidError));
      return;
    }
    if (isOfferAccepted) {
      router.push('/orders?tab=completed-jobs');
      return;
    }
    openOfferForm();
  }, [
    authStatus,
    isOfferAccepted,
    isOwner,
    openOfferForm,
    request,
    requireAuth,
    router,
    t,
  ]);

  const handleOfferSubmit = React.useCallback(async () => {
    if (!request || authStatus !== 'authenticated') return;
    const parsedAmount = Number(offerAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.message(t(I18N_KEYS.requestDetails.responseAmountInvalid));
      return;
    }

    setIsSubmittingOffer(true);
    try {
      const payload = {
        amount: parsedAmount,
        message: offerComment.trim() || undefined,
        availabilityNote: offerAvailability.trim() || undefined,
      };
      const response =
        existingResponse?.id
          ? await updateOffer(existingResponse.id, payload)
          : await createOffer({
              requestId: request.id,
              ...payload,
            });
      setSubmittedOfferAmount(response.offer.amount ?? parsedAmount);
      if (existingResponse?.id) {
        setOfferSheetInUrl(false);
        toast.success(t(I18N_KEYS.requestDetails.responseUpdated));
      } else {
        setOfferSheetMode('success');
      }
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['offers-my'] }),
        qc.invalidateQueries({ queryKey: ['provider-profile'] }),
      ]);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        toast.message(t(I18N_KEYS.requestDetails.responseEditUnavailable));
      } else if (error instanceof ApiError && error.status === 409) {
        setSubmittedOfferAmount(parsedAmount);
        setOfferSheetInUrl(false);
        toast.message(t(I18N_KEYS.requestDetails.responseAlready));
      } else if (error instanceof ApiError && error.status === 403) {
        toast.error(error.message || t(I18N_KEYS.requestDetails.responseFailed));
      } else {
        toast.error(t(I18N_KEYS.requestDetails.responseFailed));
      }
    } finally {
      setIsSubmittingOffer(false);
    }
  }, [
    authStatus,
    existingResponse?.id,
    offerAmount,
    offerAvailability,
    offerComment,
    qc,
    request,
    setOfferSheetInUrl,
    t,
  ]);

  const handleOfferCancel = React.useCallback(async () => {
    if (isSubmittingOffer) return;

    if (!existingResponse?.id) {
      setOfferSheetMode('form');
      setSubmittedOfferAmount(null);
      setOfferAmount('');
      setOfferComment('');
      setOfferAvailability('');
      setOfferSheetInUrl(false);
      router.push(authStatus === 'authenticated' ? WORKSPACE_NEW_ORDERS_URL : '/requests');
      return;
    }

    setIsSubmittingOffer(true);
    try {
      await deleteOffer(existingResponse.id);
      setOfferSheetMode('form');
      setSubmittedOfferAmount(null);
      setOfferAmount('');
      setOfferComment('');
      setOfferAvailability('');
      setOfferSheetInUrl(false);
      toast.success(t(I18N_KEYS.requestDetails.responseCancelled));
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['offers-my'] }),
        qc.invalidateQueries({ queryKey: ['provider-profile'] }),
      ]);
    } catch {
      toast.error(t(I18N_KEYS.requestDetails.responseFailed));
    } finally {
      setIsSubmittingOffer(false);
    }
  }, [
    authStatus,
    existingResponse?.id,
    isSubmittingOffer,
    qc,
    router,
    setOfferSheetInUrl,
    t,
  ]);

  const handleChat = React.useCallback(() => {
    if (authStatus !== 'authenticated') {
      requireAuth();
      return;
    }
    if (isOwner) {
      toast.message(t(I18N_KEYS.requestDetails.ownerHint));
      return;
    }
    toast.message(t(I18N_KEYS.requestDetails.chatSoon));
  }, [authStatus, isOwner, requireAuth, t]);

  const handleFavorite = React.useCallback(() => {
    if (!request) return;
    if (authStatus !== 'authenticated') {
      requireAuth();
      return;
    }
    if (isOwner) {
      toast.message(t(I18N_KEYS.requestDetails.ownerHint));
      return;
    }
    void setFavorite(!isSaved);
  }, [authStatus, isOwner, isSaved, request, requireAuth, setFavorite, t]);

  const handleOwnerClearText = React.useCallback(() => {
    setOwnerTitle('');
    setOwnerDescription('');
  }, []);

  const handleOwnerPhotoPick = React.useCallback(async (files: FileList | null) => {
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
  }, [ownerPhotos.length, t]);

  const handleOwnerSave = React.useCallback(async () => {
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
    try {
      const updated = await updateMyRequest(request.id, {
        title: nextTitle,
        description: nextDescription || undefined,
        price: parsedPrice,
        photos: ownerPhotos,
      });

      const prevPrice = typeof request.price === 'number' ? request.price : null;
      const nextPrice = typeof updated.price === 'number' ? updated.price : null;
      const explicitTrend =
        updated.priceTrend === 'down' || updated.priceTrend === 'up' ? updated.priceTrend : null;
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
        ...updated,
        previousPrice:
          typeof updated.previousPrice === 'number'
            ? updated.previousPrice
            : derivedTrend && prevPrice != null
              ? prevPrice
              : null,
        priceTrend: derivedTrend,
      };

      setOwnerPriceTrend(derivedTrend);
      qc.setQueryData(['request-detail', request.id], patchedRequest);

      const patchItem = (item: RequestResponseDto): RequestResponseDto =>
        item.id === request.id ? { ...item, ...patchedRequest } : item;
      const patchListPayload = (payload: unknown) => {
        if (!payload || typeof payload !== 'object') return payload;
        if (!('items' in (payload as Record<string, unknown>))) return payload;
        const currentItems = (payload as { items?: RequestResponseDto[] }).items;
        if (!Array.isArray(currentItems)) return payload;
        return {
          ...(payload as Record<string, unknown>),
          items: currentItems.map(patchItem),
        };
      };
      qc.setQueriesData({ queryKey: ['orders-explorer-public'] }, patchListPayload);
      qc.setQueriesData({ queryKey: ['requests-public'] }, patchListPayload);
      qc.setQueriesData({ queryKey: ['requests-my'] }, patchListPayload);
      qc.setQueriesData({ queryKey: ['home-nearby-requests'] }, patchListPayload);
      qc.setQueriesData({ queryKey: ['requests-latest'] }, patchListPayload);
      qc.setQueriesData({ queryKey: ['request-similar'] }, patchListPayload);

      qc.invalidateQueries({ queryKey: ['orders-explorer-public'] });
      qc.invalidateQueries({ queryKey: ['requests-public'] });
      qc.invalidateQueries({ queryKey: ['requests-my'] });
      qc.invalidateQueries({ queryKey: ['requests-latest'] });
      qc.invalidateQueries({ queryKey: ['request-similar'] });
      qc.invalidateQueries({ queryKey: ['home-nearby-requests'] });

      setIsOwnerEditMode(false);
      toast.success(t(I18N_KEYS.requestDetails.ownerUpdated));
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setIsSavingOwner(false);
    }
  }, [isOwner, ownerDescription, ownerPhotos, ownerPrice, ownerTitle, qc, request, t]);

  const localeTag = locale === 'de' ? 'de-DE' : 'en-US';
  const formatPrice = React.useMemo(
    () =>
      new Intl.NumberFormat(localeTag, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    [localeTag],
  );
  const formatDate = React.useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    [localeTag],
  );

  const similar = React.useMemo(() => {
    if (!request) return [];
    const items = similarData?.items ?? [];
    const filtered = items
      .filter(
        (item) =>
          item.id !== request.id &&
          (item.categoryKey === request.categoryKey || item.serviceKey === request.serviceKey),
      )
      .slice(0, SIMILAR_LIMIT);
    if (filtered.length) return filtered;
    return items.filter((item) => item.id !== request.id).slice(0, SIMILAR_LIMIT);
  }, [request, similarData]);

  const { data: latestData } = useQuery({
    queryKey: ['requests-latest'],
    enabled: Boolean(request?.id) && similar.length === 0,
    queryFn: () =>
      listPublicRequests({
        cityId: request?.cityId ?? undefined,
        sort: 'date_desc',
        limit: 12,
      }),
  });

  const latest = React.useMemo(() => {
    if (!request) return [];
    const items = latestData?.items ?? [];
    return items.filter((item) => item.id !== request.id).slice(0, SIMILAR_LIMIT);
  }, [latestData, request]);

  const similarFallbackMessage =
    similar.length === 0 && latest.length
      ? t(I18N_KEYS.requestDetails.noSimilarMessage)
      : undefined;
  const similarTitle =
    similar.length === 0 && latest.length
      ? t(I18N_KEYS.requestDetails.latestTitle)
      : t(I18N_KEYS.requestDetails.similar);

  const similarHref = React.useMemo(() => {
    const nextParams = new URLSearchParams();
    if (authStatus === 'authenticated') nextParams.set('tab', 'new-orders');
    if (request?.categoryKey) nextParams.set('categoryKey', request.categoryKey);
    if (request?.serviceKey) nextParams.set('subcategoryKey', request.serviceKey);
    nextParams.set('sort', 'date_desc');
    nextParams.set('page', '1');
    nextParams.set('limit', '10');
    const qs = nextParams.toString();
    return `${authStatus === 'authenticated' ? '/orders' : '/requests'}${qs ? `?${qs}` : ''}`;
  }, [authStatus, request]);

  const similarForRender = similar.length ? similar : latest;
  const [isClientOnline, setIsClientOnline] = React.useState(false);

  React.useEffect(() => {
    if (!request) return;
    if (typeof request.clientIsOnline === 'boolean') {
      setIsClientOnline(request.clientIsOnline);
      return;
    }
    if (request.clientLastSeenAt) {
      const lastSeen = new Date(request.clientLastSeenAt).getTime();
      const isRecent = Number.isFinite(lastSeen) ? Date.now() - lastSeen < 5 * 60 * 1000 : false;
      setIsClientOnline(isRecent);
      return;
    }
    setIsClientOnline(false);
  }, [request]);

  const viewModel = React.useMemo<RequestDetailsViewModel | null>(() => {
    if (!request) return null;
    return buildRequestDetailsViewModel({
      request,
      t,
      formatPrice: (value) => formatPrice.format(value),
      formatDate: (value) => formatDate.format(value),
      isClientOnline,
    });
  }, [formatDate, formatPrice, isClientOnline, request, t]);

  React.useEffect(() => {
    if (actionHandledRef.current) return;
    if (!request || authStatus !== 'authenticated') return;
    const action = searchParams?.get('action');
    if (!action) return;

    actionHandledRef.current = true;
    if (action === 'respond') {
      if (isOwner) {
        toast.message(t(I18N_KEYS.requestDetails.selfBidError));
      } else if (isOfferAccepted) {
        router.push('/orders?tab=completed-jobs');
      } else {
        openOfferForm();
      }
    } else if (action === 'chat') {
      if (isOwner) {
        toast.message(t(I18N_KEYS.requestDetails.ownerHint));
      } else {
        toast.message(t(I18N_KEYS.requestDetails.chatSoon));
      }
    } else if (action === 'favorite') {
      if (isOwner) {
        toast.message(t(I18N_KEYS.requestDetails.ownerHint));
      } else {
        if (!isSaved) {
          void setFavorite(true);
        } else {
          toast.success(t(I18N_KEYS.requestDetails.saved));
        }
      }
    }

    const nextParams = new URLSearchParams(searchParams?.toString());
    nextParams.delete('action');
    const nextQs = nextParams.toString();
    router.replace(`${pathname}${nextQs ? `?${nextQs}` : ''}`);
  }, [
    authStatus,
    isOfferAccepted,
    isOwner,
    isSaved,
    openOfferForm,
    pathname,
    request,
    router,
    searchParams,
    setFavorite,
    t,
  ]);

  if (isLoading) {
    return <RequestDetailLoading />;
  }

  if (isError || !request || !viewModel) {
    return <RequestDetailError message={t(I18N_KEYS.requestsPage.error)} />;
  }

  const applyLabel = isOfferAccepted
    ? t(I18N_KEYS.requestDetails.responseViewContract)
    : hasOffer
      ? t(I18N_KEYS.requestDetails.responseEditCta)
      : t(I18N_KEYS.requestDetails.ctaApply);
  const applyState = isOfferAccepted ? 'accepted' : hasOffer ? 'edit' : 'default';
  const applyTitle = hasOffer ? t(I18N_KEYS.requestDetails.responseEditTooltip) : undefined;
  const requestStatusView =
    request.status === 'matched'
      ? {
          token: 'in_progress',
          label: t(I18N_KEYS.requestDetails.statusInProgress),
        }
      : request.status === 'closed'
        ? {
            token: 'completed',
            label: t(I18N_KEYS.requestDetails.statusAccepted),
          }
        : request.status === 'cancelled'
          ? {
              token: 'cancelled',
              label: t(I18N_KEYS.requestDetails.statusCancelled),
            }
          : {
              token: 'sent',
              label: t(I18N_KEYS.requestDetails.statusReview),
          };

  const isProviderProfileComplete = (() => {
    if (!providerProfile) return false;
    const hasServices =
      Array.isArray(providerProfile.serviceKeys) && providerProfile.serviceKeys.length > 0;
    const hasBasePrice =
      typeof providerProfile.basePrice === 'number' && providerProfile.basePrice > 0;
    const hasIdentity =
      Boolean(providerProfile.displayName?.trim()) && Boolean(providerProfile.cityId?.trim());
    const isActive = providerProfile.status === 'active' && !providerProfile.isBlocked;
    return hasServices && hasBasePrice && hasIdentity && isActive;
  })();

  return (
    <PageShell
      right={<AuthActions />}
      showBack
      backHref={isAuthed ? WORKSPACE_MY_REQUESTS_URL : '/requests'}
      forceBackHref
      mainClassName="py-6"
    >
      <div className="request-detail">
        <section className="panel request-detail__panel">
          <RequestDetailHeader
            title={isOwnerEditMode ? ownerTitle || viewModel.title : viewModel.title}
            priceLabel={
              isOwnerEditMode
                ? ownerPrice.trim()
                  ? formatPrice.format(Number(ownerPrice))
                  : t(I18N_KEYS.requestDetails.priceOnRequest)
                : viewModel.priceLabel
            }
            priceTrend={
              request.priceTrend === 'down' || request.priceTrend === 'up'
                ? request.priceTrend
                : typeof request.previousPrice === 'number' && typeof request.price === 'number'
                  ? request.price < request.previousPrice
                    ? 'down'
                    : request.price > request.previousPrice
                      ? 'up'
                      : null
                  : null
            }
            priceTrendLabel={
              request.priceTrend === 'down' ||
              (typeof request.previousPrice === 'number' &&
                typeof request.price === 'number' &&
                request.price < request.previousPrice)
                ? t(I18N_KEYS.request.priceTrendDown)
                : request.priceTrend === 'up' ||
                    (typeof request.previousPrice === 'number' &&
                      typeof request.price === 'number' &&
                      request.price > request.previousPrice)
                  ? t(I18N_KEYS.request.priceTrendUp)
                  : null
            }
            tags={viewModel.tagList}
            badgeLabel={showOwnerBadge ? t(I18N_KEYS.requestDetails.ownerBadge) : undefined}
            statusBadge={
              <span className={getStatusBadgeClass(requestStatusView.token)}>{requestStatusView.label}</span>
            }
          />

          {showOwnerBadge ? (
            <section className="request-detail__owner-edit">
              <div className="request-detail__owner-actions">
                <button
                  type="button"
                  className="offer-action-btn offer-action-btn--icon-only icon-button icon-button--hint"
                  data-tooltip={t(I18N_KEYS.requestDetails.ownerEdit)}
                  aria-label={t(I18N_KEYS.requestDetails.ownerEdit)}
                  onClick={() => setIsOwnerEditMode((prev) => !prev)}
                >
                  <span className="offer-action-btn__icon">
                    <IconEdit />
                  </span>
                </button>
                <button
                  type="button"
                  className="offer-action-btn offer-action-btn--icon-only icon-button icon-button--hint"
                  data-tooltip={t(I18N_KEYS.requestDetails.ownerClear)}
                  aria-label={t(I18N_KEYS.requestDetails.ownerClear)}
                  onClick={handleOwnerClearText}
                  disabled={!isOwnerEditMode}
                >
                  <span className="offer-action-btn__icon">
                    <IconTrash />
                  </span>
                </button>
              </div>

              <div className="request-detail__owner-field">
                <Input
                  value={ownerTitle}
                  onChange={(event) => setOwnerTitle(event.target.value)}
                  maxLength={120}
                  disabled={!isOwnerEditMode}
                  placeholder={t(I18N_KEYS.request.titlePlaceholder)}
                  aria-label={t(I18N_KEYS.request.titleLabel)}
                />
              </div>

              <div className="request-detail__owner-field">
                <Textarea
                  value={ownerDescription}
                  onChange={(event) => setOwnerDescription(event.target.value)}
                  disabled={!isOwnerEditMode}
                  placeholder={t(I18N_KEYS.request.descriptionPlaceholder)}
                  aria-label={t(I18N_KEYS.request.descriptionLabel)}
                />
              </div>

              <div className="request-detail__owner-price-row">
                <Input
                  type="number"
                  min={1}
                  value={ownerPrice}
                  onChange={(event) => setOwnerPrice(event.target.value)}
                  disabled={!isOwnerEditMode}
                  placeholder={t(I18N_KEYS.request.pricePlaceholder)}
                  aria-label={t(I18N_KEYS.request.priceLabel)}
                />
                {ownerPriceTrend ? (
                  <span className={`status-badge ${ownerPriceTrend === 'up' ? 'status-badge--success' : 'status-badge--warning'}`}>
                    {ownerPriceTrend === 'down' ? '↓' : '↑'}{' '}
                    {ownerPriceTrend === 'down'
                      ? t(I18N_KEYS.requestDetails.ownerPriceTrendDown)
                      : t(I18N_KEYS.requestDetails.ownerPriceTrendUp)}
                  </span>
                ) : null}
              </div>

              <div className="request-detail__owner-photos-wrap">
                <input
                  ref={ownerPhotoInputRef}
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={(event) => {
                    void handleOwnerPhotoPick(event.target.files);
                    event.currentTarget.value = '';
                  }}
                />
                <div className="request-detail__owner-photos">
                  {Array.from({ length: 4 }).map((_, index) => {
                    const src = ownerPhotos[index];
                    if (src) {
                      return (
                        <div key={`${src}-${index}`} className="request-detail__owner-photo">
                          <Image
                            src={src}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 50vw, 180px"
                            className="request-detail__owner-photo-img"
                          />
                          {isOwnerEditMode ? (
                            <button
                              type="button"
                              className="request-photo__remove"
                              aria-label={t(I18N_KEYS.request.removePhoto)}
                              onClick={() =>
                                setOwnerPhotos((prev) => prev.filter((_, photoIndex) => photoIndex !== index))
                              }
                            >
                              ×
                            </button>
                          ) : null}
                        </div>
                      );
                    }
                    if (!isOwnerEditMode) {
                      return null;
                    }
                    return (
                      <button
                        key={`slot-${index}`}
                        type="button"
                        className="request-detail__owner-photo-slot"
                        onClick={() => ownerPhotoInputRef.current?.click()}
                        disabled={!isOwnerEditMode || isUploadingOwnerPhoto || ownerPhotos.length >= 4}
                        aria-label={t(I18N_KEYS.request.photosButton)}
                      >
                        +
                      </button>
                    );
                  })}
                </div>
                <p className="request-upload__hint">{t(I18N_KEYS.requestDetails.ownerPhotosHint)}</p>
              </div>

              {isOwnerEditMode ? (
                <div className="request-detail__owner-cta">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOwnerEditMode(false)}
                    disabled={isSavingOwner}
                  >
                    {t(I18N_KEYS.requestDetails.ownerCancel)}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleOwnerSave()}
                    loading={isSavingOwner}
                    disabled={!ownerTitle.trim()}
                  >
                    {t(I18N_KEYS.requestDetails.ownerSave)}
                  </Button>
                </div>
              ) : null}
            </section>
          ) : (
            <>
              <RequestDetailGallery images={viewModel.images} title={viewModel.title} />
              <RequestDetailAbout
                title={t(I18N_KEYS.requestDetails.about)}
                description={viewModel.description}
              />
            </>
          )}
          {viewModel.hasClientInfo ? (
            <RequestDetailClient
              title={t(I18N_KEYS.requestDetails.clientTitle)}
              profileHref={viewModel.clientProfileHref}
              name={viewModel.clientName}
              avatarUrl={viewModel.clientAvatarUrl}
              status={viewModel.clientStatus}
              statusLabel={viewModel.clientStatusLabel}
              ratingText={viewModel.clientRatingText}
              ratingCount={viewModel.clientRatingCount}
              reviewsLabel={t(I18N_KEYS.requestDetails.clientReviews)}
            />
          ) : null}
        </section>

        <RequestDetailAside
          cityLabel={viewModel.cityLabel}
          dateLabel={viewModel.preferredDateLabel}
          ctaApplyLabel={applyLabel}
          ctaChatLabel={t(I18N_KEYS.requestDetails.ctaChat)}
          ctaSaveLabel={t(I18N_KEYS.requestDetails.ctaSave)}
          isSaved={isSaved}
          onApply={handleApply}
          onChat={handleChat}
          onToggleSave={handleFavorite}
          applyState={applyState}
          applyTitle={applyTitle}
          showApply={showOfferCta}
          showChat={showChatCta}
          showSave={showFavoriteCta}
          extraActions={
            showOwnerBadge ? (
              <Link
                href={`/offers/${request.id}`}
                className="btn-secondary request-detail__cta-btn"
              >
                {t(I18N_KEYS.requestDetails.viewOffers)}
              </Link>
            ) : null
          }
        >
          <RequestDetailSimilar
            title={similarTitle}
            message={similarFallbackMessage}
            items={similarForRender}
            footerLabel={t(I18N_KEYS.requestDetails.showAll)}
            footerHref={similarHref}
            formatPrice={(value) => formatPrice.format(value)}
            recurringLabel={t(I18N_KEYS.client.recurringLabel)}
            onceLabel={t(I18N_KEYS.client.onceLabel)}
            openRequestLabel={t(I18N_KEYS.requestsPage.openRequest)}
            priceOnRequestLabel={t(I18N_KEYS.requestDetails.priceOnRequest)}
            getImage={(item) => buildRequestImageList(item)[0]}
          />
        </RequestDetailAside>
      </div>

      <RequestDetailMobileCta
        ctaApplyLabel={applyLabel}
        ctaChatLabel={t(I18N_KEYS.requestDetails.ctaChat)}
        ctaSaveLabel={t(I18N_KEYS.requestDetails.ctaSave)}
        isSaved={isSaved}
        onApply={handleApply}
        onChat={handleChat}
        onToggleSave={handleFavorite}
        applyState={applyState}
        applyTitle={applyTitle}
        showApply={showOfferCta}
        showChat={showChatCta}
        showSave={showFavoriteCta}
        extraActions={
          showOwnerBadge ? (
            <Link href={`/offers/${request.id}`} className="btn-secondary request-detail__cta-btn">
              {t(I18N_KEYS.requestDetails.viewOffers)}
            </Link>
          ) : null
        }
      />

      <RequestOfferSheet
        isOpen={isOfferSheetOpen}
        mode={offerSheetMode}
        title={
          offerSheetMode === 'success'
            ? t(I18N_KEYS.requestDetails.responseSuccessTitle)
            : hasOffer
            ? t(I18N_KEYS.requestDetails.responseEditTitle)
            : t(I18N_KEYS.requestDetails.responseFormTitle)
        }
        previewTitle={viewModel.title}
        previewCity={viewModel.cityLabel}
        previewDate={viewModel.preferredDateLabel}
        previewPrice={viewModel.priceLabel}
        amountLabel={t(I18N_KEYS.requestDetails.responseAmountLabel)}
        amountValue={offerAmount}
        amountPlaceholder="120"
        commentLabel={t(I18N_KEYS.requestDetails.responseCommentLabel)}
        commentValue={offerComment}
        commentPlaceholder={t(I18N_KEYS.requestDetails.responseCommentPlaceholder)}
        availabilityLabel={t(I18N_KEYS.requestDetails.responseAvailabilityLabel)}
        availabilityValue={offerAvailability}
        availabilityPlaceholder={t(I18N_KEYS.requestDetails.responseAvailabilityPlaceholder)}
        submitLabel={
          hasOffer
            ? t(I18N_KEYS.requestDetails.responseEditSubmit)
            : t(I18N_KEYS.requestDetails.responseSubmit)
        }
        submitKind={hasOffer ? 'edit' : 'submit'}
        closeLabel={t(I18N_KEYS.requestDetails.responseClose)}
        successTitle={t(I18N_KEYS.requestDetails.responseSuccessTitle)}
        successBody={t(I18N_KEYS.requestDetails.responseSuccessBody)}
        successSubline={t(I18N_KEYS.requestDetails.responseSuccessSubline)}
        successTipTitle={t(I18N_KEYS.requestDetails.responseSuccessTipTitle)}
        successTipCardTitle={t(I18N_KEYS.requestDetails.responseSuccessTipCardTitle)}
        successTipCardBody={t(I18N_KEYS.requestDetails.responseSuccessTipCardBody)}
        successProfileCta={t(I18N_KEYS.requestDetails.responseProfileCta)}
        successContinueCta={t(I18N_KEYS.requestDetails.responseContinueCta)}
        successProfileHref={`/profile/workspace?highlight=offer&next=${encodeURIComponent(`/requests/${request.id}`)}`}
        showProfileAdvice={!isProviderProfileComplete}
        profileAvatarUrl={authMe?.avatar?.url ?? null}
        profileName={authMe?.name ?? authUser?.name ?? null}
        profileOnline={authStatus === 'authenticated'}
        profileStatusLabel={
          authStatus === 'authenticated'
            ? t(I18N_KEYS.requestDetails.clientOnline)
            : t(I18N_KEYS.requestDetails.clientActive)
        }
        isSubmitting={isSubmittingOffer}
        onAmountChange={setOfferAmount}
        onCommentChange={setOfferComment}
        onAvailabilityChange={setOfferAvailability}
        onClose={() => {
          setOfferSheetMode('form');
          setOfferSheetInUrl(false);
        }}
        cancelLabel={
          existingResponse?.id
            ? t(I18N_KEYS.requestDetails.responseCancel)
            : t(I18N_KEYS.common.back)
        }
        cancelKind={existingResponse?.id ? 'delete' : 'back'}
        onCancel={handleOfferCancel}
        onSuccessBack={() => {
          setOfferSheetMode('form');
          setOfferSheetInUrl(false);
          router.push('/requests');
        }}
        onSubmit={handleOfferSubmit}
      />
    </PageShell>
  );
}
