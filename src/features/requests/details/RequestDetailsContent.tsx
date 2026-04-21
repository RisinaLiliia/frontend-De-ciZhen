'use client';

import * as React from 'react';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import type { RequestDetailsViewModel } from '@/features/requests/details/viewModel';
import { getStatusBadgeClass } from '@/lib/statusBadge';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import {
  RequestDetailAbout,
  RequestDetailAside,
  RequestDetailClient,
  RequestDetailGallery,
  RequestDetailHeader,
  RequestDetailMetaRows,
  RequestDetailMobileCta,
  RequestDetailSimilar,
  RequestOwnerEditPanel,
} from '@/components/requests/details';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { buildRequestImageList } from '@/lib/requests/images';

type RequestStatusView = {
  token: string;
  label: string;
};

type ApplyState = 'accepted' | 'edit' | 'default';

type Props = {
  t: (key: I18nKey) => string;
  request: RequestResponseDto;
  viewModel: RequestDetailsViewModel;
  surface?: 'page' | 'dialog';
  statusBadgeContent?: React.ReactNode;
  headerActionSlot?: React.ReactNode;
  requestStatusView: RequestStatusView;
  requestPriceTrend: 'up' | 'down' | null;
  requestPriceTrendLabel: string | null;
  applyLabel: string;
  applyState: ApplyState;
  applyTitle: string | undefined;
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
  activeOwnerSubmitIntent: 'draft' | 'publish' | null;
  ownerPriceTrend: 'up' | 'down' | null;
  onToggleOwnerEdit: () => void;
  onOwnerClearText: () => void;
  onOwnerTitleChange: (value: string) => void;
  onOwnerDescriptionChange: (value: string) => void;
  onOwnerPriceChange: (value: string) => void;
  onOwnerPhotoPick: (files: FileList | null) => void;
  onOwnerPhotoRemove: (index: number) => void;
  onOwnerCancelEdit: () => void;
  onOwnerSave: (intent?: 'draft' | 'publish') => void;
  formatPriceValue: (value: number) => string;
  similarTitle?: string;
  similarFallbackMessage?: string;
  similarForRender?: RequestResponseDto[];
  similarHref?: string;
  onOpenSimilarRequest?: (requestId: string) => void;
  asideChildren?: React.ReactNode;
  asideExtraActions?: React.ReactNode;
  mobileExtraActions?: React.ReactNode;
};

