'use client';

import * as React from 'react';

import type { OfferDto } from '@/lib/api/dto/offers';
import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { WorkspacePrivateOverviewDto } from '@/lib/api/dto/workspace';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import {
  buildWorkspacePrivateNavModelArgs,
  buildWorkspacePrivateStatsModelArgs,
  buildWorkspacePrivateTopProvidersArgs,
  resolveWorkspacePrivateMeta,
  resolveWorkspacePrivateOverview,
  resolveWorkspacePrivateStateResult,
} from '@/features/workspace/requests/workspacePrivateState.model';
import { useWorkspacePrivateNavModel } from '@/features/workspace/requests/useWorkspacePrivateNavModel';
import { useWorkspacePrivateStatsModel } from '@/features/workspace/requests/useWorkspacePrivateStatsModel';
import { useWorkspacePrivateTopProviders } from '@/features/workspace/requests/useWorkspacePrivateTopProviders';

type Params = {
  t: (key: I18nKey) => string;
  locale: Locale;
  isPersonalized: boolean;
  activeWorkspaceTab: WorkspaceTab;
  activePublicSection?: PublicWorkspaceSection | null;
  userName?: string | null;
  myOffers: OfferDto[];
  providers: ProviderPublicDto[];
  publicRequestsCount: number;
  publicProvidersCount: number;
  publicStatsCount: number;
  workspacePrivateOverview?: WorkspacePrivateOverviewDto | null;
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
  userName,
  myOffers,
  providers,
  publicRequestsCount,
  publicProvidersCount,
  publicStatsCount,
  workspacePrivateOverview,
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
    () => resolveWorkspacePrivateMeta({ overview, myOffers }),
    [myOffers, overview],
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
      overview,
      chartMonthLabel,
      formatNumber,
    }),
  );

  const topProviders = useWorkspacePrivateTopProviders(
    buildWorkspacePrivateTopProvidersArgs({ t, locale, providers }),
  );

  return resolveWorkspacePrivateStateResult({
    topProviders,
    activityProgress,
    nav,
    stats,
  });
}
