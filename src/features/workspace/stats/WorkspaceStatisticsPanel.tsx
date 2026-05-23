'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useDecisionDashboardModel } from './useDecisionDashboardModel';
import { WorkspaceStatisticsView } from './WorkspaceStatisticsView';
import type { WorkspaceStatisticsModel } from './statistics.model';

type WorkspaceStatisticsPanelProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  model?: WorkspaceStatisticsModel;
  slot?: 'full' | 'content' | 'rail';
};

export function WorkspaceStatisticsPanel({
  t,
  locale,
  model: providedModel,
  slot = 'full',
}: WorkspaceStatisticsPanelProps) {
  if (providedModel) {
    return (
      <WorkspaceStatisticsView
        t={t}
        locale={locale}
        model={providedModel}
        slot={slot}
      />
    );
  }

  return <WorkspaceStatisticsPanelWithModel t={t} locale={locale} slot={slot} />;
}

function WorkspaceStatisticsPanelWithModel({
  t,
  locale,
  slot = 'full',
}: Omit<WorkspaceStatisticsPanelProps, 'model'>) {
  const model = useDecisionDashboardModel({ locale });
  return (
    <WorkspaceStatisticsView
      t={t}
      locale={locale}
      model={model}
      slot={slot}
    />
  );
}
