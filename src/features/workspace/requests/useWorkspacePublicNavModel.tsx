'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import { useWorkspaceNavModel } from '@/features/workspace/requests/useWorkspaceNavModel';

type Translator = (key: I18nKey) => string;

type Params = {
  t: Translator;
  formatNumber: Intl.NumberFormat;
  isPersonalized: boolean;
  activeWorkspaceTab: WorkspaceTab;
  activePublicSection: PublicWorkspaceSection | null;
  userName?: string | null;
  publicRequestsCount: number;
  publicProvidersCount: number;
  publicStatsCount: number;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  markPublicRequestsSeen: () => void;
  guestLoginHref: string;
  onGuestLockedAction: () => void;
};

export function useWorkspacePublicNavModel({
  t,
  formatNumber,
  isPersonalized,
  activeWorkspaceTab,
  activePublicSection,
  userName,
  publicRequestsCount,
  publicProvidersCount,
  publicStatsCount,
  setWorkspaceTab,
  markPublicRequestsSeen,
  guestLoginHref,
  onGuestLockedAction,
}: Params) {
  return useWorkspaceNavModel({
    t,
    formatNumber,
    isPersonalized,
    activeWorkspaceTab,
    activePublicSection,
    userName,
    publicRequestsCount,
    publicProvidersCount,
    publicStatsCount,
    myRequestsTotal: 0,
    sentCount: 0,
    completedJobsCount: 0,
    favoriteRequestCount: 0,
    markPublicRequestsSeen,
    setWorkspaceTab,
    guestLoginHref,
    onGuestLockedAction,
    includeCompletedJobsInSecondary: true,
  });
}
