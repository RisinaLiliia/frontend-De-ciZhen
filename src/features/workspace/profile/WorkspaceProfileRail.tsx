'use client';

import { useQuery } from '@tanstack/react-query';

import {
  WorkspaceSectionAside,
  buildLinkedWorkspaceRailModel,
} from '@/features/workspace/shared';
import { getWorkspaceActions } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import type { I18nKey } from '@/lib/i18n/keys';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type WorkspaceProfileRailProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
};

export function WorkspaceProfileRail({
  t,
  locale,
}: WorkspaceProfileRailProps) {
  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ['workspace-profile-rail'],
    queryFn: () => withStatusFallback(() => getWorkspaceActions(), null, [401, 403, 404]),
    retry: false,
    staleTime: 60_000,
  });

  if (!data && !isLoading) {
    return null;
  }

  const model = buildLinkedWorkspaceRailModel({
    locale,
    contextLabel: t(I18N_KEYS.requestsPage.workspaceRailProfileContext),
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
        id: item.actionId,
        title: item.title,
        actionLabel: item.actionLabel,
        actionPriorityLevel: item.actionPriorityLevel,
        actionReason: item.actionReason,
        action: {
          kind: 'link',
          href: item.href,
          label: item.title,
        },
      })),
      emptyText: data.decisionPanel.emptyText,
      overview: data.decisionPanel.overview,
    } : null,
    queueFooterHref: '/workspace?section=profile',
  });

  return (
    <WorkspaceSectionAside
      className="workspace-profile-rail"
      model={model}
      isLoading={isLoading}
    />
  );
}
