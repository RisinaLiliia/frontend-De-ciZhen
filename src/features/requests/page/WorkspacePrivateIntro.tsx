'use client';

import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { PersonalNavSection, type PersonalNavItem } from '@/components/layout/PersonalNavSection';
import { RequestsStatsPanel } from '@/components/requests/RequestsStatsPanel';

type StatsOrderItem = {
  tab: 'provider' | 'client';
  title: string;
};

type WorkspacePrivateIntroProps = {
  navTitle: string;
  personalNavItems: PersonalNavItem[];
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
};

export function WorkspacePrivateIntro({
  navTitle,
  personalNavItems,
  insightText,
  activityProgress,
  statsOrder,
  statsFallbackTitle,
  statsTabsLabel,
  statsErrorLabel,
  providerStatsPayload,
  clientStatsPayload,
  quickActionHref = '/request/create',
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
            items={personalNavItems}
            insightText={insightText}
            progressPercent={activityProgress}
          />
          <section className="panel stack-sm" aria-label="Workspace quick action">
            <CreateRequestCard href={quickActionHref} />
          </section>
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
