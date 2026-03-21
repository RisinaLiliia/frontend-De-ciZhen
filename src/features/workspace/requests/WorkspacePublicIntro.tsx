'use client';

import * as React from 'react';

import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { PersonalNavSection, type PersonalNavItem } from '@/components/layout/PersonalNavSection';
import { WorkspacePublicDemandMapPanel } from '@/features/workspace/requests/WorkspacePublicDemandMapPanel';
import { WorkspaceMobileSectionSheet } from '@/features/workspace/requests/WorkspaceMobileSectionSheet';
import type { WorkspacePublicCityActivityDto } from '@/lib/api/dto/workspace';
import type { WorkspacePublicSummaryDto } from '@/lib/api/dto/workspace';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type WorkspacePublicIntroProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  personalNavItems: PersonalNavItem[];
  hideNavBadges?: boolean;
  insightText: string;
  activityProgress: number;
  cityActivity: WorkspacePublicCityActivityDto | null | undefined;
  summary?: WorkspacePublicSummaryDto | null;
  isMapLoading?: boolean;
  isMapError?: boolean;
  quickActionHref?: string;
  showQuickAction?: boolean;
  leftColumnSlot?: React.ReactNode;
  navHeaderSlot?: React.ReactNode;
  showDemandMap?: boolean;
  hideDemandMapOnMobile?: boolean;
};

export const WorkspacePublicIntro = React.memo(function WorkspacePublicIntro({
  t,
  locale,
  personalNavItems,
  hideNavBadges = false,
  insightText,
  activityProgress,
  cityActivity,
  summary,
  isMapLoading = false,
  isMapError = false,
  quickActionHref = '/request/create',
  showQuickAction = true,
  leftColumnSlot,
  navHeaderSlot,
  showDemandMap = true,
  hideDemandMapOnMobile = true,
}: WorkspacePublicIntroProps) {
  const showMarketMap = showDemandMap && Boolean(cityActivity || summary || isMapLoading || isMapError);

  return (
    <section className="home-intro-shell">
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
        {leftColumnSlot ? leftColumnSlot : null}
        <WorkspaceMobileSectionSheet items={personalNavItems} />
        {showMarketMap ? (
          <div className={hideDemandMapOnMobile ? 'workspace-intro__mobile-hidden' : undefined}>
            <WorkspacePublicDemandMapPanel
              t={t}
              locale={locale}
              cityActivity={cityActivity}
              summary={summary}
              isLoading={isMapLoading}
              isError={isMapError}
            />
          </div>
        ) : null}
        {showQuickAction ? (
          <section className="panel stack-sm workspace-intro__mobile-hidden" aria-label="Workspace quick action">
            <CreateRequestCard href={quickActionHref} />
          </section>
        ) : null}
      </div>
    </section>
  );
});
