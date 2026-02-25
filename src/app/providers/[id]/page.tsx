// src/app/providers/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { listPublicProviders } from '@/lib/api/providers';
import { listReviews } from '@/lib/api/reviews';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { RatingSummary } from '@/components/ui/RatingSummary';

export default function ProviderPublicProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const t = useT();

  const { data, isLoading } = useQuery({
    queryKey: ['provider', id],
    queryFn: async () => {
      const list = await listPublicProviders();
      return list.find((p) => p.id === id) ?? null;
    },
    enabled: Boolean(id),
  });

  const { data: reviews = [], isLoading: isReviewsLoading } = useQuery({
    queryKey: ['provider-reviews', id],
    enabled: Boolean(id),
    queryFn: () =>
      listReviews({
        targetUserId: id,
        targetRole: 'provider',
        limit: 100,
        offset: 0,
      }),
  });

  const hasReviews = reviews.length > 0;

  return (
    <PageShell right={<AuthActions />} withSpacer={true}>
      <section className="card stack-sm">
        <WorkspaceContentState
          isLoading={isLoading}
          isEmpty={!data}
          emptyTitle={t(I18N_KEYS.provider.notFound)}
          emptyHint={t(I18N_KEYS.requestsPage.subtitle)}
          emptyCtaLabel={t(I18N_KEYS.requestsPage.navNewOrders)}
          emptyCtaHref="/orders?tab=new-orders"
          skeletonCount={1}
        >
          <h1 className="typo-h2">{data?.displayName || t(I18N_KEYS.provider.unnamed)}</h1>
          <div className="stack-sm">
            <RatingSummary
              rating={data?.ratingAvg?.toFixed(1) ?? '0.0'}
              reviewsCount={data?.ratingCount ?? 0}
              reviewsLabel={t(I18N_KEYS.homePublic.reviews)}
            />
            <p className="typo-muted">
              {t(I18N_KEYS.provider.jobs)}: {data?.completedJobs ?? 0}
            </p>
            <p className="typo-small">
              {t(I18N_KEYS.provider.basePrice)}:{' '}
              {data?.basePrice ? `€ ${data.basePrice}` : '—'}
            </p>
            <div className="action-row">
              <Link href={`/chat?provider=${id}`} className="btn-ghost">
                {t(I18N_KEYS.offers.chatCta)}
              </Link>
              <Link href={`/requests/create?providerId=${id}`} className="btn-secondary">
                {t(I18N_KEYS.requestDetails.ctaApply)}
              </Link>
            </div>
          </div>

          <section id="reviews" className="stack-sm">
            <h2 className="typo-h3">{t(I18N_KEYS.requestsPage.reviewsViewLabel)}</h2>
            <WorkspaceContentState
              isLoading={isReviewsLoading}
              isEmpty={!hasReviews}
              emptyTitle={t(I18N_KEYS.requestsPage.reviewsEmptyTitle)}
              emptyHint={t(I18N_KEYS.requestsPage.reviewsEmptyHint)}
            >
              <div className="stack-sm">
                {reviews.map((review) => (
                  <article key={review.id} className="card stack-sm">
                    <p className="typo-small">
                      {(review.rating ?? 0).toFixed(1)} ★
                    </p>
                    <p className="typo-small">
                      {review.text?.trim() || review.comment?.trim() || '—'}
                    </p>
                    <p className="typo-muted">
                      {review.authorName ?? t(I18N_KEYS.provider.unnamed)}
                    </p>
                  </article>
                ))}
              </div>
            </WorkspaceContentState>
          </section>
        </WorkspaceContentState>
      </section>
    </PageShell>
  );
}
