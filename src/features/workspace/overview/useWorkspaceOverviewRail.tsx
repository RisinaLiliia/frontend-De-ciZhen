'use client';

import * as React from 'react';

import { useSyncedPanelMinHeight } from '@/hooks/useSyncedPanelMinHeight';
import type { WorkspacePublicCityActivityDto, WorkspacePublicSummaryDto } from '@/lib/api/dto/workspace';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import { WorkspaceContextFocusPanel } from '@/features/workspace/shell/WorkspaceContextFocusPanel';
import type { WorkspaceTab } from '@/features/workspace/state';
import { useWorkspaceStatisticsModel } from '@/features/workspace/stats';

import { WorkspaceOverviewInsightsPanel } from './WorkspaceOverviewInsightsPanel';
import { WorkspacePublicDemandMapPanel } from './WorkspacePublicDemandMapPanel';

type Translator = (key: I18nKey) => string;

type UseWorkspaceOverviewRailParams = {
  isOverviewMode: boolean;
  t: Translator;
  locale: Locale;
  currentSearch: string;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  publicSummaryView: {
    cityActivity: WorkspacePublicCityActivityDto | null | undefined;
    summary?: WorkspacePublicSummaryDto | null;
    isMapLoading?: boolean;
    isMapError?: boolean;
  };
};

export function useWorkspaceOverviewRail({
  isOverviewMode,
  t,
  locale,
  currentSearch,
  activePublicSection,
  activeWorkspaceTab,
  publicSummaryView,
}: UseWorkspaceOverviewRailParams) {
  const heroRef = React.useRef<HTMLDivElement | null>(null);
  const offersPanelRef = React.useRef<HTMLElement | null>(null);
  const focusPanelRef = React.useRef<HTMLElement | null>(null);

  const mapMinHeight = useSyncedPanelMinHeight({
    sourceRef: heroRef,
    mode: 'sourceHeight',
    watchKey: isOverviewMode,
  });
  const insightsMinHeight = useSyncedPanelMinHeight({
    sourceRef: offersPanelRef,
    mode: 'sourceHeight',
    watchKey: isOverviewMode,
  });
  const actionsMinHeight = useSyncedPanelMinHeight({
    sourceRef: focusPanelRef,
    mode: 'sourceHeight',
    watchKey: isOverviewMode,
  });
  const statisticsModel = useWorkspaceStatisticsModel({ locale });

  const topRail = isOverviewMode ? (
    <>
      <WorkspacePublicDemandMapPanel
        t={t}
        locale={locale}
        cityActivity={publicSummaryView.cityActivity}
        summary={publicSummaryView.summary}
        isLoading={publicSummaryView.isMapLoading}
        isError={publicSummaryView.isMapError}
        className="workspace-overview__rail-panel--map"
        onSelectCity={statisticsModel.setCityId}
        style={
          mapMinHeight
            ? { minHeight: `${mapMinHeight}px`, height: `${mapMinHeight}px` }
            : undefined
        }
      />
      <WorkspaceOverviewInsightsPanel
        locale={locale}
        currentSearch={currentSearch}
        statisticsModel={statisticsModel}
        style={
          insightsMinHeight
            ? { minHeight: `${insightsMinHeight}px`, height: `${insightsMinHeight}px` }
            : undefined
        }
      />
    </>
  ) : null;

  const bottomRail = isOverviewMode ? (
    <WorkspaceContextFocusPanel
      t={t}
      locale={locale}
      activePublicSection={activePublicSection}
      activeWorkspaceTab={activeWorkspaceTab}
    />
  ) : null;

  return {
    statisticsModel,
    heroRef,
    offersPanelRef,
    focusPanelRef,
    actionsStyle: actionsMinHeight ? { minHeight: `${actionsMinHeight}px` } : undefined,
    asideTopSlot: topRail,
    mobileRail: {
      top: topRail,
      bottom: bottomRail,
    },
  };
}
