'use client';

import { DetailActionBar } from '@/components/details/DetailActionBar';
import {
  RequestDetailAbout,
  RequestDetailAside,
  RequestDetailError,
  RequestDetailHeader,
  RequestDetailLoading,
  RequestDetailMobileCta,
  RequestDetailPrice,
} from '@/components/requests/details';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { UserHeaderCard } from '@/components/ui/UserHeaderCard';
import { ProviderAvailabilityMeta } from '@/components/providers/ProviderAvailabilityMeta';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { workspacePanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import { PublicProfileReviewsSection } from '@/features/reviews/PublicProfileReviewsSection';
import { ProviderSimilarSection } from '@/features/providers/profile/ProviderSimilarSection';
import { ProviderDetailHeroActions } from '@/features/providers/profile/ProviderDetailHeroActions';
import {
  useProviderPublicProfileModel,
  type UseProviderPublicProfileModelArgs,
} from '@/features/providers/profile/useProviderPublicProfileModel';

type ProviderPublicProfileContentProps = UseProviderPublicProfileModelArgs;

type ProviderPublicProfileSurface = 'page' | 'dialog';

type ProviderPublicProfileContentOwnProps = {
  surface?: ProviderPublicProfileSurface;
};

export function ProviderPublicProfileContent({
  surface = 'page',
  ...props
}: ProviderPublicProfileContentProps & ProviderPublicProfileContentOwnProps) {
  const model = useProviderPublicProfileModel(props);
  const isDialogSurface = surface === 'dialog';

  if (model.isLoading) {
    return <RequestDetailLoading />;
  }

  if (model.isError || !model.provider || !model.profileCard) {
    return <RequestDetailError message={model.t(I18N_KEYS.provider.notFound)} />;
  }

  const heroCard = (
    <div className="request-detail__client-card request-detail__client-card--provider-hero request-detail__client-header">
      <UserHeaderCard
        layoutVariant="detail"
        adaptiveDesktop={!isDialogSurface}
        name={model.provider.displayName || model.t(I18N_KEYS.provider.unnamed)}
        avatarUrl={model.provider.avatarUrl ?? undefined}
        avatarRole="provider"
        subtitle={model.profileCard.role}
        cityLabel={model.profileCard.cityLabel}
        headerAction={
          isDialogSurface ? (
            <ProviderDetailHeroActions
              t={model.t}
              title={model.provider.displayName || model.t(I18N_KEYS.provider.unnamed)}
              isFavorite={model.isSaved}
              isFavoritePending={model.pendingFavoriteProviderIds.has(model.provider.id)}
              onToggleFavorite={model.handleFavorite}
            />
          ) : undefined
        }
        status={model.hasRecentReview ? 'online' : 'offline'}
        statusLabel={model.statusLabel}
        responseTime={model.profileCard.responseTime}
        responseTimeLabel={model.profileCard.responseTimeLabel}
        responseRate={model.profileCard.responseRate}
        responseRateLabel={model.profileCard.responseRateLabel}
        showInlineMetricLabels={isDialogSurface}
        rating={model.displayRatingAvg.toFixed(1)}
        reviewsCount={model.displayRatingCount}
        reviewsLabel={model.t(I18N_KEYS.homePublic.reviews)}
        reviewsHref={model.reviewsHref}
        isVerified={model.profileCard.isVerified}
        showRating={false}
        ratingPlacement={isDialogSurface ? 'avatar' : 'main'}
      />
    </div>
  );

  return (
    <div
      className={`request-detail request-detail--provider ${isDialogSurface ? 'request-detail--dialog' : ''}`.trim()}
    >
      <section className={workspacePanelShell('request-detail__panel')}>
        {!isDialogSurface ? (
          <>
            <RequestDetailHeader
              title={model.provider.displayName || model.t(I18N_KEYS.provider.unnamed)}
              eyebrowLabel={model.profileCard.role}
              priceLabel={model.priceLabel}
              pricePrefixLabel={model.pricePrefixLabel}
              priceSuffixLabel={model.priceSuffixLabel}
              tags={[]}
              headerAction={
                <FavoriteButton
                  isFavorite={model.isSaved}
                  isPending={model.pendingFavoriteProviderIds.has(model.provider.id)}
                  ariaLabel={model.t(I18N_KEYS.requestDetails.ctaSave)}
                  onToggle={model.handleFavorite}
                  className="request-detail__header-favorite"
                />
              }
            />

            <div className="request-detail__section request-detail__client">{heroCard}</div>
            <div className="request-detail__provider-mobile-availability request-detail__availability-actions">
              <ProviderAvailabilityMeta
                stateLabel={model.availabilityModel.stateLabel}
                datePrefix={model.availabilityModel.datePrefix}
                dateLabel={model.availabilityModel.dateLabel}
                dateIso={model.availabilityModel.dateIso}
                tone={model.availabilityModel.isBusy ? 'warning' : 'success'}
                calendarLocale={model.locale}
                calendar={model.availabilityCalendarConfig}
              />
            </div>
            <RequestDetailMobileCta
              className="request-detail__mobile-cta--inline request-detail__mobile-cta--provider-inline"
              ctaApplyLabel={model.t(I18N_KEYS.requestDetails.ctaApply)}
              ctaChatLabel={model.t(I18N_KEYS.requestDetails.ctaChat)}
              onApply={model.handleApply}
              onChat={model.handleChat}
              showApply
              showChat
              compactIcons
            />

            <RequestDetailAbout
              title={model.t(I18N_KEYS.requestDetails.about)}
              description={model.aboutText}
              className="request-detail__section--about"
              clampLines={7}
              expandLabel={model.reviewsUi.expandAbout}
              collapseLabel={model.reviewsUi.collapseAbout}
            />
          </>
        ) : (
          <div className="request-detail__dialog-main request-detail__dialog-main--single-column">
            <div className="request-detail__dialog-copy">
              <div className="request-detail__dialog-heading">{heroCard}</div>

              <RequestDetailAbout
                title={model.t(I18N_KEYS.requestDetails.about)}
                description={model.aboutText}
                className="request-detail__section--about"
                clampLines={7}
                expandLabel={model.reviewsUi.expandAbout}
                collapseLabel={model.reviewsUi.collapseAbout}
              />

              <div className="request-detail__summary-row">
                <div className="request-detail__summary-meta request-detail__summary-meta--single">
                  <ProviderAvailabilityMeta
                    stateLabel={model.availabilityModel.stateLabel}
                    datePrefix={model.availabilityModel.datePrefix}
                    dateLabel={model.availabilityModel.dateLabel}
                    dateIso={model.availabilityModel.dateIso}
                    tone={model.availabilityModel.isBusy ? 'warning' : 'success'}
                    calendarLocale={model.locale}
                    calendar={model.availabilityCalendarConfig}
                    showStateBadge={false}
                  />
                </div>
                <RequestDetailPrice
                  className="request-detail__summary-price"
                  priceLabel={model.priceLabel}
                  pricePrefixLabel={model.pricePrefixLabel}
                  priceSuffixLabel={model.priceSuffixLabel}
                />
              </div>
            </div>
          </div>
        )}

        {isDialogSurface ? (
          <>
            <DetailActionBar
              className="request-detail__dialog-action-bar"
              advice={model.t(I18N_KEYS.requestDetails.responseSuccessTipCardBody)}
              actions={
                <>
                  <button
                    type="button"
                    className="btn-ghost is-primary request-detail__action-btn request-detail__action-btn--primary"
                    onClick={model.handleApply}
                  >
                    {model.t(I18N_KEYS.requestDetails.ctaApply)}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary request-detail__action-btn request-detail__action-btn--secondary"
                    onClick={model.handleChat}
                  >
                    {model.t(I18N_KEYS.requestDetails.ctaChat)}
                  </button>
                </>
              }
            />
          </>
        ) : null}

        <PublicProfileReviewsSection
          t={model.t}
          isReviewsLoading={model.isReviewsLoading}
          sectionClassName={
            isDialogSurface ? 'public-profile-detail__reviews-section--dialog' : undefined
          }
          displayRatingAvg={model.displayRatingAvg}
          displayRatingCount={model.displayRatingCount}
          reviewsDistribution={model.reviewsDistribution}
          reviewsUi={model.reviewsUi}
          reviewSort={model.reviewSort}
          layout={isDialogSurface ? 'stacked' : 'split'}
          onReviewSortChange={model.setReviewSort}
          visibleReviews={model.visibleReviews}
          reviewsTotalForPagination={model.reviewsTotalForPagination}
          hasReviewsPagination={model.hasReviewsPagination}
          reviewPage={model.reviewPage}
          totalReviewPages={model.totalReviewPages}
          onPrevPage={() => model.setReviewPage((prev) => Math.max(1, prev - 1))}
          onNextPage={() =>
            model.setReviewPage((prev) => Math.min(model.totalReviewPages, prev + 1))
          }
          formatReviewDate={(value) => model.reviewDateFormatter.format(new Date(value))}
        />

        {isDialogSurface ? (
          <ProviderSimilarSection
            t={model.t}
            title={model.similarProvidersTitle}
            hint={model.similarProvidersHint}
            cards={model.similarCards}
          />
        ) : null}
      </section>

      {!isDialogSurface ? (
        <RequestDetailAside
          cityLabel={model.profileCard.cityLabel || model.provider.cityName || '—'}
          dateLabel={
            model.profileCard.responseTime || model.t(I18N_KEYS.requestDetails.clientActive)
          }
          metaClassName="request-detail__meta--provider-availability"
          metaContent={
            <div className="request-detail__availability-actions">
              <ProviderAvailabilityMeta
                stateLabel={model.availabilityModel.stateLabel}
                datePrefix={model.availabilityModel.datePrefix}
                dateLabel={model.availabilityModel.dateLabel}
                dateIso={model.availabilityModel.dateIso}
                tone={model.availabilityModel.isBusy ? 'warning' : 'success'}
                calendarLocale={model.locale}
                calendar={model.availabilityCalendarConfig}
              />
            </div>
          }
          ctaApplyLabel={model.t(I18N_KEYS.requestDetails.ctaApply)}
          ctaChatLabel={model.t(I18N_KEYS.requestDetails.ctaChat)}
          onApply={model.handleApply}
          onChat={model.handleChat}
          showApply
          showChat
        >
          <ProviderSimilarSection
            t={model.t}
            title={model.similarProvidersTitle}
            hint={model.similarProvidersHint}
            cards={model.similarCards}
          />
        </RequestDetailAside>
      ) : null}
    </div>
  );
}
