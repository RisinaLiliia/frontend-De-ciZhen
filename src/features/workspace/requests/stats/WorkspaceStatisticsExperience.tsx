'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { EMPTY_WORKSPACE_PRIVATE_OVERVIEW } from '@/features/workspace/requests/workspacePrivateState.constants';
import { buildWorkspacePrivateStatsModel } from '@/features/workspace/requests/workspacePrivateStats.model';
import { workspaceQK } from '@/features/workspace/requests/queryKeys';
import { getWorkspacePrivateOverview } from '@/lib/api/workspace';
import { withStatusFallback } from '@/lib/api/withStatusFallback';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { WorkspaceOverlaySurface } from '../WorkspaceOverlaySurface';
import { useDecisionDashboardModel } from './useDecisionDashboardModel';
import { WorkspaceStatisticsPanel, type WorkspaceStatisticsPrivateStatsPanelProps } from '../WorkspaceStatisticsPanel';
import type { WorkspacePrivateIntroProps } from '../WorkspacePrivateIntro';

function resolvePrivateStatsPanel(
  intro: React.ReactNode,
): WorkspaceStatisticsPrivateStatsPanelProps | null {
  if (!React.isValidElement<Partial<WorkspacePrivateIntroProps>>(intro)) {
    return null;
  }

  const {
    statsOrder,
    statsFallbackTitle,
    statsTabsLabel,
    statsErrorLabel,
    providerStatsPayload,
    clientStatsPayload,
  } = intro.props;

  if (!statsTabsLabel || !providerStatsPayload || !clientStatsPayload) {
    return null;
  }

  const preferredTab = statsOrder?.[0]?.tab ?? 'provider';
  const titleByTab = (statsOrder ?? []).reduce<Partial<Record<'provider' | 'client', string>>>(
    (acc, section) => {
      acc[section.tab] = section.title;
      return acc;
    },
    {},
  );

  return {
    title: titleByTab[preferredTab] ?? statsFallbackTitle ?? '',
    titleByTab,
    tabsLabel: statsTabsLabel,
    defaultTab: preferredTab,
    preferredTab,
    storageKey: 'dc_workspace_statistics_rail_tab',
    errorLabel: statsErrorLabel,
    provider: providerStatsPayload,
    client: clientStatsPayload,
  };
}

export function WorkspaceStatisticsExperience({
  intro,
  isWorkspaceAuthed,
  t,
  locale,
}: {
  intro: React.ReactNode;
  isWorkspaceAuthed: boolean;
  t: (key: I18nKey) => string;
  locale: Locale;
}) {
  const privateStatsPanelFromIntro = React.useMemo(() => resolvePrivateStatsPanel(intro), [intro]);
  const formatNumber = React.useMemo(
    () => new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US'),
    [locale],
  );
  const chartMonthLabel = React.useMemo(
    () => new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-US', { month: 'short' }),
    [locale],
  );
  const {
    data: workspacePrivateOverview,
    isLoading: isPrivateOverviewLoading,
    isError: isPrivateOverviewError,
  } = useQuery({
    queryKey: workspaceQK.workspacePrivateOverview(),
    enabled: isWorkspaceAuthed,
    queryFn: () => withStatusFallback(() => getWorkspacePrivateOverview(), null, [401, 403, 404]),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const model = useDecisionDashboardModel({
    locale,
    privateOverview: isWorkspaceAuthed ? (workspacePrivateOverview ?? null) : null,
  });
  const privateStatsPanelFromQuery = React.useMemo<WorkspaceStatisticsPrivateStatsPanelProps | null>(() => {
    if (!isWorkspaceAuthed || privateStatsPanelFromIntro) {
      return null;
    }

    const stats = buildWorkspacePrivateStatsModel({
      t,
      locale,
      overview: workspacePrivateOverview ?? EMPTY_WORKSPACE_PRIVATE_OVERVIEW,
      chartMonthLabel,
      formatNumber,
    });
    const preferredTab = stats.statsOrder[0]?.tab ?? 'provider';
    const titleByTab = stats.statsOrder.reduce<Partial<Record<'provider' | 'client', string>>>(
      (acc, section) => {
        acc[section.tab] = section.title;
        return acc;
      },
      {},
    );

    return {
      title: titleByTab[preferredTab] ?? t(I18N_KEYS.requestsPage.statsProviderTitle),
      titleByTab,
      tabsLabel: {
        provider: t(I18N_KEYS.homePublic.howItWorksProviderTab),
        client: t(I18N_KEYS.homePublic.howItWorksClientTab),
      },
      defaultTab: preferredTab,
      preferredTab,
      storageKey: 'dc_workspace_statistics_rail_tab',
      errorLabel: t(I18N_KEYS.requestsPage.statsLoadError),
      provider: stats.providerStatsPayload,
      client: stats.clientStatsPayload,
      loading: isPrivateOverviewLoading,
      error: isPrivateOverviewError,
    };
  }, [
    chartMonthLabel,
    formatNumber,
    isPrivateOverviewError,
    isPrivateOverviewLoading,
    isWorkspaceAuthed,
    locale,
    privateStatsPanelFromIntro,
    t,
    workspacePrivateOverview,
  ]);
  const privateStatsPanel = privateStatsPanelFromIntro ?? privateStatsPanelFromQuery;

  const overlayIntro = React.useCallback(() => {
    if (!React.isValidElement(intro)) {
      return intro;
    }

    return React.cloneElement(
      intro as React.ReactElement<{
        showDemandMap?: boolean;
      }>,
      {
        showDemandMap: false,
      },
    );
  }, [intro]);

  return (
    <WorkspaceOverlaySurface intro={overlayIntro()}>
      <div className="workspace-statistics-experience__content">
        <WorkspaceStatisticsPanel
          t={t}
          locale={locale}
          model={model}
          privateStatsPanel={privateStatsPanel}
        />
      </div>
    </WorkspaceOverlaySurface>
  );
}
