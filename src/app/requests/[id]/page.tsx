//src/app/requests/[id]/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import {
  RequestDetailAbout,
  RequestDetailAside,
  RequestDetailClient,
  RequestDetailError,
  RequestDetailGallery,
  RequestDetailHeader,
  RequestDetailLoading,
  RequestDetailMobileCta,
  RequestDetailSimilar,
} from '@/components/requests/details';
import { getPublicRequestById, listPublicRequests } from '@/lib/api/requests';
import { createOffer, listMyProviderOffers } from '@/lib/api/offers';
import { addFavorite, listFavorites, removeFavorite } from '@/lib/api/favorites';
import { ApiError } from '@/lib/api/http-error';
import { useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { getMyProviderProfile } from '@/lib/api/providers';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
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

export default function RequestDetailsPage() {
  const t = useT();
  const { locale } = useI18n();
  const authStatus = useAuthStatus();
  const authUser = useAuthUser();
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const requestId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const actionHandledRef = React.useRef(false);

  const [mode, setMode] = React.useState<'client' | 'provider'>(
    authUser?.role === 'provider' ? 'provider' : 'client',
  );
  const [isOfferFormOpen, setIsOfferFormOpen] = React.useState(false);
  const [offerAmount, setOfferAmount] = React.useState('');
  const [offerComment, setOfferComment] = React.useState('');
  const [isSubmittingOffer, setIsSubmittingOffer] = React.useState(false);
  const [submittedOfferAmount, setSubmittedOfferAmount] = React.useState<number | null>(null);

  const isAuthed = authStatus === 'authenticated';
  const isProviderUser = authUser?.role === 'provider';

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
    enabled: authStatus === 'authenticated' && authUser?.role === 'provider',
    queryFn: () => listMyProviderOffers(),
  });

  const { data: providerProfile } = useQuery({
    queryKey: ['provider-profile'],
    enabled: isAuthed && isProviderUser,
    queryFn: () => getMyProviderProfile(),
  });

  const { data: favoriteRequests } = useQuery({
    queryKey: ['favorite-requests'],
    enabled: authStatus === 'authenticated' && authUser?.role === 'provider',
    queryFn: () => listFavorites('request'),
  });

  React.useEffect(() => {
    if (!isAuthed) return;
    if (!isProviderUser) {
      setMode('client');
      return;
    }
    const stored =
      typeof window !== 'undefined' ? window.localStorage.getItem('dc_last_mode') : null;
    if (stored === 'client' || stored === 'provider') {
      setMode(stored);
    } else {
      setMode('provider');
    }
  }, [isAuthed, isProviderUser]);

  const setModeWithStore = React.useCallback((next: 'client' | 'provider') => {
    setMode(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('dc_last_mode', next);
    }
  }, []);

  const existingResponse = React.useMemo(() => {
    if (!request || !myResponses || authUser?.role !== 'provider') return null;
    return myResponses.find((response) => response.requestId === request.id) ?? null;
  }, [authUser?.role, myResponses, request]);

  const isAlreadyResponded = Boolean(existingResponse);

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
  const isProviderMode = isAuthed && mode === 'provider';
  const isClientMode = !isAuthed || mode === 'client';
  const canProvide =
    isProviderUser && providerProfile?.status === 'active' && !providerProfile?.isBlocked;
  const respondedAmount = submittedOfferAmount ?? existingResponse?.amount ?? null;
  const showOfferSuccess =
    isProviderMode && !isOwner && (isAlreadyResponded || submittedOfferAmount !== null);
  const showOfferGated = isProviderMode && !isOwner && !canProvide;
  const showOfferCta = (isAuthed ? isProviderMode : true) && !isOwner && !showOfferGated;
  const showChatCta = (isAuthed ? isProviderMode : true) && !isOwner && !showOfferGated;
  const showFavoriteCta = (isAuthed ? isProviderMode : true) && !isOwner;
  const showClientModeSwitch = isAuthed && isClientMode && !isOwner && isProviderUser;
  const showOwnerBadge = isAuthed && isOwner;

  const buildNextUrl = React.useCallback(
    (action: string) => {
      const nextParams = new URLSearchParams(searchParams?.toString());
      nextParams.set('action', action);
      const qs = nextParams.toString();
      return `${pathname}${qs ? `?${qs}` : ''}`;
    },
    [pathname, searchParams],
  );

  const requireAuth = React.useCallback(
    (action: string) => {
      const nextUrl = buildNextUrl(action);
      router.push(`/auth/login?next=${encodeURIComponent(nextUrl)}`);
      toast.message(t(I18N_KEYS.requestDetails.loginRequired));
    },
    [buildNextUrl, router, t],
  );

  const openOfferForm = React.useCallback(() => {
    setIsOfferFormOpen(true);
    if (!offerAmount && request?.price) {
      setOfferAmount(String(Math.max(1, Math.round(request.price))));
    }
  }, [offerAmount, request?.price]);

  const handleApply = React.useCallback(() => {
    if (!request) return;
    if (authStatus !== 'authenticated') {
      requireAuth('respond');
      return;
    }
    if (isOwner) {
      toast.message(t(I18N_KEYS.requestDetails.selfBidError));
      return;
    }
    if (mode !== 'provider') {
      toast.message(t(I18N_KEYS.requestDetails.clientModeHint));
      return;
    }
    if (!canProvide) {
      toast.message(t(I18N_KEYS.requestDetails.providerGateTitle));
      return;
    }
    if (authUser?.role !== 'provider') {
      toast.message(t(I18N_KEYS.requestDetails.responseFailed));
      return;
    }
    if (isAlreadyResponded) {
      toast.message(t(I18N_KEYS.requestDetails.responseAlready));
      return;
    }
    openOfferForm();
  }, [
    authStatus,
    authUser?.role,
    canProvide,
    isAlreadyResponded,
    isOwner,
    mode,
    openOfferForm,
    request,
    requireAuth,
    t,
  ]);

  const handleOfferSubmit = React.useCallback(async () => {
    if (!request || authUser?.role !== 'provider') return;
    const parsedAmount = Number(offerAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.message(t(I18N_KEYS.requestDetails.responseAmountInvalid));
      return;
    }

    setIsSubmittingOffer(true);
    try {
      const response = await createOffer({
        requestId: request.id,
        amount: parsedAmount,
        message: offerComment.trim() || undefined,
      });
      setSubmittedOfferAmount(response.offer.amount ?? parsedAmount);
      setOfferComment('');
      setIsOfferFormOpen(false);
      toast.success(t(I18N_KEYS.requestDetails.responseSent));
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['offers-my'] }),
        qc.invalidateQueries({ queryKey: ['provider-profile'] }),
      ]);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setSubmittedOfferAmount(parsedAmount);
        setIsOfferFormOpen(false);
        toast.message(t(I18N_KEYS.requestDetails.responseAlready));
      } else {
        toast.error(t(I18N_KEYS.requestDetails.responseFailed));
      }
    } finally {
      setIsSubmittingOffer(false);
    }
  }, [authUser?.role, offerAmount, offerComment, qc, request, t]);

  const handleChat = React.useCallback(() => {
    if (authStatus !== 'authenticated') {
      requireAuth('chat');
      return;
    }
    if (isOwner) {
      toast.message(t(I18N_KEYS.requestDetails.ownerHint));
      return;
    }
    if (mode !== 'provider') {
      toast.message(t(I18N_KEYS.requestDetails.clientModeHint));
      return;
    }
    if (!canProvide) {
      toast.message(t(I18N_KEYS.requestDetails.providerGateTitle));
      return;
    }
    toast.message(t(I18N_KEYS.requestDetails.chatSoon));
  }, [authStatus, canProvide, isOwner, mode, requireAuth, t]);

  const handleFavorite = React.useCallback(() => {
    if (!request) return;
    if (authStatus !== 'authenticated') {
      requireAuth('favorite');
      return;
    }
    if (mode !== 'provider') {
      toast.message(t(I18N_KEYS.requestDetails.clientModeHint));
      return;
    }
    if (isOwner) {
      toast.message(t(I18N_KEYS.requestDetails.ownerHint));
      return;
    }
    if (authUser?.role !== 'provider') {
      toast.message(t(I18N_KEYS.requestDetails.favoritesProviderOnly));
      return;
    }
    void setFavorite(!isSaved);
  }, [authStatus, authUser?.role, isOwner, isSaved, mode, request, requireAuth, setFavorite, t]);

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
    if (request?.categoryKey) nextParams.set('categoryKey', request.categoryKey);
    if (request?.serviceKey) nextParams.set('subcategoryKey', request.serviceKey);
    const qs = nextParams.toString();
    return `/requests${qs ? `?${qs}` : ''}`;
  }, [request]);

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
      } else if (mode !== 'provider') {
        toast.message(t(I18N_KEYS.requestDetails.clientModeHint));
      } else if (!canProvide) {
        toast.message(t(I18N_KEYS.requestDetails.providerGateTitle));
      } else if (authUser?.role === 'provider') {
        openOfferForm();
      } else {
        toast.message(t(I18N_KEYS.requestDetails.responseFailed));
      }
    } else if (action === 'chat') {
      if (isOwner) {
        toast.message(t(I18N_KEYS.requestDetails.ownerHint));
      } else if (mode !== 'provider') {
        toast.message(t(I18N_KEYS.requestDetails.clientModeHint));
      } else if (!canProvide) {
        toast.message(t(I18N_KEYS.requestDetails.providerGateTitle));
      } else {
        toast.message(t(I18N_KEYS.requestDetails.chatSoon));
      }
    } else if (action === 'favorite') {
      if (isOwner) {
        toast.message(t(I18N_KEYS.requestDetails.ownerHint));
      } else if (mode !== 'provider') {
        toast.message(t(I18N_KEYS.requestDetails.clientModeHint));
      } else if (authUser?.role === 'provider') {
        if (!isSaved) {
          void setFavorite(true);
        } else {
          toast.success(t(I18N_KEYS.requestDetails.saved));
        }
      } else {
        toast.message(t(I18N_KEYS.requestDetails.favoritesProviderOnly));
      }
    }

    const nextParams = new URLSearchParams(searchParams?.toString());
    nextParams.delete('action');
    const nextQs = nextParams.toString();
    router.replace(`${pathname}${nextQs ? `?${nextQs}` : ''}`);
  }, [
    authStatus,
    authUser?.role,
    canProvide,
    isOwner,
    isSaved,
    mode,
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

  const offerForm = (
    <div className="request-detail__offer-form">
      <div className="request-detail__offer-form-title">
        {t(I18N_KEYS.requestDetails.responseFormTitle)}
      </div>
      <label className="typo-small">{t(I18N_KEYS.requestDetails.responseAmountLabel)}</label>
      <Input
        type="number"
        min={1}
        step="1"
        value={offerAmount}
        onChange={(event) => setOfferAmount(event.target.value)}
        placeholder="120"
      />
      <label className="typo-small">{t(I18N_KEYS.requestDetails.responseCommentLabel)}</label>
      <Textarea
        value={offerComment}
        onChange={(event) => setOfferComment(event.target.value)}
        placeholder={t(I18N_KEYS.requestDetails.responseCommentPlaceholder)}
        rows={3}
      />
      <button
        type="button"
        className="btn-primary request-detail__cta-btn"
        onClick={handleOfferSubmit}
        disabled={isSubmittingOffer}
      >
        <span>{t(I18N_KEYS.requestDetails.responseSubmit)}</span>
      </button>
    </div>
  );

  const successNotice = (
    <>
      <div className="request-detail__notice-title">
        {t(I18N_KEYS.requestDetails.responseSuccessTitle)}
      </div>
      <div className="request-detail__notice-text">
        {t(I18N_KEYS.requestDetails.responseSuccessBody)}
      </div>
      {respondedAmount ? (
        <div className="request-detail__success-price">
          {t(I18N_KEYS.requestDetails.responseYourPrice)} {formatPrice.format(respondedAmount)}
        </div>
      ) : null}
      <div className="request-detail__success-actions">
        <Link
          href={`/provider/profile?highlight=offer&next=${encodeURIComponent(`/requests/${request.id}`)}`}
          className="btn-secondary request-detail__cta-btn"
        >
          {t(I18N_KEYS.requestDetails.responseProfileCta)}
        </Link>
        <Link href="/requests" className="btn-secondary request-detail__cta-btn">
          {t(I18N_KEYS.requestDetails.responseBackToList)}
        </Link>
      </div>
    </>
  );

  return (
    <PageShell right={<AuthActions />} showBack mainClassName="py-6">
      <div className="request-detail">
        <section className="panel request-detail__panel">
          <RequestDetailHeader
            title={viewModel.title}
            priceLabel={viewModel.priceLabel}
            tags={viewModel.tagList}
            badgeLabel={showOwnerBadge ? t(I18N_KEYS.requestDetails.ownerBadge) : undefined}
          />
          <RequestDetailGallery images={viewModel.images} title={viewModel.title} />
          <RequestDetailAbout
            title={t(I18N_KEYS.requestDetails.about)}
            description={viewModel.description}
          />
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
          ctaApplyLabel={
            authStatus === 'authenticated' && isAlreadyResponded
              ? t(I18N_KEYS.requestDetails.responseAlready)
              : t(I18N_KEYS.requestDetails.ctaApply)
          }
          ctaChatLabel={t(I18N_KEYS.requestDetails.ctaChat)}
          ctaSaveLabel={t(I18N_KEYS.requestDetails.ctaSave)}
          isSaved={isSaved}
          onApply={handleApply}
          onChat={handleChat}
          onToggleSave={handleFavorite}
          applyDisabled={authStatus === 'authenticated' && isAlreadyResponded}
          applyState={authStatus === 'authenticated' && isAlreadyResponded ? 'done' : 'default'}
          showApply={showOfferCta}
          showChat={showChatCta}
          showSave={showFavoriteCta}
          notice={
            showOfferSuccess ? (
              successNotice
            ) : showOfferGated ? (
              <>
                <div className="request-detail__notice-title">
                  {t(I18N_KEYS.requestDetails.providerGateTitle)}
                </div>
                <div className="request-detail__notice-text">
                  {t(I18N_KEYS.requestDetails.providerGateBody)}
                </div>
                <Link
                  href={`/provider/onboarding?next=${encodeURIComponent(`/requests/${request.id}`)}`}
                  className="btn-secondary request-detail__cta-btn"
                >
                  {t(I18N_KEYS.requestDetails.providerGateCta)}
                </Link>
              </>
            ) : showClientModeSwitch ? (
              <>
                <div className="request-detail__notice-title">
                  {t(I18N_KEYS.requestDetails.clientModeHint)}
                </div>
                <button
                  type="button"
                  className="btn-secondary request-detail__cta-btn"
                  onClick={() => setModeWithStore('provider')}
                >
                  {t(I18N_KEYS.requestDetails.switchToProvider)}
                </button>
              </>
            ) : null
          }
          extraActions={
            showOwnerBadge ? (
              <Link
                href={`/offers/${request.id}`}
                className="btn-secondary request-detail__cta-btn"
              >
                {t(I18N_KEYS.requestDetails.viewOffers)}
              </Link>
            ) : isOfferFormOpen ? (
              offerForm
            ) : null
          }
        >
          <RequestDetailSimilar
            title={similarTitle}
            message={similarFallbackMessage}
            items={similarForRender}
            footerLabel={t(I18N_KEYS.requestDetails.showAll)}
            footerHref={similarHref}
            formatDate={(value) => formatDate.format(value)}
            formatPrice={(value) => formatPrice.format(value)}
            badgeTodayLabel={t(I18N_KEYS.requestsPage.badgeToday)}
            recurringLabel={t(I18N_KEYS.client.recurringLabel)}
            onceLabel={t(I18N_KEYS.client.onceLabel)}
            openRequestLabel={t(I18N_KEYS.requestsPage.openRequest)}
            detailsCtaLabel={t(I18N_KEYS.requestsPage.detailsCta)}
            priceOnRequestLabel={t(I18N_KEYS.requestDetails.priceOnRequest)}
            getImage={(item) => buildRequestImageList(item)[0]}
          />
        </RequestDetailAside>
      </div>

      <RequestDetailMobileCta
        ctaApplyLabel={
          authStatus === 'authenticated' && isAlreadyResponded
            ? t(I18N_KEYS.requestDetails.responseAlready)
            : t(I18N_KEYS.requestDetails.ctaApply)
        }
        ctaChatLabel={t(I18N_KEYS.requestDetails.ctaChat)}
        ctaSaveLabel={t(I18N_KEYS.requestDetails.ctaSave)}
        isSaved={isSaved}
        onApply={handleApply}
        onChat={handleChat}
        onToggleSave={handleFavorite}
        applyDisabled={authStatus === 'authenticated' && isAlreadyResponded}
        applyState={authStatus === 'authenticated' && isAlreadyResponded ? 'done' : 'default'}
        showApply={showOfferCta}
        showChat={showChatCta}
        showSave={showFavoriteCta}
        notice={
          showOfferSuccess ? (
            successNotice
          ) : showOfferGated ? (
            <>
              <div className="request-detail__notice-title">
                {t(I18N_KEYS.requestDetails.providerGateTitle)}
              </div>
              <div className="request-detail__notice-text">
                {t(I18N_KEYS.requestDetails.providerGateBody)}
              </div>
              <Link
                href={`/provider/onboarding?next=${encodeURIComponent(`/requests/${request.id}`)}`}
                className="btn-secondary request-detail__cta-btn"
              >
                {t(I18N_KEYS.requestDetails.providerGateCta)}
              </Link>
            </>
          ) : showClientModeSwitch ? (
            <>
              <div className="request-detail__notice-title">
                {t(I18N_KEYS.requestDetails.clientModeHint)}
              </div>
              <button
                type="button"
                className="btn-secondary request-detail__cta-btn"
                onClick={() => setModeWithStore('provider')}
              >
                {t(I18N_KEYS.requestDetails.switchToProvider)}
              </button>
            </>
          ) : null
        }
        extraActions={
          showOwnerBadge ? (
            <Link href={`/offers/${request.id}`} className="btn-secondary request-detail__cta-btn">
              {t(I18N_KEYS.requestDetails.viewOffers)}
            </Link>
          ) : isOfferFormOpen ? (
            offerForm
          ) : null
        }
      />
    </PageShell>
  );
}
