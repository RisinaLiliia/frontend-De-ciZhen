'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useWorkspaceStatisticsModel } from './stats/useWorkspaceStatisticsModel';
import { WorkspaceStatisticsView } from './stats/WorkspaceStatisticsView';

type WorkspaceStatisticsPanelProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  isWorkspaceAuthed?: boolean;
};

export function WorkspaceStatisticsPanel({
  t,
  locale,
}: WorkspaceStatisticsPanelProps) {
  const model = useWorkspaceStatisticsModel({ locale });
  return (
    <WorkspaceStatisticsView
      t={t}
      locale={locale}
      model={model}
    />
  );
}
