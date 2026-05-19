'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useDecisionDashboardModel } from '@/features/workspace/stats/useDecisionDashboardModel';
import { WorkspaceStatisticsView } from '@/features/workspace/stats/WorkspaceStatisticsView';
import type { WorkspaceStatisticsModel } from '@/features/workspace/stats';

type WorkspaceStatisticsPanelProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  model?: WorkspaceStatisticsModel;
};

export function WorkspaceStatisticsPanel({
  t,
  locale,
  model: providedModel,
}: WorkspaceStatisticsPanelProps) {
  if (providedModel) {
    return (
      <WorkspaceStatisticsView
        t={t}
        locale={locale}
        model={providedModel}
      />
    );
  }

  return <WorkspaceStatisticsPanelWithModel t={t} locale={locale} />;
}

function WorkspaceStatisticsPanelWithModel({
  t,
  locale,
}: Omit<WorkspaceStatisticsPanelProps, 'model'>) {
  const model = useDecisionDashboardModel({ locale });
  return (
    <WorkspaceStatisticsView
      t={t}
      locale={locale}
      model={model}
    />
  );
}
