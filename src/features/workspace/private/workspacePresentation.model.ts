'use client';

import type { ComponentProps } from 'react';

import { WorkspaceTopProvidersAside, type WorkspacePrivateIntroProps } from '@/features/workspace/requests';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';

type Translator = (key: I18nKey) => string;

export type WorkspaceAsideBaseProps = Omit<
  ComponentProps<typeof WorkspaceTopProvidersAside>,
  'ctaHref' | 'pendingFavoriteProviderIds' | 'onToggleFavorite'
>;

type BuildWorkspacePrivateIntroPropsArgs = {
  t: Translator;
  personalNavItems: WorkspacePrivateIntroProps['personalNavItems'];
  hideNavBadges?: boolean;
  insightText: string;
  activityProgress: number;
  statsOrder: WorkspacePrivateIntroProps['statsOrder'];
  providerStatsPayload: WorkspacePrivateIntroProps['providerStatsPayload'];
  clientStatsPayload: WorkspacePrivateIntroProps['clientStatsPayload'];
  createRequestHref: string;
  showQuickAction?: boolean;
};

type BuildWorkspaceAsideBasePropsArgs = {
  t: Translator;
  isProvidersLoading: boolean;
  isProvidersError: boolean;
  topProviders: WorkspaceAsideBaseProps['providers'];
  favoriteProviderIds: WorkspaceAsideBaseProps['favoriteProviderIds'];
};

export function buildWorkspacePrivateIntroProps({
  t,
  personalNavItems,
  hideNavBadges = false,
  insightText,
  activityProgress,
  statsOrder,
  providerStatsPayload,
  clientStatsPayload,
  createRequestHref,
  showQuickAction = true,
}: BuildWorkspacePrivateIntroPropsArgs): WorkspacePrivateIntroProps {
  return {
    personalNavItems,
    hideNavBadges,
    insightText,
    activityProgress,
    statsOrder,
    statsFallbackTitle: t(I18N_KEYS.requestsPage.statsProviderTitle),
    statsTabsLabel: {
      provider: t(I18N_KEYS.homePublic.howItWorksProviderTab),
      client: t(I18N_KEYS.homePublic.howItWorksClientTab),
    },
    statsErrorLabel: t(I18N_KEYS.requestsPage.statsLoadError),
    providerStatsPayload,
    clientStatsPayload,
    quickActionHref: createRequestHref,
    showQuickAction,
  };
}

export function buildWorkspaceAsideBaseProps({
  t,
  isProvidersLoading,
  isProvidersError,
  topProviders,
  favoriteProviderIds,
}: BuildWorkspaceAsideBasePropsArgs): WorkspaceAsideBaseProps {
  return {
    isLoading: isProvidersLoading,
    isError: isProvidersError,
    errorLabel: t(I18N_KEYS.requestsPage.error),
    title: t(I18N_KEYS.homePublic.topProviders),
    subtitle: t(I18N_KEYS.homePublic.topProvidersSubtitle),
    ctaLabel: t(I18N_KEYS.homePublic.topProvidersCta),
    providers: topProviders,
    favoriteProviderIds,
  };
}
