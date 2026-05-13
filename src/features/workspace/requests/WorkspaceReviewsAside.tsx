'use client';

import { useQuery } from '@tanstack/react-query';

import { getWorkspaceReviews } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { WorkspaceReviewsComposer } from '@/features/workspace/requests/WorkspaceReviewsComposer';
import { WorkspaceSectionAside } from '@/features/workspace/requests/components/WorkspaceSectionAside';
import { useWorkspaceReviewControlsState } from '@/features/workspace/requests/useWorkspaceReviewControlsState';

type Props = {
  t: (key: I18nKey) => string;
  locale: Locale;
  hideBelowDesktop?: boolean;
};

export function WorkspaceReviewsAside({
  t,
  locale,
  hideBelowDesktop = true,
}: Props) {
  const { reviewSort, reviewRange } = useWorkspaceReviewControlsState();
  const sort = reviewSort === 'top' ? 'rating_desc' : 'created_desc';

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ['workspace-reviews-rail', reviewRange, sort],
    queryFn: () =>
      withStatusFallback(
        () => getWorkspaceReviews({ range: reviewRange, sort }),
        null,
        [400, 404],
      ),
    retry: false,
    staleTime: 60_000,
  });

  if (!data && !isLoading) {
    return null;
  }

  return (
    <WorkspaceSectionAside
      locale={locale}
      summaryItems={data?.summary.items ?? null}
      isLoading={isLoading}
      hideBelowDesktop={hideBelowDesktop}
      panel={data ? {
        ...data.decisionPanel,
        queue: data.decisionPanel.queue.map((item) => ({
          id: item.reviewId,
          title: item.title,
          actionLabel: item.actionLabel,
          actionPriorityLevel: item.actionPriorityLevel,
          actionReason: item.actionReason,
          href: item.href,
        })),
      } : null}
    >
      {data?.composer.enabled ? (
        <WorkspaceReviewsComposer
          t={t}
          requiresAuthorName={data.composer.requiresAuthorName}
        />
      ) : null}
    </WorkspaceSectionAside>
  );
}
