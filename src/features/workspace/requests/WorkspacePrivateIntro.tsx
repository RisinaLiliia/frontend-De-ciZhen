'use client';

import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { PersonalNavSection, type PersonalNavItem } from '@/components/layout/PersonalNavSection';
import { RequestsStatsPanel } from '@/components/requests/RequestsStatsPanel';

type StatsOrderItem = {
  tab: 'provider' | 'client';
  title: string;
};

export type WorkspacePrivateIntroProps = {
  navTitle: string;
  navSubtitle: string;
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
  navTitle,
  navSubtitle,
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
    <section className="home-intro-shell">
      <div className="requests-grid requests-grid--balanced">
        <div className="stack-md">
          <PersonalNavSection
            className="personal-nav--left"
            title={navTitle}
            subtitle={navSubtitle}
            headerSlot={navHeaderSlot}
            items={personalNavItems}
            hideDockBadges={hideNavBadges}
            insightText={insightText}
            progressPercent={activityProgress}
          />
          {leftColumnSlot}
          {showQuickAction ? (
            <section className="panel stack-sm" aria-label="Workspace quick action">
              <CreateRequestCard href={quickActionHref} />
            </section>
          ) : null}
        </div>

        <aside className="stack-md hide-mobile">
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
          />
        </aside>
      </div>
    </section>
  );
}
