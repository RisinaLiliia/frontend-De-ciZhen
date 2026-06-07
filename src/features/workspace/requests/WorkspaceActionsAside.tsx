'use client';

import { useQuery } from '@tanstack/react-query';

import { getWorkspaceActions } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { WorkspaceSectionAside } from '@/features/workspace/requests/components/WorkspaceSectionAside';

type Props = {
  t: (key: I18nKey) => string;
  locale: Locale;
};

export function WorkspaceActionsAside({
  locale,
}: Props) {
  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ['workspace-actions-rail'],
    queryFn: () => withStatusFallback(() => getWorkspaceActions(), null, [401, 403, 404]),
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
      panel={data ? {
        ...data.decisionPanel,
        queue: data.decisionPanel.queue.map((item) => ({
          id: item.actionId,
          title: item.title,
          actionLabel: item.actionLabel,
          actionPriorityLevel: item.actionPriorityLevel,
          actionReason: item.actionReason,
          href: item.href,
        })),
      } : null}
    />
  );
}
