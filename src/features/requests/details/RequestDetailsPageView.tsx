'use client';

import * as React from 'react';
import Link from 'next/link';
import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { RequestDetailsViewModel } from '@/features/requests/details/viewModel';
import { buildRequestImageList } from '@/lib/requests/images';
import { getStatusBadgeClass } from '@/lib/statusBadge';
import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { IconEye } from '@/components/ui/icons/icons';
import {
  RequestDetailAbout,
  RequestDetailAside,
  RequestDetailClient,
  RequestDetailGallery,
  RequestDetailHeader,
  RequestDetailMetaRows,
  RequestDetailMobileCta,
  RequestOwnerEditPanel,
  RequestOfferSheet,
  RequestDetailSimilar,
} from '@/components/requests/details';

type RequestStatusView = {
  token: string;
  label: string;
};

type ApplyState = 'accepted' | 'edit' | 'default';

type Props = {
  t: (key: I18nKey) => string;
  backHref: string;
  profileHref: string;
  request: RequestResponseDto;
  viewModel: RequestDetailsViewModel;
  requestStatusView: RequestStatusView;
  requestPriceTrend: 'up' | 'down' | null;
  requestPriceTrendLabel: string | null;
  applyLabel: string;
  applyState: ApplyState;
  applyTitle: string | undefined;
  viewOffersLabel: string;
  showOfferCta: boolean;
  showChatCta: boolean;
  showFavoriteCta: boolean;
  showOwnerBadge: boolean;
  isSaved: boolean;
  isSavePending: boolean;
  onApply: () => void;
  onChat: () => void;
  onFavorite: () => void;
  isOwnerEditMode: boolean;
  ownerTitle: string;
  ownerDescription: string;
  ownerPrice: string;
  ownerPhotos: string[];
  isSavingOwner: boolean;
  isUploadingOwnerPhoto: boolean;
  ownerPriceTrend: 'up' | 'down' | null;
  onToggleOwnerEdit: () => void;
  onOwnerClearText: () => void;
  onOwnerTitleChange: (value: string) => void;
  onOwnerDescriptionChange: (value: string) => void;
  onOwnerPriceChange: (value: string) => void;
  onOwnerPhotoPick: (files: FileList | null) => void;
  onOwnerPhotoRemove: (index: number) => void;
  onOwnerCancelEdit: () => void;
  onOwnerSave: () => void;
  formatPriceValue: (value: number) => string;
  similarTitle: string;
  similarFallbackMessage: string | undefined;
  similarForRender: RequestResponseDto[];
  similarHref: string;
  isOfferSheetOpen: boolean;
  offerSheetMode: 'form' | 'success';
  hasOffer: boolean;
  hasExistingResponse: boolean;
  offerAmount: string;
  offerComment: string;
  offerAvailability: string;
  isSubmittingOffer: boolean;
  onOfferAmountChange: (value: string) => void;
  onOfferCommentChange: (value: string) => void;
  onOfferAvailabilityChange: (value: string) => void;
  onOfferClose: () => void;
  onOfferCancel: () => void;
  onOfferSuccessBack: () => void;
  onOfferSubmit: () => void;
  profileAvatarUrl: string | null;
  profileName: string | null;
  profileOnline: boolean;
  profileStatusLabel: string;
  isProviderProfileComplete: boolean;
};

export function RequestDetailsPageView({
  t,
  backHref,
  profileHref,
  request,
  viewModel,
  requestStatusView,
  requestPriceTrend,
  requestPriceTrendLabel,
  applyLabel,
  applyState,
  applyTitle,
  viewOffersLabel,
  showOfferCta,
  showChatCta,
  showFavoriteCta,
  showOwnerBadge,
  isSaved,
  isSavePending,
  onApply,
  onChat,
  onFavorite,
  isOwnerEditMode,
  ownerTitle,
  ownerDescription,
  ownerPrice,
  ownerPhotos,
  isSavingOwner,
  isUploadingOwnerPhoto,
  ownerPriceTrend,
  onToggleOwnerEdit,
  onOwnerClearText,
  onOwnerTitleChange,
  onOwnerDescriptionChange,
  onOwnerPriceChange,
  onOwnerPhotoPick,
  onOwnerPhotoRemove,
  onOwnerCancelEdit,
  onOwnerSave,
  formatPriceValue,
  similarTitle,
  similarFallbackMessage,
  similarForRender,
  similarHref,
  isOfferSheetOpen,
  offerSheetMode,
  hasOffer,
  hasExistingResponse,
  offerAmount,
  offerComment,
  offerAvailability,
  isSubmittingOffer,
  onOfferAmountChange,
  onOfferCommentChange,
  onOfferAvailabilityChange,
  onOfferClose,
  onOfferCancel,
  onOfferSuccessBack,
  onOfferSubmit,
  profileAvatarUrl,
  profileName,
  profileOnline,
  profileStatusLabel,
  isProviderProfileComplete,
}: Props) {
  return (
    <PageShell
      right={<AuthActions />}
      showBack
      backHref={backHref}
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
              onToggleEdit={onToggleOwnerEdit}
              onClearText={onOwnerClearText}
              onTitleChange={onOwnerTitleChange}
              onDescriptionChange={onOwnerDescriptionChange}
              onPriceChange={onOwnerPriceChange}
              onPhotoPick={onOwnerPhotoPick}
              onRemovePhoto={onOwnerPhotoRemove}
              onCancelEdit={onOwnerCancelEdit}
              onSave={onOwnerSave}
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
            isSavePending={isSavePending}
            onApply={onApply}
            onChat={onChat}
            onToggleSave={onFavorite}
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
          isSavePending={isSavePending}
          onApply={onApply}
          onChat={onChat}
          onToggleSave={onFavorite}
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
        profileAvatarUrl={profileAvatarUrl}
        profileName={profileName}
        profileOnline={profileOnline}
        profileStatusLabel={profileStatusLabel}
        isSubmitting={isSubmittingOffer}
        onAmountChange={onOfferAmountChange}
        onCommentChange={onOfferCommentChange}
        onAvailabilityChange={onOfferAvailabilityChange}
        onClose={onOfferClose}
        cancelLabel={
          hasExistingResponse
            ? t(I18N_KEYS.requestDetails.responseCancel)
            : t(I18N_KEYS.common.back)
        }
        cancelKind={hasExistingResponse ? 'delete' : 'back'}
        onCancel={onOfferCancel}
        onSuccessBack={onOfferSuccessBack}
        onSubmit={onOfferSubmit}
      />
    </PageShell>
  );
}
