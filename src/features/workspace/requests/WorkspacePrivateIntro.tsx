'use client';

import { PersonalNavSection, type PersonalNavItem } from '@/components/layout/PersonalNavSection';
import type { TabPayload } from '@/components/requests/requestsStatsPanel.types';
import { WorkspaceMobileSectionSheet } from '@/features/workspace/requests/WorkspaceMobileSectionSheet';
import { WorkspaceMobileContextSection } from '@/features/workspace/shell/WorkspaceEnvironmentChrome';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { Locale } from '@/lib/i18n/t';

type StatsOrderItem = {
  tab: 'provider' | 'client';
  title: string;
};

export type WorkspacePrivateIntroProps = {
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  personalNavItems: PersonalNavItem[];
  hideNavBadges?: boolean;
  insightText: string;
  activityProgress: number;
  statsOrder: StatsOrderItem[];
  statsFallbackTitle: string;
  statsTabsLabel: {
    provider: string;
    client: string;
  };
  statsErrorLabel: string;
  providerStatsPayload: TabPayload;
  clientStatsPayload: TabPayload;
  quickActionHref?: string;
  showQuickAction?: boolean;
  leftColumnSlot?: React.ReactNode;
  navHeaderSlot?: React.ReactNode;
  preferredRequestsRole?: 'customer' | 'provider' | null;
};

export function WorkspacePrivateIntro({
  locale,
  activePublicSection,
  activeWorkspaceTab,
  personalNavItems,
  hideNavBadges = false,
  quickActionHref = '/request/create',
  showQuickAction = true,
  leftColumnSlot,
  navHeaderSlot,
  preferredRequestsRole = null,
}: WorkspacePrivateIntroProps) {
  void quickActionHref;
  void showQuickAction;

  return (
    <section className="workspace-intro-shell">
      <div className="stack-md">
        <PersonalNavSection
          className="personal-nav--left"
          headerSlot={navHeaderSlot}
          headerPlacement="after"
          items={personalNavItems}
          hideDockBadges={hideNavBadges}
          surface="embedded"
        />
        <WorkspaceMobileContextSection
          locale={locale}
          activePublicSection={activePublicSection}
          activeWorkspaceTab={activeWorkspaceTab}
          preferredRequestsRole={preferredRequestsRole}
        />
        {leftColumnSlot ? leftColumnSlot : null}
        <WorkspaceMobileSectionSheet
          locale={locale}
          activePublicSection={activePublicSection}
          activeWorkspaceTab={activeWorkspaceTab}
          preferredRequestsRole={preferredRequestsRole}
        />
      </div>
    </section>
  );
}
