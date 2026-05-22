'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

import { workspaceQK } from '@/features/workspace/data';
import { getWorkspacePrivateOverview } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceStatisticsRange } from '@/lib/api/dto/workspace';
import { useDecisionDashboardModel } from './useDecisionDashboardModel';
import { WorkspaceStatisticsPanel } from './WorkspaceStatisticsPanel';

export function WorkspaceStatisticsExperience({
  isWorkspaceAuthed,
  t,
  locale,
  slot,
}: {
  isWorkspaceAuthed: boolean;
  t: (key: I18nKey) => string;
  locale: Locale;
  slot: 'content' | 'rail';
}) {
  const searchParams = useSearchParams();
  const privateOverviewPeriod: WorkspaceStatisticsRange = (() => {
    const value = searchParams.get('period') ?? searchParams.get('range');
    return value === '24h' || value === '7d' || value === '90d' ? value : '30d';
  })();
  const {
    data: workspacePrivateOverview,
  } = useQuery({
    queryKey: workspaceQK.workspacePrivateOverview(privateOverviewPeriod),
    enabled: isWorkspaceAuthed,
    queryFn: () => withStatusFallback(() => getWorkspacePrivateOverview({ period: privateOverviewPeriod }), null, [401, 403, 404]),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const model = useDecisionDashboardModel({
    locale,
    privateOverview: isWorkspaceAuthed ? (workspacePrivateOverview ?? null) : null,
  });

  return (
    <div className="workspace-statistics-experience__content">
      <WorkspaceStatisticsPanel
        t={t}
        locale={locale}
        model={model}
        slot={slot}
      />
    </div>
  );
}
