'use client';

import * as React from 'react';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
import { buildWorkspacePrivateStatsModel } from '@/features/workspace/requests/workspacePrivateStats.model';

type Translator = (key: I18nKey) => string;

type Params = {
  t: Translator;
  locale: Locale;
  overview: WorkspacePrivateOverviewDto;
  chartMonthLabel: Intl.DateTimeFormat;
  formatNumber: Intl.NumberFormat;
};

export function useWorkspacePrivateStatsModel({
  t,
  locale,
  overview,
  chartMonthLabel,
  formatNumber,
}: Params) {
  return React.useMemo(
    () =>
      buildWorkspacePrivateStatsModel({
        t,
        locale,
        overview,
        chartMonthLabel,
        formatNumber,
      }),
    [chartMonthLabel, formatNumber, locale, overview, t],
  );
}
