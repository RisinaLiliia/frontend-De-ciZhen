'use client';

import * as React from 'react';

import { CreateRequestCard } from '@/components/requests/CreateRequestCard';
import { WorkspacePublicDemandMapPanel } from '@/features/workspace/overview';
import { WorkspaceIntroShell } from '@/features/workspace/shell/WorkspaceIntroShell';
import {
  WorkspaceMobileContextSection,
  WorkspaceModeHeader,
} from '@/features/workspace/shell/WorkspaceModeHeader';
import type { WorkspaceTab } from '@/features/workspace/state';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspacePublicCityActivityDto } from '@/lib/api/dto/workspace';
import type { WorkspacePublicSummaryDto } from '@/lib/api/dto/workspace';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

type WorkspacePublicIntroProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  cityActivity: WorkspacePublicCityActivityDto | null | undefined;
  summary?: WorkspacePublicSummaryDto | null;
  isMapLoading?: boolean;
  isMapError?: boolean;
  quickActionHref?: string;
  showQuickAction?: boolean;
  navHeaderSlot?: React.ReactNode;
  leftColumnSlot?: React.ReactNode;
  showDemandMap?: boolean;
  hideDemandMapOnMobile?: boolean;
  preferredRequestsRole?: 'customer' | 'provider' | null;
};

export const WorkspacePublicIntro = React.memo(function WorkspacePublicIntro({
  t,
  locale,
  activePublicSection,
  activeWorkspaceTab,
  cityActivity,
  summary,
  isMapLoading = false,
  isMapError = false,
  quickActionHref = '/request/create',
  showQuickAction = true,
  navHeaderSlot,
  leftColumnSlot,
  showDemandMap = true,
  hideDemandMapOnMobile = true,
  preferredRequestsRole = null,
}: WorkspacePublicIntroProps) {
  const showMarketMap = showDemandMap && Boolean(cityActivity || summary || isMapLoading || isMapError);

  return (
    <WorkspaceIntroShell
      navHeaderSlot={navHeaderSlot}
      header={(
        <WorkspaceModeHeader
          t={t}
          locale={locale}
          activePublicSection={activePublicSection}
          activeWorkspaceTab={activeWorkspaceTab}
          preferredRequestsRole={preferredRequestsRole}
        />
      )}
      mobileContext={(
        <WorkspaceMobileContextSection
          locale={locale}
          activePublicSection={activePublicSection}
          activeWorkspaceTab={activeWorkspaceTab}
          preferredRequestsRole={preferredRequestsRole}
        />
      )}
      leftColumnSlot={leftColumnSlot}
    >
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
    </WorkspaceIntroShell>
  );
});
