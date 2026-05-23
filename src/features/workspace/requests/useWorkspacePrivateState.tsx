'use client';

import * as React from 'react';

import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceTab } from '@/features/workspace/state';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceRequestsScope } from '@/features/workspace/state';
import {
  buildWorkspacePrivateNavModelArgs,
  buildWorkspacePrivateTopProvidersArgs,
  shouldBuildWorkspacePrivateTopProviders,
  resolveWorkspacePrivateStateResult,
  type WorkspacePrivateOverviewState,
} from '@/features/workspace/requests/workspacePrivateState.model';
import { useWorkspacePrivateNavModel } from '@/features/workspace/navigation/useWorkspacePrivateNavModel';
import { useWorkspacePrivateTopProviders } from '@/features/workspace/requests/useWorkspacePrivateTopProviders';

type Params = {
  t: (key: I18nKey) => string;
  locale: Locale;
  isPersonalized: boolean;
  activeWorkspaceTab: WorkspaceTab;
  activePublicSection?: PublicWorkspaceSection | null;
  requestsScope?: WorkspaceRequestsScope;
  userName?: string | null;
  providers: ProviderPublicDto[];
  publicRequestsCount: number;
  publicProvidersCount: number;
  publicStatsCount: number;
  privateOverviewState?: WorkspacePrivateOverviewState | null;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  markPublicRequestsSeen: () => void;
  guestLoginHref: string;
  onGuestLockedAction: () => void;
  formatNumber: Intl.NumberFormat;
};

export function useWorkspacePrivateState({
  t,
  locale,
  isPersonalized,
  activeWorkspaceTab,
  activePublicSection = null,
  requestsScope = 'market',
  userName,
  providers,
  publicRequestsCount,
  publicProvidersCount,
  publicStatsCount,
  privateOverviewState = null,
  setWorkspaceTab,
  markPublicRequestsSeen,
  guestLoginHref,
  onGuestLockedAction,
  formatNumber,
}: Params) {
  const resolvedPrivateOverviewState = React.useMemo<WorkspacePrivateOverviewState>(
    () =>
      privateOverviewState ?? {
        activityProgress: 0,
        navRatingValue: '0.0',
        navReviewsCount: 0,
        preferredRequestsRole: null,
        myRequestsTotal: 0,
        sentCount: 0,
        completedJobsCount: 0,
        favoriteRequestCount: 0,
      },
    [privateOverviewState],
  );

  const nav = useWorkspacePrivateNavModel(
    buildWorkspacePrivateNavModelArgs({
      t,
      formatNumber,
      isPersonalized,
      activeWorkspaceTab,
      activePublicSection,
      userName,
      publicRequestsCount,
      publicProvidersCount,
      publicStatsCount,
      privateOverviewState: resolvedPrivateOverviewState,
      setWorkspaceTab,
      markPublicRequestsSeen,
      guestLoginHref,
      onGuestLockedAction,
    }),
  );

  const topProviders = useWorkspacePrivateTopProviders(
    buildWorkspacePrivateTopProvidersArgs({
      t,
      locale,
      providers: shouldBuildWorkspacePrivateTopProviders({
        activePublicSection,
        requestsScope,
      })
        ? providers
        : [],
    }),
  );

  return resolveWorkspacePrivateStateResult({
    topProviders,
    privateOverviewState: resolvedPrivateOverviewState,
    nav,
  });
}
