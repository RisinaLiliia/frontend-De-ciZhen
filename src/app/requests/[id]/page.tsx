//src/app/requests/[id]/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { IconEye } from '@/components/ui/icons/icons';
import {
  RequestDetailAbout,
  RequestDetailAside,
  RequestDetailClient,
  RequestDetailError,
  RequestDetailGallery,
  RequestDetailHeader,
  RequestDetailLoading,
  RequestDetailMetaRows,
  RequestDetailMobileCta,
  RequestOwnerEditPanel,
  RequestOfferSheet,
  RequestDetailSimilar,
} from '@/components/requests/details';
import { getStatusBadgeClass } from '@/lib/statusBadge';
import { getPublicRequestById } from '@/lib/api/requests';
import { listMyProviderOffers } from '@/lib/api/offers';
import { listFavorites } from '@/lib/api/favorites';
import { getMyProviderProfile } from '@/lib/api/providers';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { useRequestFavoriteToggle } from '@/hooks/useFavoriteToggles';
import { useAuthMe, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { buildRequestImageList } from '@/lib/requests/images';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { useRequestOfferActions } from '@/features/requests/details/useRequestOfferActions';
import { useRequestDetailsRelated } from '@/features/requests/details/useRequestDetailsRelated';
import { useRequestOwnerEdit } from '@/features/requests/details/useRequestOwnerEdit';
import { useRequestDetailsViewModel } from '@/features/requests/details/useRequestDetailsViewModel';
import { useRequestDetailsUrlAction } from '@/features/requests/details/useRequestDetailsUrlAction';
import { useRequestDetailsPresentation } from '@/features/requests/details/useRequestDetailsPresentation';
import { providerQK } from '@/features/provider/queries';

const WORKSPACE_MY_REQUESTS_URL = '/workspace?tab=my-requests&sort=date_desc&page=1&limit=10';
const WORKSPACE_PUBLIC_REQUESTS_URL = '/workspace?section=requests&sort=date_desc&page=1&limit=10';
const WORKSPACE_GUEST_REQUESTS_URL = '/workspace?section=requests';

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
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isAuthed = authStatus === 'authenticated';
  const profileId = authUser?.id ?? authMe?.id ?? null;
  const profileHref = profileId ? `/profile/${encodeURIComponent(profileId)}` : '/profile';

  const {
    data: request,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['request-detail', requestId, locale],
    enabled: isHydrated && Boolean(requestId),
    queryFn: () => getPublicRequestById(String(requestId), { locale }),
    staleTime: 60_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const { data: myResponses } = useQuery({
    queryKey: ['offers-my'],
    enabled: isHydrated && authStatus === 'authenticated',
    queryFn: () => withStatusFallback(() => listMyProviderOffers(), []),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const { data: providerProfile } = useQuery({
    queryKey: providerQK.myProfile(),
    enabled: isHydrated && authStatus === 'authenticated',
    queryFn: () => withStatusFallback(() => getMyProviderProfile(), null),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const { data: favoriteRequests = [] } = useQuery({
    queryKey: ['favorite-requests'],
    enabled: isHydrated && authStatus === 'authenticated',
    queryFn: () => withStatusFallback(() => listFavorites('request'), []),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const existingResponse = React.useMemo(() => {
    if (!isAuthed || !request || !myResponses) return null;
    return myResponses.find((response) => response.requestId === request.id) ?? null;
  }, [isAuthed, myResponses, request]);

  const favoriteRequestIds = React.useMemo(
    () => new Set(favoriteRequests.map((item) => item.id)),
    [favoriteRequests],
  );
  const requestById = React.useMemo(() => {
    const map = new Map<string, RequestResponseDto>();
    if (request) map.set(request.id, request);
    return map;
  }, [request]);
  const nextPath = React.useMemo(() => {
    const qs = searchParams?.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }, [pathname, searchParams]);
  const {
    pendingFavoriteRequestIds,
    toggleRequestFavorite,
  } = useRequestFavoriteToggle({
    isAuthed,
    nextPath,
    router,
    t,
    qc,
    favoriteRequestIds,
    requestById,
  });
  const isSaved = React.useMemo(() => {
    if (!request) return false;
    return favoriteRequestIds.has(request.id);
  }, [favoriteRequestIds, request]);

  const isOwner = isAuthed && Boolean(request?.clientId) && request?.clientId === authUser?.id;
  const shouldOpenOwnerEdit = searchParams?.get('edit') === '1';
  const isOfferAccepted = existingResponse?.status === 'accepted';
  const showOfferCta = !isOwner;
  const showChatCta = !isOwner;
  const showFavoriteCta = !isOwner;
  const showOwnerBadge = isAuthed && isOwner;
  const {
    isOwnerEditMode,
    ownerTitle,
    ownerDescription,
    ownerPrice,
    ownerPhotos,
    isSavingOwner,
    isUploadingOwnerPhoto,
    ownerPriceTrend,
    setIsOwnerEditMode,
    setOwnerTitle,
    setOwnerDescription,
    setOwnerPrice,
    setOwnerPhotos,
    handleOwnerClearText,
    handleOwnerPhotoPick,
    handleOwnerSave,
  } = useRequestOwnerEdit({
    request,
    isOwner,
    showOwnerBadge,
    shouldOpenOwnerEdit,
    qc,
    t,
  });
  const {
    offerAmount,
    offerComment,
    offerAvailability,
    offerSheetMode,
    isSubmittingOffer,
    isOfferSheetOpen,
    hasOffer,
    setOfferAmount,
    setOfferComment,
    setOfferAvailability,
    requireAuth,
    openOfferForm,
    handleApply,
    handleOfferSubmit,
    handleOfferCancel,
    closeOfferSheet,
    handleOfferSuccessBack,
  } = useRequestOfferActions({
    authStatus,
    request,
    existingResponse,
    isOwner,
    isOfferAccepted,
    pathname,
    searchParams,
    router,
    qc,
    t,
    workspacePublicRequestsUrl: WORKSPACE_PUBLIC_REQUESTS_URL,
    workspaceGuestRequestsUrl: WORKSPACE_GUEST_REQUESTS_URL,
  });


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
    if (isOwner) {
      toast.message(t(I18N_KEYS.requestDetails.ownerHint));
      return;
    }
    void toggleRequestFavorite(request.id);
  }, [isOwner, request, t, toggleRequestFavorite]);

  const { viewModel, formatPriceValue } = useRequestDetailsViewModel({
    request,
    locale,
    t,
  });
  const { similarTitle, similarFallbackMessage, similarForRender, similarHref } = useRequestDetailsRelated({
    request,
    locale,
    isHydrated,
    t,
  });

  useRequestDetailsUrlAction({
    authStatus,
    request,
    isOwner,
    isOfferAccepted,
    isSaved,
    pathname,
    searchParams,
    router,
    t,
    onOpenOfferForm: openOfferForm,
    onToggleFavorite: (requestId) => {
      void toggleRequestFavorite(requestId);
    },
  });

  const {
    applyLabel,
    applyState,
    applyTitle,
    viewOffersLabel,
    requestStatusView,
    requestPriceTrend,
    requestPriceTrendLabel,
    isProviderProfileComplete,
  } = useRequestDetailsPresentation({
    request,
    hasOffer,
    isOfferAccepted,
    providerProfile: providerProfile ?? null,
    t,
  });

  if (!isHydrated || isLoading) {
    return <RequestDetailLoading />;
  }

  if (isError || !request || !viewModel) {
    return <RequestDetailError message={t(I18N_KEYS.requestsPage.error)} />;
  }

  return (
    <PageShell
      right={<AuthActions />}
      showBack
      backHref={isAuthed ? WORKSPACE_MY_REQUESTS_URL : WORKSPACE_GUEST_REQUESTS_URL}
      mainClassName="pb-6"
    >
      <div className="request-detail">
        <section className="panel request-detail__panel">
          <RequestDetailHeader
            title={isOwnerEditMode ? ownerTitle || viewModel.title : viewModel.title}
            priceLabel={
              isOwnerEditMode
                ? ownerPrice.trim()
                  ? formatPriceValue(Number(ownerPrice))
                  : t(I18N_KEYS.requestDetails.priceOnRequest)
                : viewModel.priceLabel
            }
            priceTrend={requestPriceTrend}
            priceTrendLabel={requestPriceTrendLabel}
            tags={viewModel.tagList}
            badgeLabel={showOwnerBadge ? t(I18N_KEYS.requestDetails.ownerBadge) : undefined}
            statusBadge={
              <span className={getStatusBadgeClass(requestStatusView.token)}>{requestStatusView.label}</span>
            }
          />

          {showOwnerBadge ? (
            <RequestOwnerEditPanel
              isEditMode={isOwnerEditMode}
              isSaving={isSavingOwner}
              isUploadingPhoto={isUploadingOwnerPhoto}
              titleValue={ownerTitle}
              descriptionValue={ownerDescription}
              priceValue={ownerPrice}
              priceTrend={ownerPriceTrend}
              photos={ownerPhotos}
              ownerEditLabel={t(I18N_KEYS.requestDetails.ownerEdit)}
              ownerClearLabel={t(I18N_KEYS.requestDetails.ownerClear)}
              titlePlaceholder={t(I18N_KEYS.request.titlePlaceholder)}
              titleLabel={t(I18N_KEYS.request.titleLabel)}
              descriptionPlaceholder={t(I18N_KEYS.request.descriptionPlaceholder)}
              descriptionLabel={t(I18N_KEYS.request.descriptionLabel)}
              pricePlaceholder={t(I18N_KEYS.request.pricePlaceholder)}
              priceLabel={t(I18N_KEYS.request.priceLabel)}
              removePhotoLabel={t(I18N_KEYS.request.removePhoto)}
              addPhotoLabel={t(I18N_KEYS.request.photosButton)}
              photosHintLabel={t(I18N_KEYS.requestDetails.ownerPhotosHint)}
              cancelLabel={t(I18N_KEYS.requestDetails.ownerCancel)}
              saveLabel={t(I18N_KEYS.requestDetails.ownerSave)}
              priceTrendDownLabel={t(I18N_KEYS.requestDetails.ownerPriceTrendDown)}
              priceTrendUpLabel={t(I18N_KEYS.requestDetails.ownerPriceTrendUp)}
              onToggleEdit={() => setIsOwnerEditMode((prev) => !prev)}
              onClearText={handleOwnerClearText}
              onTitleChange={setOwnerTitle}
              onDescriptionChange={setOwnerDescription}
              onPriceChange={setOwnerPrice}
              onPhotoPick={(files) => {
                void handleOwnerPhotoPick(files);
              }}
              onRemovePhoto={(index) =>
                setOwnerPhotos((prev) => prev.filter((_, photoIndex) => photoIndex !== index))
              }
              onCancelEdit={() => setIsOwnerEditMode(false)}
              onSave={() => {
                void handleOwnerSave();
              }}
            />
          ) : (
            <>
              <RequestDetailGallery images={viewModel.images} title={viewModel.title} />
              <RequestDetailAbout
                title={t(I18N_KEYS.requestDetails.about)}
                description={viewModel.description}
              />
            </>
          )}
          <RequestDetailMetaRows
            cityLabel={viewModel.cityLabel}
            dateLabel={viewModel.preferredDateLabel}
            className="request-detail__mobile-meta"
          />
          <RequestDetailMobileCta
            className="request-detail__mobile-cta--inline"
            ctaApplyLabel={applyLabel}
            ctaChatLabel={t(I18N_KEYS.requestDetails.ctaChat)}
            ctaSaveLabel={t(I18N_KEYS.requestDetails.ctaSave)}
            isSaved={isSaved}
            isSavePending={pendingFavoriteRequestIds.has(request.id)}
            onApply={handleApply}
            onChat={handleChat}
            onToggleSave={handleFavorite}
            applyState={applyState}
            applyTitle={applyTitle}
            showApply={showOfferCta}
            showChat={showChatCta}
            showSave={showFavoriteCta}
            compactIcons
            extraActions={
              showOwnerBadge ? (
                <Link
                  href={`/offers/${request.id}`}
                  className="btn-secondary offer-action-btn offer-action-btn--icon-only request-card__status-action request-card__status-action--contract"
                  aria-label={viewOffersLabel}
                  title={viewOffersLabel}
                >
                  <i className="offer-action-btn__icon">
                    <IconEye />
                  </i>
                </Link>
              ) : null
            }
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
          ctaApplyLabel={applyLabel}
          ctaChatLabel={t(I18N_KEYS.requestDetails.ctaChat)}
          ctaSaveLabel={t(I18N_KEYS.requestDetails.ctaSave)}
          isSaved={isSaved}
          isSavePending={pendingFavoriteRequestIds.has(request.id)}
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
                {viewOffersLabel}
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
            formatPrice={formatPriceValue}
            recurringLabel={t(I18N_KEYS.client.recurringLabel)}
            onceLabel={t(I18N_KEYS.client.onceLabel)}
            openRequestLabel={t(I18N_KEYS.requestsPage.openRequest)}
            priceOnRequestLabel={t(I18N_KEYS.requestDetails.priceOnRequest)}
            getImage={(item) => buildRequestImageList(item)[0]}
          />
        </RequestDetailAside>
      </div>

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
        successProfileHref={`${profileHref}?highlight=offer&next=${encodeURIComponent(`/requests/${request.id}`)}`}
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
        onClose={closeOfferSheet}
        cancelLabel={
          existingResponse?.id
            ? t(I18N_KEYS.requestDetails.responseCancel)
            : t(I18N_KEYS.common.back)
        }
        cancelKind={existingResponse?.id ? 'delete' : 'back'}
        onCancel={handleOfferCancel}
        onSuccessBack={handleOfferSuccessBack}
        onSubmit={handleOfferSubmit}
      />
    </PageShell>
  );
}