export function RequestDetailsContent({
  t,
  request,
  viewModel,
  surface = 'page',
  statusBadgeContent,
  headerActionSlot,
  requestStatusView,
  requestPriceTrend,
  requestPriceTrendLabel,
  applyLabel,
  applyState,
  applyTitle,
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
  activeOwnerSubmitIntent,
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
  similarForRender = [],
  similarHref,
  onOpenSimilarRequest,
  asideChildren,
  asideExtraActions,
  mobileExtraActions,
}: Props) {
  const isDialogSurface = surface === 'dialog';
  const ownerDescriptionText = ownerDescription.trim() || viewModel.description;
  const ownerImages = ownerPhotos.length > 0 ? ownerPhotos : buildRequestImageList(request);
  const priceLabel = isOwnerEditMode
    ? ownerPrice.trim()
      ? formatPriceValue(Number(ownerPrice))
      : t(I18N_KEYS.requestDetails.priceOnRequest)
    : viewModel.priceLabel;
  const dialogGallery = showOwnerBadge ? ownerImages : viewModel.images;
  const dialogAiAdvice = showOwnerBadge
    ? (t(I18N_KEYS.requestDetails.ownerHint))
    : (t(I18N_KEYS.requestDetails.responseSuccessTipCardBody));

  return (
    <div className={`request-detail ${isDialogSurface ? 'request-detail--dialog' : ''}`.trim()}>
      <section className="panel request-detail__panel">
        <RequestDetailHeader
          title={isOwnerEditMode ? ownerTitle || viewModel.title : viewModel.title}
          eyebrowLabel={viewModel.categoryLabel}
          priceLabel={priceLabel}
          priceTrend={requestPriceTrend}
          priceTrendLabel={requestPriceTrendLabel}
          showPrice={!isDialogSurface}
          showTags={!isDialogSurface}
          showIdentity={!isDialogSurface}
          tags={viewModel.tagList}
          badgeLabel={showOwnerBadge ? t(I18N_KEYS.requestDetails.ownerBadge) : undefined}
          statusBadge={statusBadgeContent ?? (
            <span className={getStatusBadgeClass(requestStatusView.token)}>{requestStatusView.label}</span>
          )}
          headerAction={headerActionSlot ?? (showFavoriteCta ? (
            <FavoriteButton
              isFavorite={isSaved}
              isPending={isSavePending}
              ariaLabel={t(I18N_KEYS.requestDetails.ctaSave)}
              onToggle={onFavorite}
              className="request-detail__header-favorite"
            />
          ) : undefined)}
        />

        {isDialogSurface && !isOwnerEditMode ? (
          <div className="request-detail__dialog-main request-card__main--with-media">
            <div className="request-detail__dialog-copy request-card__copy">
              <div className="request-detail__dialog-heading">
                {viewModel.categoryLabel ? (
                  <p className="request-category request-detail__eyebrow">{viewModel.categoryLabel}</p>
                ) : null}
                <h1 className="request-detail__title">{showOwnerBadge ? ownerTitle || viewModel.title : viewModel.title}</h1>
              </div>

              <RequestDetailAbout
                title=""
                description={showOwnerBadge ? ownerDescriptionText : viewModel.description}
              />

              <div className="request-detail__summary-row">
                <RequestDetailMetaRows
                  cityLabel={viewModel.cityLabel}
                  dateLabel={viewModel.preferredDateLabel}
                  className="request-detail__summary-meta"
                />
                <div className="request-card__price request-detail__summary-price">
                  <span className="proof-price">{priceLabel}</span>
                  {requestPriceTrend ? (
                    <span
                      className={`request-card__price-trend ${
                        requestPriceTrend === 'down' ? 'is-down' : 'is-up'
                      }`.trim()}
                    >
                      {requestPriceTrend === 'down' ? '↓' : '↑'} {requestPriceTrendLabel}
                    </span>
                  ) : null}
                </div>
              </div>

              {viewModel.tagList.length > 0 ? (
                <div className="request-detail__tags request-detail__tags--dialog-inline">
                  {viewModel.tagList.map((tag) => (
                    <span key={tag} className="request-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {!showOwnerBadge && viewModel.hasClientInfo ? (
                <RequestDetailClient
                  title=""
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
            </div>

            {dialogGallery.length > 0 ? (
              <RequestDetailGallery images={dialogGallery} title={viewModel.title} surface="dialog" />
            ) : null}
          </div>
        ) : showOwnerBadge ? (
          <>
            <RequestOwnerEditPanel
              isEditMode={isOwnerEditMode}
              showPublishAction={request.status === 'draft'}
              isSaving={isSavingOwner}
              isUploadingPhoto={isUploadingOwnerPhoto}
              activeSubmitIntent={activeOwnerSubmitIntent}
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
              saveLabel={request.status === 'draft'
                ? t(I18N_KEYS.request.submitDraft)
                : t(I18N_KEYS.requestDetails.ownerSave)}
              publishLabel={t(I18N_KEYS.request.submitPublish)}
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
            {!isOwnerEditMode && ownerImages.length > 0 ? (
              <RequestDetailGallery images={ownerImages} title={viewModel.title} />
            ) : null}
            {!isOwnerEditMode ? (
              <RequestDetailAbout
                title={t(I18N_KEYS.requestDetails.about)}
                description={ownerDescriptionText}
                clampLines={isDialogSurface ? 5 : undefined}
              />
            ) : null}
          </>
        ) : (
          <>
            <RequestDetailGallery images={viewModel.images} title={viewModel.title} />
            <RequestDetailAbout
              title={t(I18N_KEYS.requestDetails.about)}
              description={viewModel.description}
              clampLines={isDialogSurface ? 5 : undefined}
            />
          </>
        )}

        {!isDialogSurface && !showOwnerBadge && viewModel.hasClientInfo ? (
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

        {isDialogSurface ? (
          <>
            {(showOfferCta || showChatCta) ? (
              <div className="my-request-card__footer-bar request-detail__dialog-footer-bar">
                <div className="my-request-card__footer-note is-info request-detail__dialog-advice">
                  <span className="my-request-card__footer-note-icon" aria-hidden="true">
                    i
                  </span>
                  <p className="my-request-card__footer-note-copy">{dialogAiAdvice}</p>
                </div>

                <div className="my-request-card__action-row request-detail__dialog-actions">
                  {showChatCta ? (
                    <button
                      type="button"
                      className="btn-secondary my-request-card__action-btn my-request-card__action-btn--secondary"
                      onClick={onChat}
                    >
                      {t(I18N_KEYS.requestDetails.ctaChat)}
                    </button>
                  ) : null}
                  {showOfferCta ? (
                    <button
                      type="button"
                      className="btn-ghost is-primary my-request-card__action-btn my-request-card__action-btn--primary"
                      onClick={onApply}
                      title={applyTitle}
                    >
                      {applyLabel}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <RequestDetailMetaRows
              cityLabel={viewModel.cityLabel}
              dateLabel={viewModel.preferredDateLabel}
              className="request-detail__mobile-meta"
            />

            <RequestDetailMobileCta
              className="request-detail__mobile-cta--inline"
              ctaApplyLabel={applyLabel}
              ctaChatLabel={t(I18N_KEYS.requestDetails.ctaChat)}
              onApply={onApply}
              onChat={onChat}
              applyState={applyState}
              applyTitle={applyTitle}
              showApply={showOfferCta}
              showChat={showChatCta}
              compactIcons
              extraActions={mobileExtraActions}
            />
          </>
        )}
      </section>

      <RequestDetailAside
        cityLabel={viewModel.cityLabel}
        dateLabel={viewModel.preferredDateLabel}
        ctaApplyLabel={applyLabel}
        ctaChatLabel={t(I18N_KEYS.requestDetails.ctaChat)}
        onApply={onApply}
        onChat={onChat}
        applyState={applyState}
        applyTitle={applyTitle}
        showApply={!isDialogSurface && showOfferCta}
        showChat={!isDialogSurface && showChatCta}
        showMeta={!isDialogSurface}
        extraActions={asideExtraActions}
      >
        {asideChildren}
        {similarTitle && similarHref ? (
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
            onOpenRequest={onOpenSimilarRequest}
          />
        ) : null}
      </RequestDetailAside>
    </div>
  );
}
