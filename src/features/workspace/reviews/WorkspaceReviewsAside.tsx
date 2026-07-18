'use client';

import { useQuery } from '@tanstack/react-query';

import { workspaceQK } from '@/features/workspace/data';
import { getWorkspaceReviews } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import {
  WorkspaceSectionAside,
  buildLinkedWorkspaceRailModel,
} from '@/features/workspace/shared';
import { WorkspaceReviewsComposer } from '@/features/workspace/reviews/WorkspaceReviewsComposer';
import { useWorkspaceReviewControlsState } from '@/features/workspace/reviews/useWorkspaceReviewControlsState';
import { I18N_KEYS } from '@/lib/i18n/keys';

type Props = {
  t: (key: I18nKey) => string;
  locale: Locale;
  hideBelowTablet?: boolean;
};

export function WorkspaceReviewsAside({
  t,
  locale,
  hideBelowTablet = true,
}: Props) {
  const { reviewSort, reviewRange } = useWorkspaceReviewControlsState();
  const sort = reviewSort === 'top' ? 'rating_desc' : 'created_desc';

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: workspaceQK.workspaceReviewsOverview({
      range: reviewRange,
      sort,
    }),
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

  const model = buildLinkedWorkspaceRailModel({
    locale,
    contextLabel: t(I18N_KEYS.requestsPage.workspaceRailReviewsContext),
    summaryItems: data?.summary.items ?? null,
    panel: data ? {
      eyebrow: data.decisionPanel.eyebrow,
      totalValue: data.decisionPanel.totalNeedsAction,
      title: data.decisionPanel.title,
      text: data.decisionPanel.text,
      visualization: 'none',
      primaryAction: {
        kind: 'link',
        label: data.decisionPanel.primaryAction.label,
        href: data.decisionPanel.primaryAction.href,
      },
      queueTitle: data.decisionPanel.queueTitle,
      queue: data.decisionPanel.queue.map((item) => ({
        id: item.reviewId,
        title: item.title,
        actionLabel: item.actionLabel,
        actionPriorityLevel: item.actionPriorityLevel,
        action: {
          kind: 'link',
          href: item.href,
          label: item.title,
        },
      })),
      emptyText: data.decisionPanel.emptyText,
      overview: data.decisionPanel.overview,
    } : null,
    queueFooterHref: '/workspace?section=profile&tab=reviews',
  });

  return (
    <WorkspaceSectionAside
      model={model}
      isLoading={isLoading}
      hideBelowTablet={hideBelowTablet}
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
