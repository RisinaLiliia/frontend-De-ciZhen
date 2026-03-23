'use client';

import * as React from 'react';

import type { I18nKey } from '@/lib/i18n/keys';
import type { WorkspacePrivateIntroProps } from '@/features/workspace/requests';
import {
  buildWorkspaceAsideBaseProps,
  buildWorkspacePrivateIntroProps,
  type WorkspaceAsideBaseProps,
} from '@/features/workspace/private/workspacePresentation.model';

type Translator = (key: I18nKey) => string;

type Args = {
  t: Translator;
  WorkspacePrivateIntroComponent: React.ComponentType<WorkspacePrivateIntroProps>;
  personalNavItems: WorkspacePrivateIntroProps['personalNavItems'];
  hideNavBadges?: boolean;
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
  showQuickAction?: boolean;
};

export function useWorkspacePresentation({
  t,
  WorkspacePrivateIntroComponent,
  personalNavItems,
  hideNavBadges = false,
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
  showQuickAction = true,
}: Args) {
  const workspaceIntroNode = React.useMemo(
    () => (
      <WorkspacePrivateIntroComponent
        {...buildWorkspacePrivateIntroProps({
          t,
          personalNavItems,
          hideNavBadges,
          insightText,
          activityProgress,
          statsOrder,
          providerStatsPayload,
          clientStatsPayload,
          createRequestHref,
          showQuickAction,
        })}
      />
    ),
    [
      WorkspacePrivateIntroComponent,
      activityProgress,
      clientStatsPayload,
      createRequestHref,
      personalNavItems,
      hideNavBadges,
      providerStatsPayload,
      statsOrder,
      t,
      insightText,
      showQuickAction,
    ],
  );

  const workspaceAsideBaseProps = React.useMemo<WorkspaceAsideBaseProps>(
    () =>
      buildWorkspaceAsideBaseProps({
        t,
        isProvidersLoading,
        isProvidersError,
        topProviders,
        favoriteProviderIds,
      }),
    [favoriteProviderIds, isProvidersError, isProvidersLoading, t, topProviders],
  );

  return {
    workspaceIntroNode,
    workspaceAsideBaseProps,
  };
}
