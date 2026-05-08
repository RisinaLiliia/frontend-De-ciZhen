'use client';

import * as React from 'react';

import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { WorkspaceRequestsScope } from '@/features/workspace/requests/workspaceRequestsScope.model';
import {
  buildWorkspacePrivateNavModelArgs,
  resolveWorkspacePreferredRequestsRole,
  buildWorkspacePrivateStatsModelArgs,
  buildWorkspacePrivateTopProvidersArgs,
  shouldBuildWorkspacePrivateTopProviders,
  resolveWorkspacePrivateMeta,
  resolveWorkspacePrivateOverview,
  resolveWorkspacePrivateStateResult,
} from '@/features/workspace/requests/workspacePrivateState.model';
import { resolveWorkspacePrivateStatsInput } from '@/features/workspace/requests/workspacePrivateStats.model';
import { useWorkspacePrivateNavModel } from '@/features/workspace/requests/useWorkspacePrivateNavModel';
import { useWorkspacePrivateStatsModel } from '@/features/workspace/requests/useWorkspacePrivateStatsModel';
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
  workspacePrivateOverview?: WorkspacePrivateOverviewDto | null;
  explicitPreferredRequestsRole?: 'customer' | 'provider' | null;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  markPublicRequestsSeen: () => void;
  guestLoginHref: string;
  onGuestLockedAction: () => void;
  formatNumber: Intl.NumberFormat;
  chartMonthLabel: Intl.DateTimeFormat;
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
  workspacePrivateOverview,
  explicitPreferredRequestsRole = null,
  setWorkspaceTab,
  markPublicRequestsSeen,
  guestLoginHref,
  onGuestLockedAction,
  formatNumber,
  chartMonthLabel,
}: Params) {
  const overview = React.useMemo(
    () => resolveWorkspacePrivateOverview(workspacePrivateOverview),
    [workspacePrivateOverview],
  );
  const { activityProgress, navRatingValue, navReviewsCount } = React.useMemo(
    () => resolveWorkspacePrivateMeta({ overview }),
    [overview],
  );
  const preferredRequestsRole = React.useMemo(
    () => explicitPreferredRequestsRole ?? resolveWorkspacePreferredRequestsRole(overview),
    [explicitPreferredRequestsRole, overview],
  );
  const statsInput = React.useMemo(
    () => resolveWorkspacePrivateStatsInput(overview),
    [overview],
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
      overview,
      navRatingValue,
      navReviewsCount,
      setWorkspaceTab,
      markPublicRequestsSeen,
      guestLoginHref,
      onGuestLockedAction,
    }),
  );

  const stats = useWorkspacePrivateStatsModel(
    buildWorkspacePrivateStatsModelArgs({
      t,
      locale,
      statsInput,
      chartMonthLabel,
      formatNumber,
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
    activityProgress,
    preferredRequestsRole,
    nav,
    stats,
  });
}
