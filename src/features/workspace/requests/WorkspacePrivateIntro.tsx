'use client';

import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
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
};

export function WorkspacePrivateIntro({
  locale,
  activePublicSection,
  activeWorkspaceTab,
  personalNavItems,
  hideNavBadges = false,
  insightText,
  activityProgress,
  quickActionHref = '/request/create',
  showQuickAction = true,
  leftColumnSlot,
  navHeaderSlot,
}: WorkspacePrivateIntroProps) {
  return (
    <section className="workspace-intro-shell">
      <div className="stack-md">
        <PersonalNavSection
          className="personal-nav--left"
          headerSlot={navHeaderSlot}
          items={personalNavItems}
          hideDockBadges={hideNavBadges}
          insightText={insightText}
          progressPercent={activityProgress}
          surface="embedded"
        />
        <WorkspaceMobileContextSection
          locale={locale}
          activePublicSection={activePublicSection}
          activeWorkspaceTab={activeWorkspaceTab}
        />
        {leftColumnSlot ? leftColumnSlot : null}
        <WorkspaceMobileSectionSheet
          locale={locale}
          activePublicSection={activePublicSection}
          activeWorkspaceTab={activeWorkspaceTab}
        />
        {showQuickAction ? (
          <section className="panel stack-sm workspace-intro__mobile-hidden" aria-label="Workspace quick action">
            <CreateRequestCard href={quickActionHref} />
          </section>
        ) : null}
      </div>
    </section>
  );
}
