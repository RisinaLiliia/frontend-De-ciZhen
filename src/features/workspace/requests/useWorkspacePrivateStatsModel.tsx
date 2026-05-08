'use client';

import * as React from 'react';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import {
  buildWorkspacePrivateStatsModel,
  type WorkspacePrivateStatsInput,
} from '@/features/workspace/requests/workspacePrivateStats.model';

type Translator = (key: I18nKey) => string;

type Params = {
  t: Translator;
  locale: Locale;
  statsInput: WorkspacePrivateStatsInput;
  chartMonthLabel: Intl.DateTimeFormat;
  formatNumber: Intl.NumberFormat;
};

export function useWorkspacePrivateStatsModel({
  t,
  locale,
  statsInput,
  chartMonthLabel,
  formatNumber,
}: Params) {
  return React.useMemo(
    () =>
      buildWorkspacePrivateStatsModel({
        t,
        locale,
        statsInput,
        chartMonthLabel,
        formatNumber,
      }),
    [chartMonthLabel, formatNumber, locale, statsInput, t],
  );
}
