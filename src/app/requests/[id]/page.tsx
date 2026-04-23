//src/app/requests/[id]/page.tsx
'use client';

import * as React from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  RequestDetailError,
  RequestDetailLoading,
  RequestOfferSheet,
} from '@/components/requests/details';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { useAuthMe, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { useRequestDetailsContentState } from '@/features/requests/details/useRequestDetailsContentState';
import { useRequestOfferActions } from '@/features/requests/details/useRequestOfferActions';
import { useRequestDetailsUrlAction } from '@/features/requests/details/useRequestDetailsUrlAction';
import { useRequestDetailsPageData } from '@/features/requests/details/useRequestDetailsPageData';
import { RequestDetailsContent } from '@/features/requests/details/RequestDetailsContent';

const WORKSPACE_MY_REQUESTS_URL = '/workspace?section=requests&scope=my&period=90d&range=90d';
const WORKSPACE_PUBLIC_REQUESTS_URL = '/workspace?section=requests';
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
  const currentUserId = authUser?.id ?? authMe?.id ?? null;
  const profileHref = profileId ? `/profile/${encodeURIComponent(profileId)}` : '/profile';
  const shouldOpenOwnerEdit = searchParams?.get('edit') === '1';

  const {
    request,
    isLoading,
    isError,
    providerProfile,
    existingResponse,
    pendingFavoriteRequestIds,
    toggleRequestFavorite,
    isSaved,
  } = useRequestDetailsPageData({
    t,
    locale,
    requestId,
    isHydrated,
    authStatus,
    isAuthed,
    pathname,
    searchParams,
    router,
    qc,
    preferOwner: shouldOpenOwnerEdit,
  });

  const isOwner = isAuthed && Boolean(request?.clientId) && request?.clientId === currentUserId;
  const isOfferAccepted = existingResponse?.status === 'accepted';
  const showOfferCta = !isOwner;
  const showChatCta = !isOwner;
  const showFavoriteCta = !isOwner;
  const showOwnerBadge = isAuthed && isOwner;

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

  const {
    activeOwnerSubmitIntent,
    applyLabel,
    applyState,
    applyTitle,
    formatPriceValue,
    handleOwnerClearText,
    handleOwnerPhotoPick,
    handleOwnerSave,
    isOwnerEditMode,
    isProviderProfileComplete,
    isSavingOwner,
    isUploadingOwnerPhoto,
    ownerDescription,
    ownerCityId,
    ownerPhotos,
    ownerPrice,
    ownerPreferredDate,
    ownerPriceTrend,
    ownerTitle,
    requestPriceTrend,
    requestPriceTrendLabel,
    requestStatusView,
    setIsOwnerEditMode,
    setOwnerDescription,
    setOwnerCityId,
    setOwnerPhotos,
    setOwnerPrice,
    setOwnerPreferredDate,
    setOwnerTitle,
    similarFallbackMessage,
    similarForRender,
    similarHref,
    similarTitle,
    viewModel,
  } = useRequestDetailsContentState({
    request,
    locale,
    t,
    isHydrated,
    qc,
    isOwner,
    shouldOpenOwnerEdit,
    hasOffer,
    isOfferAccepted,
    providerProfile,
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
    onToggleFavorite: (id) => {
      void toggleRequestFavorite(id);
    },
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
      <RequestDetailsContent
        t={t}
        locale={locale}
        request={request}
        viewModel={viewModel}
        requestStatusView={requestStatusView}
        requestPriceTrend={requestPriceTrend}
        requestPriceTrendLabel={requestPriceTrendLabel}
        applyLabel={applyLabel}
        applyState={applyState}
        applyTitle={applyTitle}
        showOfferCta={showOfferCta}
        showChatCta={showChatCta}
        showFavoriteCta={showFavoriteCta}
        showOwnerBadge={showOwnerBadge}
        isSaved={isSaved}
        isSavePending={pendingFavoriteRequestIds.has(request.id)}
        onApply={handleApply}
        onChat={handleChat}
        onFavorite={handleFavorite}
        isOwnerEditMode={isOwnerEditMode}
        ownerTitle={ownerTitle}
        ownerDescription={ownerDescription}
        ownerPrice={ownerPrice}
        ownerCityId={ownerCityId}
        ownerPreferredDate={ownerPreferredDate}
        ownerPhotos={ownerPhotos}
        isSavingOwner={isSavingOwner}
        isUploadingOwnerPhoto={isUploadingOwnerPhoto}
        activeOwnerSubmitIntent={activeOwnerSubmitIntent}
        ownerPriceTrend={ownerPriceTrend}
        onToggleOwnerEdit={() => setIsOwnerEditMode((prev) => !prev)}
        onOwnerClearText={handleOwnerClearText}
        onOwnerTitleChange={setOwnerTitle}
        onOwnerDescriptionChange={setOwnerDescription}
        onOwnerPriceChange={setOwnerPrice}
        onOwnerCityChange={setOwnerCityId}
        onOwnerPreferredDateChange={setOwnerPreferredDate}
        onOwnerPhotoPick={(files) => {
          void handleOwnerPhotoPick(files);
        }}
        onOwnerPhotoRemove={(index) =>
          setOwnerPhotos((prev) => prev.filter((_, photoIndex) => photoIndex !== index))
        }
        onOwnerCancelEdit={() => setIsOwnerEditMode(false)}
        onOwnerSave={() => {
          void handleOwnerSave();
        }}
        formatPriceValue={formatPriceValue}
        similarTitle={similarTitle}
        similarFallbackMessage={similarFallbackMessage}
        similarForRender={similarForRender}
        similarHref={similarHref}
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
          Boolean(existingResponse?.id)
            ? t(I18N_KEYS.requestDetails.responseCancel)
            : t(I18N_KEYS.common.back)
        }
        cancelKind={Boolean(existingResponse?.id) ? 'delete' : 'back'}
        onCancel={handleOfferCancel}
        onSuccessBack={handleOfferSuccessBack}
        onSubmit={handleOfferSubmit}
      />
    </PageShell>
  );
}
