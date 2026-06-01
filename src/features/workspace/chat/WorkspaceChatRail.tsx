'use client';

import { useQuery } from '@tanstack/react-query';

import { workspaceQK } from '@/features/workspace/data';
import {
  WorkspaceSectionAside,
  buildLinkedWorkspaceRailModel,
} from '@/features/workspace/shared';
import { getWorkspaceChat } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';

export function WorkspaceChatRail() {
  const t = useT();
  const { locale } = useI18n();
  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: workspaceQK.chatInbox(),
    queryFn: () => withStatusFallback(() => getWorkspaceChat(), null, [401, 403, 404]),
    retry: false,
    staleTime: 30_000,
  });

  if (!data && !isLoading) {
    return null;
  }

  const model = buildLinkedWorkspaceRailModel({
    locale,
    contextLabel: t(I18N_KEYS.requestsPage.workspaceRailChatContext),
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
        id: item.conversationId,
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
    queueFooterHref: '/workspace?section=chat',
    recommendationsFooterHref: '/workspace?section=chat',
  });

  return <WorkspaceSectionAside model={model} isLoading={isLoading} hideBelowTablet={false} />;
}
