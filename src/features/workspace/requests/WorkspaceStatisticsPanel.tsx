'use client';

import type { RequestsStatsPanelProps } from '@/components/requests/requestsStatsPanel.types';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useDecisionDashboardModel } from './stats/useDecisionDashboardModel';
import { WorkspaceStatisticsView } from './stats/WorkspaceStatisticsView';
import type { WorkspaceStatisticsModel } from './stats/workspaceStatistics.model';

export type WorkspaceStatisticsPrivateStatsPanelProps = Pick<
  RequestsStatsPanelProps,
  | 'title'
  | 'titleByTab'
  | 'tabsLabel'
  | 'defaultTab'
  | 'preferredTab'
  | 'storageKey'
  | 'errorLabel'
  | 'provider'
  | 'client'
>;

type WorkspaceStatisticsPanelProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  model?: WorkspaceStatisticsModel;
  privateStatsPanel?: WorkspaceStatisticsPrivateStatsPanelProps | null;
};

export function WorkspaceStatisticsPanel({
  t,
  locale,
  model: providedModel,
  privateStatsPanel = null,
}: WorkspaceStatisticsPanelProps) {
  if (providedModel) {
    return (
      <WorkspaceStatisticsView
        t={t}
        locale={locale}
        model={providedModel}
        privateStatsPanel={privateStatsPanel}
      />
    );
  }

  return <WorkspaceStatisticsPanelWithModel t={t} locale={locale} privateStatsPanel={privateStatsPanel} />;
}

function WorkspaceStatisticsPanelWithModel({
  t,
  locale,
  privateStatsPanel = null,
}: Omit<WorkspaceStatisticsPanelProps, 'model'>) {
  const model = useDecisionDashboardModel({ locale });
  return (
    <WorkspaceStatisticsView
      t={t}
      locale={locale}
      model={model}
      privateStatsPanel={privateStatsPanel}
    />
  );
}
