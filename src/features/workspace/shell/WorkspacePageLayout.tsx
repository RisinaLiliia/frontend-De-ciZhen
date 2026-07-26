'use client';

import * as React from 'react';
import {
  resolveWorkspacePublicIntroDecorations,
  type WorkspaceSectionKey,
} from '@/features/workspace/navigation/workspaceSection.contract';
import {
  WorkspaceContextRail,
  useIsDesktop,
  useMediaMatch,
  useWorkspaceWideShell,
} from '@/features/workspace/shared';
import { WorkspaceTopProvidersAside } from '@/features/workspace/providers';
import type { WorkspaceTab } from '@/features/workspace/state';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import { WorkspaceMobileNavigation } from '@/features/workspace/shell/WorkspaceMobileNavigation';
import { WorkspaceSectionSharedContext } from '@/features/workspace/shell/WorkspaceSectionSharedContext';
import { WorkspaceShell } from '@/features/workspace/shell/WorkspaceShell';
import { WorkspaceSidebar } from '@/features/workspace/shell/WorkspaceSidebar';
import { WorkspaceTopBar } from '@/features/workspace/shell/WorkspaceTopBar';
import { ConsentManageFooter } from '@/components/legal/ConsentManageFooter';
import type { WorkspaceSectionRenderModel } from '@/features/workspace/shell/WorkspaceShell.types';

type Translator = (key: I18nKey) => string;

type WorkspaceAsideBaseProps = Omit<
  React.ComponentProps<typeof WorkspaceTopProvidersAside>,
  'ctaHref' | 'pendingFavoriteProviderIds' | 'onToggleFavorite'
>;

type Props = {
  isWorkspacePublicSection: boolean;
  isWorkspaceAuthed: boolean;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  preferredRequestsRole?: 'customer' | 'provider' | null;
  t: Translator;
  locale: Locale;
  intro: React.ReactNode;
  sectionModel?: WorkspaceSectionRenderModel | null;
  asideTopSlot?: React.ReactNode;
  overviewDecisionPanelRef?: React.Ref<HTMLElement>;
  workspaceAsideBaseProps: WorkspaceAsideBaseProps;
  pendingFavoriteProviderIds: Set<string>;
  onToggleProviderFavorite: (providerId: string) => void;
};

function decorateWorkspacePublicIntro({
  intro,
  activeSection,
  isDesktop,
}: {
  intro: React.ReactNode;
  activeSection: WorkspaceSectionKey;
  isDesktop: boolean;
}) {
  if (!React.isValidElement(intro)) return intro;
  const decoration = resolveWorkspacePublicIntroDecorations({
    section: activeSection,
    isDesktop,
  });

  return React.cloneElement(
    intro as React.ReactElement<{
      showDemandMap?: boolean;
      showQuickAction?: boolean;
    }>,
    {
      showDemandMap: decoration.showDemandMap,
      showQuickAction: decoration.showQuickAction,
    },
  );
}

