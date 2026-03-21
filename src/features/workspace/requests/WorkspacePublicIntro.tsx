'use client';

import * as React from 'react';

import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { PersonalNavSection, type PersonalNavItem } from '@/components/layout/PersonalNavSection';
import { WorkspacePublicDemandMapPanel } from '@/features/workspace/requests/WorkspacePublicDemandMapPanel';
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
}: WorkspacePublicIntroProps) {
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
          <WorkspacePublicDemandMapPanel
            t={t}
            locale={locale}
            cityActivity={cityActivity}
            summary={summary}
            isLoading={isMapLoading}
            isError={isMapError}
          />
        </aside>
      </div>
    </section>
  );
});
