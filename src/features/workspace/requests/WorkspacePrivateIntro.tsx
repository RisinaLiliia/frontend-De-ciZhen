'use client';

import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { PersonalNavSection, type PersonalNavItem } from '@/components/layout/PersonalNavSection';
import { RequestsStatsPanel } from '@/components/requests/RequestsStatsPanel';
import { WorkspaceControlShell } from '@/features/workspace/requests/WorkspaceControlShell';
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
  providerStatsPayload: React.ComponentProps<typeof RequestsStatsPanel>['provider'];
  clientStatsPayload: React.ComponentProps<typeof RequestsStatsPanel>['client'];
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
  statsOrder,
  statsFallbackTitle,
  statsTabsLabel,
  statsErrorLabel,
  providerStatsPayload,
  clientStatsPayload,
  quickActionHref = '/request/create',
  showQuickAction = true,
  leftColumnSlot,
  navHeaderSlot,
}: WorkspacePrivateIntroProps) {
  const preferredStatsTab = statsOrder[0]?.tab ?? 'provider';
  const titleByTab = statsOrder.reduce<Partial<Record<'provider' | 'client', string>>>(
    (acc, section) => {
      acc[section.tab] = section.title;
      return acc;
    },
    {},
  );

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
        <WorkspaceControlShell
          context={leftColumnSlot}
          aside={(
            <RequestsStatsPanel
              title={titleByTab[preferredStatsTab] ?? statsFallbackTitle}
              titleByTab={titleByTab}
              tabsLabel={statsTabsLabel}
              defaultTab={preferredStatsTab}
              preferredTab={preferredStatsTab}
              storageKey="dc_workspace_intro_stats_tab"
              errorLabel={statsErrorLabel}
              provider={providerStatsPayload}
              client={clientStatsPayload}
              surface="embedded"
            />
          )}
        />
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