export const WorkspacePageLayout = React.memo(function WorkspacePageLayout({
  isWorkspacePublicSection,
  isWorkspaceAuthed,
  activePublicSection,
  activeWorkspaceTab,
  preferredRequestsRole = null,
  t,
  locale,
  intro,
  sectionModel,
  asideTopSlot,
  overviewDecisionPanelRef,
  workspaceAsideBaseProps,
  pendingFavoriteProviderIds,
  onToggleProviderFavorite,
}: Props) {
  const isDesktop = useIsDesktop();
  const isWideShell = useWorkspaceWideShell();
  const hasCompactSidebar = useMediaMatch('(min-width: 768px)');
  const isMobile = useMediaMatch('(max-width: 767px)');
  const publicShellIntro = React.useMemo(
    () =>
      decorateWorkspacePublicIntro({
        intro,
        activeSection: activePublicSection ?? 'requests',
        isDesktop,
      }),
    [activePublicSection, intro, isDesktop],
  );

  const workspaceSidebar = isWideShell ? (
    <WorkspaceSidebar
      t={t}
      locale={locale}
      activePublicSection={activePublicSection}
      activeWorkspaceTab={activeWorkspaceTab}
      preferredRequestsRole={preferredRequestsRole}
    />
  ) : hasCompactSidebar ? (
    <WorkspaceSidebar
      t={t}
      locale={locale}
      activePublicSection={activePublicSection}
      activeWorkspaceTab={activeWorkspaceTab}
      preferredRequestsRole={preferredRequestsRole}
      variant="compact"
    />
  ) : null;
  const workspaceTopBar = isMobile ? null : (
    <WorkspaceTopBar
      compactUtility={!isWideShell}
    />
  );

  const resolvedSectionModel = sectionModel ?? null;

  if (!resolvedSectionModel) {
    return null;
  }

  const isOverviewSection = resolvedSectionModel.section === 'overview';

  const contextualRail = (
    <WorkspaceContextRail
      t={t}
      locale={locale}
      activePublicSection={activePublicSection}
      activeWorkspaceTab={activeWorkspaceTab}
      preferredRequestsRole={preferredRequestsRole}
      className={resolvedSectionModel.contextualAiRailClassName}
      useStatisticsLayout={resolvedSectionModel.contextualAiRailUsesStatisticsLayout ?? true}
      topSlot={asideTopSlot}
      panelRef={isOverviewSection ? overviewDecisionPanelRef : undefined}
    >
      {!isOverviewSection ? (
        <WorkspaceTopProvidersAside
          {...workspaceAsideBaseProps}
          ctaHref={
            isWorkspaceAuthed ? '/workspace?section=requests' : '/workspace?section=providers'
          }
          pendingFavoriteProviderIds={pendingFavoriteProviderIds}
          onToggleFavorite={onToggleProviderFavorite}
        />
      ) : null}
    </WorkspaceContextRail>
  );

  const overlayNavigationMode = isWideShell ? null : (isMobile ? 'bottomDock' : 'drawer');
  const workspaceMobileNavigation = overlayNavigationMode ? (
    <WorkspaceMobileNavigation
      mode={overlayNavigationMode}
      locale={locale}
      activePublicSection={activePublicSection}
      activeWorkspaceTab={activeWorkspaceTab}
      preferredRequestsRole={preferredRequestsRole}
    />
  ) : null;

  const resolvedIntro =
    isWorkspacePublicSection && resolvedSectionModel.layout === 'singleColumn'
      ? publicShellIntro
      : intro;
  const shouldUseContextualRail =
    resolvedSectionModel.layout !== 'singleColumn'
      && resolvedSectionModel.railPolicy !== 'none'
      && resolvedSectionModel.aiRail == null;
  const resolvedAiRail =
    shouldUseContextualRail
      ? contextualRail
      : (resolvedSectionModel.layout === 'singleColumn' ? undefined : resolvedSectionModel.aiRail);
  const resolvedFilters =
    resolvedSectionModel.filters
    ?? (resolvedSectionModel.filterPolicy === 'sharedContext' ? (
      <WorkspaceSectionSharedContext
        locale={locale}
        activePublicSection={activePublicSection}
        activeWorkspaceTab={activeWorkspaceTab}
        preferredRequestsRole={preferredRequestsRole}
      />
    ) : undefined);

  return (
    <WorkspaceShell
      topBar={workspaceTopBar}
      intro={resolvedIntro}
      filters={resolvedFilters}
      sidebar={workspaceSidebar}
      aiRail={resolvedAiRail}
      bottomNav={workspaceMobileNavigation}
      frameClassName={resolvedSectionModel.frameClassName}
      contentClassName={resolvedSectionModel.contentClassName}
    >
      <>
        {resolvedSectionModel.content}
        <ConsentManageFooter />
      </>
    </WorkspaceShell>
  );
});
