'use client';

import * as React from 'react';

import type { I18nKey } from '@/lib/i18n/keys';
import type { WorkspacePrivateIntroProps } from '@/features/workspace/requests';
import type { Locale } from '@/lib/i18n/t';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import {
  buildWorkspaceAsideBaseProps,
  buildWorkspacePrivateIntroProps,
  type WorkspaceAsideBaseProps,
} from '@/features/workspace/private/workspacePresentation.model';

type Translator = (key: I18nKey) => string;

type Args = {
  t: Translator;
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
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
  locale,
  activePublicSection,
  activeWorkspaceTab,
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
          locale,
          activePublicSection,
          activeWorkspaceTab,
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
      activePublicSection,
      activeWorkspaceTab,
      clientStatsPayload,
      createRequestHref,
      locale,
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
