'use client';

export const WORKSPACE_PUBLIC_ACTIVITY_PROGRESS = 12;

export function resolveWorkspacePublicMeta(params: {
  platformRatingAvg: number;
  platformReviewsCount: number;
}) {
  return {
    activityProgress: WORKSPACE_PUBLIC_ACTIVITY_PROGRESS,
    insightText: '',
    navRatingValue: params.platformRatingAvg.toFixed(1),
    navReviewsCount: params.platformReviewsCount,
  };
}
