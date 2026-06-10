'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { useDecisionDashboardModel } from './useStatisticsDashboard';
import { StatisticsView } from './StatisticsView';
import type { WorkspaceStatisticsModel } from './statistics.model';

type StatisticsPanelProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  model?: WorkspaceStatisticsModel;
  slot?: 'full' | 'content' | 'rail';
};

export function StatisticsPanel({
  t,
  locale,
  model: providedModel,
  slot = 'full',
}: StatisticsPanelProps) {
  if (providedModel) {
    return <StatisticsView t={t} locale={locale} model={providedModel} slot={slot} />;
  }

  return <StatisticsPanelWithModel t={t} locale={locale} slot={slot} />;
}

function StatisticsPanelWithModel({
  t,
  locale,
  slot = 'full',
}: Omit<StatisticsPanelProps, 'model'>) {
  const model = useDecisionDashboardModel({ locale });
  return <StatisticsView t={t} locale={locale} model={model} slot={slot} />;
}
