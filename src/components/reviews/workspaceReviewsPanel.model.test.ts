import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceLocaleTag,
  buildWorkspacePlatformReviewDistribution,
  buildWorkspacePlatformReviews,
  buildWorkspaceReviewDistribution,
  buildWorkspaceReviewableBookingOptions,
  buildWorkspaceReviewableRequestById,
  buildWorkspaceReviewsAverage,
  buildWorkspaceReviewsCount,
  buildWorkspaceReviewsUi,
  buildWorkspaceSortedUserReviews,
  resolveWorkspaceReviewableBookingsLoading,
  resolveWorkspaceUserReviewMutationErrorKey,
  resolveWorkspaceUserSubmitDisabled,
} from './workspaceReviewsPanel.model';

describe('workspaceReviewsPanel.model', () => {
  it('builds localized reviews ui, locale tag and normalized reviews', () => {
    const t = (key: string) => key;
    const ui = buildWorkspaceReviewsUi('de', t as never);
    const reviews = buildWorkspacePlatformReviews(
      [
        { id: 'review-1', rating: 4.6, text: 'Great', authorName: 'Anna', createdAt: '2026-03-20T10:00:00.000Z' },
      ] as never,
      t as never,
    );

    expect(ui.sortLatest).toBe('Neueste');
    expect(buildWorkspaceLocaleTag('de')).toBe('de-DE');
    expect(reviews[0]?.rating).toBe(5);
    expect(reviews[0]?.authorName).toBe('Anna');
  });

  it('builds booking options and derived distribution/count metrics', () => {
    const requestById = buildWorkspaceReviewableRequestById([
      { id: 'req-1', title: 'Bathroom repair', cityName: 'Berlin' },
    ]);
    const bookingOptions = buildWorkspaceReviewableBookingOptions({
      bookings: [
        { id: 'booking-1', requestId: 'req-1', startAt: '2026-03-22T10:00:00.000Z' },
      ],
      reviewableRequestById: requestById,
      bookingDateFormatter: new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }),
      t: ((key: string) => key) as never,
    });
    const userReviews = buildWorkspaceSortedUserReviews(
      [
        { id: 'review-1', rating: 3, text: 'Ok', createdAt: '2026-03-20T10:00:00.000Z' },
        { id: 'review-2', rating: 5, text: 'Top', createdAt: '2026-03-21T10:00:00.000Z' },
      ] as never,
      'top',
      ((key: string) => key) as never,
    );
    const distribution = buildWorkspaceReviewDistribution(userReviews);
    const platformDistribution = buildWorkspacePlatformReviewDistribution({ '5': 3, '4': 1 });

    expect(bookingOptions[0]?.label).toContain('Bathroom repair');
    expect(userReviews[0]?.id).toBe('review-2');
    expect(distribution.stats.get(5)).toBe(1);
    expect(platformDistribution.stats.get(5)).toBe(3);
    expect(buildWorkspaceReviewsAverage({ source: 'user', platformAverageRating: null, userReviews })).toBe(4);
    expect(buildWorkspaceReviewsCount({ source: 'platform', platformTotal: 7, userReviewsCount: 2 })).toBe(7);
  });

  it('resolves loading, submit disabled and user-review mutation error key', () => {
    expect(
      resolveWorkspaceReviewableBookingsLoading({
        source: 'user',
        userCompletedBookingsLoading: false,
        reviewableRequestIdsCount: 1,
        reviewableRequestsLoading: true,
      }),
    ).toBe(true);
    expect(
      resolveWorkspaceUserSubmitDisabled({
        isPending: false,
        isAuthenticated: true,
        reviewableBookingOptionsLength: 1,
        draftBookingId: 'booking-1',
      }),
    ).toBe(false);
    expect(resolveWorkspaceUserReviewMutationErrorKey('booking-required')).toBe(
      'requestsPage.userReviewFormBookingRequired',
    );
  });
});
