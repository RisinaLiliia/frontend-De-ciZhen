'use client';

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
  personalNavItems: PersonalNavItem[];
  insightText: string;
  activityProgress: number;
  cityActivity: WorkspacePublicCityActivityDto | null | undefined;
  summary?: WorkspacePublicSummaryDto | null;
  quickActionHref?: string;
};

export function WorkspacePublicIntro({
  t,
  locale,
  navTitle,
  personalNavItems,
  insightText,
  activityProgress,
  cityActivity,
  summary,
  quickActionHref = '/request/create',
}: WorkspacePublicIntroProps) {
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
          <WorkspacePublicDemandMapPanel
            t={t}
            locale={locale}
            cityActivity={cityActivity}
            summary={summary}
          />
        </aside>
      </div>
    </section>
  );
}
