'use client';

import * as React from 'react';

import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { PersonalNavSection, type PersonalNavItem } from '@/components/layout/PersonalNavSection';
import { WorkspacePublicDemandMapPanel } from '@/features/workspace/requests/WorkspacePublicDemandMapPanel';
import { WorkspaceControlShell } from '@/features/workspace/requests/WorkspaceControlShell';
import type { WorkspacePublicCityActivityDto } from '@/lib/api/dto/workspace';
import type { WorkspacePublicSummaryDto } from '@/lib/api/dto/workspace';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type WorkspacePublicIntroProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  navTitle: string;
  navSubtitle: string;
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
  controlShellLabel?: string;
  controlShellSummary?: string;
  showDemandMap?: boolean;
};

export const WorkspacePublicIntro = React.memo(function WorkspacePublicIntro({
  t,
  locale,
  navTitle,
  navSubtitle,
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
  controlShellLabel,
  controlShellSummary,
  showDemandMap = true,
}: WorkspacePublicIntroProps) {
  const showMarketMap = showDemandMap && Boolean(cityActivity || summary || isMapLoading || isMapError);

  return (
    <section className="home-intro-shell">
      <div className="stack-md">
        <WorkspaceControlShell
          label={controlShellLabel ?? navTitle}
          summary={controlShellSummary ?? navSubtitle}
          navigation={(
            <PersonalNavSection
              className="personal-nav--left"
              headerSlot={navHeaderSlot}
              items={personalNavItems}
              hideDockBadges={hideNavBadges}
              insightText={insightText}
              progressPercent={activityProgress}
              surface="embedded"
            />
          )}
          context={leftColumnSlot}
        />
        {showMarketMap ? (
          <WorkspacePublicDemandMapPanel
            t={t}
            locale={locale}
            cityActivity={cityActivity}
            summary={summary}
            isLoading={isMapLoading}
            isError={isMapError}
          />
        ) : null}
        {showQuickAction ? (
          <section className="panel stack-sm" aria-label="Workspace quick action">
            <CreateRequestCard href={quickActionHref} />
          </section>
        ) : null}
      </div>
    </section>
  );
});
