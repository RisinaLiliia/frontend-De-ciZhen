'use client';

import {
  RequestDetailAbout,
  RequestDetailError,
  RequestDetailLoading,
} from '@/components/requests/details';
import { UserHeaderCard } from '@/components/ui/UserHeaderCard';
import {
  buildCustomerPublicProfileSnapshotFromRequest,
  type CustomerPublicProfileSnapshot,
} from '@/features/customers/profile/customerPublicProfile.model';
import { useCustomerPublicProfileModel } from '@/features/customers/profile/useCustomerPublicProfileModel';
import { PublicProfileReviewsSection } from '@/features/reviews/PublicProfileReviewsSection';
import { workspacePanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import type { RequestResponseDto } from '@/lib/api/dto/requests';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type Translate = (key: I18nKey) => string;

type CustomerPublicProfileContentProps = {
  customerId?: string | null;
  snapshot?: CustomerPublicProfileSnapshot | null;
  request?: RequestResponseDto | null;
  locale?: Locale;
  t?: Translate;
};

export function CustomerPublicProfileContent({
  customerId = null,
  snapshot = null,
  request = null,
}: CustomerPublicProfileContentProps) {
  const requestSnapshot = request ? buildCustomerPublicProfileSnapshotFromRequest(request) : null;
  const model = useCustomerPublicProfileModel({
    customerId,
    snapshot: snapshot ?? requestSnapshot,
  });

  if (model.isLoading && !requestSnapshot && !snapshot) {
    return <RequestDetailLoading />;
  }

  if (model.isError && !model.customer && !requestSnapshot && !snapshot) {
    return <RequestDetailError message={model.t(I18N_KEYS.requestDetails.clientUnknown)} />;
  }

  const heroCard = (
    <div className="request-detail__client-card request-detail__client-card--provider-hero request-detail__client-card--customer-profile request-detail__client-header">
      <UserHeaderCard
        layoutVariant="detail"
        name={model.displayName}
        avatarUrl={model.displayAvatarUrl}
        avatarRole="client"
        cityLabel={model.displayCity}
        status={model.displayStatus}
        statusLabel={model.displayStatusLabel}
        showRating={false}
        rating={model.displayRatingAvg.toFixed(1)}
        reviewsCount={model.displayRatingCount}
        reviewsLabel={model.t(I18N_KEYS.requestDetails.clientReviews)}
      />
    </div>
  );

  return (
    <div className="request-detail request-detail--customer request-detail--dialog">
      <section className={workspacePanelShell('request-detail__panel')}>
        <div className="request-detail__dialog-main request-detail__dialog-main--single-column">
          <div className="request-detail__dialog-copy">
            <div className="request-detail__dialog-heading">
              {heroCard}
            </div>
            {model.displayBio ? (
              <RequestDetailAbout
                title={model.t(I18N_KEYS.requestDetails.about)}
                description={model.displayBio}
                className="request-detail__section--about"
                clampLines={7}
                expandLabel={model.reviewsUi.expandAbout}
                collapseLabel={model.reviewsUi.collapseAbout}
              />
            ) : null}
          </div>
        </div>

        <PublicProfileReviewsSection
          t={model.t}
          sectionClassName="public-profile-detail__reviews-section--dialog"
          sectionTitle={model.t(I18N_KEYS.requestsPage.reviewsViewLabel)}
          isReviewsLoading={model.isReviewsLoading}
          displayRatingAvg={model.displayRatingAvg}
          displayRatingCount={model.displayRatingCount}
          reviewsDistribution={model.reviewsDistribution}
          reviewsUi={model.reviewsUi}
          reviewSort={model.reviewSort}
          layout="stacked"
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
    </div>
  );
}
