'use client';

import * as React from 'react';

import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import { WorkspaceTopProvidersAside, type WorkspacePrivateIntroProps } from '@/features/workspace/requests';

type Translator = (key: I18nKey) => string;

type WorkspaceAsideBaseProps = Omit<
  React.ComponentProps<typeof WorkspaceTopProvidersAside>,
  'ctaHref' | 'pendingFavoriteProviderIds' | 'onToggleFavorite'
>;

type Args = {
  t: Translator;
  WorkspacePrivateIntroComponent: React.ComponentType<WorkspacePrivateIntroProps>;
  navTitle: string;
  personalNavItems: WorkspacePrivateIntroProps['personalNavItems'];
  insightText: string;
  activityProgress: number;
  statsOrder: WorkspacePrivateIntroProps['statsOrder'];
  providerStatsPayload: WorkspacePrivateIntroProps['providerStatsPayload'];
  clientStatsPayload: WorkspacePrivateIntroProps['clientStatsPayload'];
  createRequestHref: string;
  isProvidersLoading: boolean;
  isProvidersError: boolean;
  topProviders: WorkspaceAsideBaseProps['providers'];
  favoriteProviderIds: WorkspaceAsideBaseProps['favoriteProviderIds'];
};

export function useWorkspacePresentation({
  t,
  WorkspacePrivateIntroComponent,
  navTitle,
  personalNavItems,
  insightText,
  activityProgress,
  statsOrder,
  providerStatsPayload,
  clientStatsPayload,
  createRequestHref,
  isProvidersLoading,
  isProvidersError,
  topProviders,
  favoriteProviderIds,
}: Args) {
  const workspaceIntroNode = React.useMemo(
    () => (
      <WorkspacePrivateIntroComponent
        navTitle={navTitle}
        personalNavItems={personalNavItems}
        insightText={insightText}
        activityProgress={activityProgress}
        statsOrder={statsOrder}
        statsFallbackTitle={t(I18N_KEYS.requestsPage.statsProviderTitle)}
        statsTabsLabel={{
          provider: t(I18N_KEYS.homePublic.howItWorksProviderTab),
          client: t(I18N_KEYS.homePublic.howItWorksClientTab),
        }}
        statsErrorLabel={t(I18N_KEYS.requestsPage.statsLoadError)}
        providerStatsPayload={providerStatsPayload}
        clientStatsPayload={clientStatsPayload}
        quickActionHref={createRequestHref}
      />
    ),
    [
      WorkspacePrivateIntroComponent,
      activityProgress,
      clientStatsPayload,
      createRequestHref,
      navTitle,
      personalNavItems,
      providerStatsPayload,
      statsOrder,
      t,
      insightText,
    ],
  );

  const workspaceAsideBaseProps = React.useMemo<WorkspaceAsideBaseProps>(
    () => ({
      isLoading: isProvidersLoading,
      isError: isProvidersError,
      errorLabel: t(I18N_KEYS.requestsPage.error),
      title: t(I18N_KEYS.homePublic.topProviders),
      subtitle: t(I18N_KEYS.homePublic.topProvidersSubtitle),
      ctaLabel: t(I18N_KEYS.homePublic.topProvidersCta),
      providers: topProviders,
      favoriteProviderIds,
    }),
    [favoriteProviderIds, isProvidersError, isProvidersLoading, t, topProviders],
  );

  return {
    workspaceIntroNode,
    workspaceAsideBaseProps,
  };
}
