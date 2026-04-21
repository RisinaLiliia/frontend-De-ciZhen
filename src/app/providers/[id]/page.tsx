'use client';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import {
  RequestDetailAbout,
  RequestDetailAside,
  RequestDetailError,
  RequestDetailHeader,
  RequestDetailLoading,
  RequestDetailMobileCta,
} from '@/components/requests/details';
import { UserHeaderCard } from '@/components/ui/UserHeaderCard';
import { ProviderAvailabilityMeta } from '@/components/providers/ProviderAvailabilityMeta';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { ProviderReviewsSection } from '@/features/providers/publicProfile/ProviderReviewsSection';
import { ProviderSimilarSection } from '@/features/providers/publicProfile/ProviderSimilarSection';
import { useProviderPublicProfileModel } from '@/features/providers/publicProfile/useProviderPublicProfileModel';

export default function ProviderPublicProfilePage() {
  const model = useProviderPublicProfileModel();

  if (model.isLoading) {
    return <RequestDetailLoading />;
  }

  if (model.isError || !model.provider || !model.profileCard) {
    return <RequestDetailError message={model.t(I18N_KEYS.provider.notFound)} />;
  }

  return (
    <PageShell
      right={<AuthActions />}
      showBack
      backHref="/workspace?section=providers"
      mainClassName="provider-public-main pb-6"
    >
      <div className="request-detail request-detail--provider">
        <section className="panel request-detail__panel">
          <RequestDetailHeader
            title=""
            priceLabel={model.priceLabel}
            pricePrefixLabel={model.pricePrefixLabel}
            priceSuffixLabel={model.priceSuffixLabel}
            tags={[]}
            badgeLabel={model.t(I18N_KEYS.requestsPage.favoritesTabProviders)}
          />

          <div className="request-detail__section request-detail__client">
            <div className="request-detail__client-card request-detail__client-card--provider-hero">
              <UserHeaderCard
                adaptiveDesktop
                name={model.provider.displayName || model.t(I18N_KEYS.provider.unnamed)}
                avatarUrl={model.provider.avatarUrl ?? undefined}
                avatarRole="provider"
                subtitle={model.profileCard.role}
                cityLabel={model.profileCard.cityLabel}
                status={model.hasRecentReview ? 'online' : 'offline'}
                statusLabel={model.statusLabel}
                responseTime={model.profileCard.responseTime}
                responseTimeLabel={model.profileCard.responseTimeLabel}
                responseRate={model.profileCard.responseRate}
                responseRateLabel={model.profileCard.responseRateLabel}
                rating={model.displayRatingAvg.toFixed(1)}
                reviewsCount={model.displayRatingCount}
                reviewsLabel={model.t(I18N_KEYS.homePublic.reviews)}
                reviewsHref={`/providers/${model.provider.id}#reviews`}
                isVerified={model.profileCard.isVerified}
                showRating={false}
              />
            </div>
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
          </div>

          <RequestDetailAbout
            title={model.t(I18N_KEYS.requestDetails.about)}
            description={model.aboutText}
            className="request-detail__section--about"
            clampLines={7}
            expandLabel={model.reviewsUi.expandAbout}
            collapseLabel={model.reviewsUi.collapseAbout}
          />

          <div className="request-detail__tags">
            {model.headerTags.map((tag) => (
              <span key={tag} className="request-tag">
                {tag}
              </span>
            ))}
          </div>

          <ProviderReviewsSection
            t={model.t}
            isReviewsLoading={model.isReviewsLoading}
            displayRatingAvg={model.displayRatingAvg}
            displayRatingCount={model.displayRatingCount}
            reviewsDistribution={model.reviewsDistribution}
            reviewsUi={model.reviewsUi}
            reviewSort={model.reviewSort}
            onReviewSortChange={model.setReviewSort}
            visibleReviews={model.visibleReviews}
            reviewsTotalForPagination={model.reviewsTotalForPagination}
            hasReviewsPagination={model.hasReviewsPagination}
            reviewPage={model.reviewPage}
            totalReviewPages={model.totalReviewPages}
            onPrevPage={() => model.setReviewPage((prev) => Math.max(1, prev - 1))}
            onNextPage={() => model.setReviewPage((prev) => Math.min(model.totalReviewPages, prev + 1))}
            formatReviewDate={(value) => model.reviewDateFormatter.format(new Date(value))}
          />
        </section>

        <RequestDetailAside
          cityLabel={model.profileCard.cityLabel || model.provider.cityName || '—'}
          dateLabel={model.profileCard.responseTime || model.t(I18N_KEYS.requestDetails.clientActive)}
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
      </div>
    </PageShell>
  );
}
