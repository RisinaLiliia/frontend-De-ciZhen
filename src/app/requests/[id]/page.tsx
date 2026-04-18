//src/app/requests/[id]/page.tsx
'use client';

import * as React from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  RequestDetailError,
  RequestDetailLoading,
} from '@/components/requests/details';
import { useAuthMe, useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import { useRequestOfferActions } from '@/features/requests/details/useRequestOfferActions';
import { useRequestDetailsRelated } from '@/features/requests/details/useRequestDetailsRelated';
import { useRequestOwnerEdit } from '@/features/requests/details/useRequestOwnerEdit';
import { useRequestDetailsViewModel } from '@/features/requests/details/useRequestDetailsViewModel';
import { useRequestDetailsUrlAction } from '@/features/requests/details/useRequestDetailsUrlAction';
import { useRequestDetailsPresentation } from '@/features/requests/details/useRequestDetailsPresentation';
import { useRequestDetailsPageData } from '@/features/requests/details/useRequestDetailsPageData';
import { RequestDetailsPageView } from '@/features/requests/details/RequestDetailsPageView';

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
  });

  const isOwner = isAuthed && Boolean(request?.clientId) && request?.clientId === currentUserId;
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
  const {
    similarTitle,
    similarFallbackMessage,
    similarForRender,
    similarHref,
  } = useRequestDetailsRelated({
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
    onToggleFavorite: (id) => {
      void toggleRequestFavorite(id);
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
    providerProfile,
    t,
  });

  if (!isHydrated || isLoading) {
    return <RequestDetailLoading />;
  }
  if (isError || !request || !viewModel) {
    return <RequestDetailError message={t(I18N_KEYS.requestsPage.error)} />;
  }

  return (
    <RequestDetailsPageView
      t={t}
      backHref={isAuthed ? WORKSPACE_MY_REQUESTS_URL : WORKSPACE_GUEST_REQUESTS_URL}
      profileHref={profileHref}
      request={request}
      viewModel={viewModel}
      requestStatusView={requestStatusView}
      requestPriceTrend={requestPriceTrend}
      requestPriceTrendLabel={requestPriceTrendLabel}
      applyLabel={applyLabel}
      applyState={applyState}
      applyTitle={applyTitle}
      viewOffersLabel={viewOffersLabel}
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
      isOfferSheetOpen={isOfferSheetOpen}
      offerSheetMode={offerSheetMode}
      hasOffer={hasOffer}
      hasExistingResponse={Boolean(existingResponse?.id)}
      offerAmount={offerAmount}
      offerComment={offerComment}
      offerAvailability={offerAvailability}
      isSubmittingOffer={isSubmittingOffer}
      onOfferAmountChange={setOfferAmount}
      onOfferCommentChange={setOfferComment}
      onOfferAvailabilityChange={setOfferAvailability}
      onOfferClose={closeOfferSheet}
      onOfferCancel={handleOfferCancel}
      onOfferSuccessBack={handleOfferSuccessBack}
      onOfferSubmit={handleOfferSubmit}
      profileAvatarUrl={authMe?.avatar?.url ?? null}
      profileName={authMe?.name ?? authUser?.name ?? null}
      profileOnline={authStatus === 'authenticated'}
      profileStatusLabel={
        authStatus === 'authenticated'
          ? t(I18N_KEYS.requestDetails.clientOnline)
          : t(I18N_KEYS.requestDetails.clientActive)
      }
      isProviderProfileComplete={isProviderProfileComplete}
    />
  );
}
