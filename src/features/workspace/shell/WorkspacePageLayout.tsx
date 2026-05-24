'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  resolveWorkspacePublicIntroDecorations,
  type WorkspaceSectionKey,
} from '@/features/workspace/navigation/workspaceSection.contract';
import {
  WorkspaceTopProvidersAside,
  useIsDesktop,
  useIsWideDesktop,
  useMediaMatch,
} from '@/features/workspace/shared';
import {
  buildWorkspaceExploreSectionModel,
  buildWorkspaceOverviewSectionModel,
  buildWorkspacePublicRequestsSectionModel,
  buildWorkspaceStandardSectionModel,
  resolveWorkspaceExploreSection,
  resolveWorkspaceStandardSection,
} from '@/features/workspace/page/sections/workspaceSectionAdapters';
import type { WorkspaceTab } from '@/features/workspace/state';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { ProofCase } from '@/types/home';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import { WorkspaceMobileNavigation } from '@/features/workspace/shell/WorkspaceMobileNavigation';
import { WorkspaceContextAside } from '@/features/workspace/shell/WorkspaceContextAside';
import { WorkspaceSectionSharedContext } from '@/features/workspace/shell/WorkspaceSectionSharedContext';
import { WorkspaceShell } from '@/features/workspace/shell/WorkspaceShell';
import { WorkspaceSidebar } from '@/features/workspace/shell/WorkspaceSidebar';
import { WorkspaceTopBar } from '@/features/workspace/shell/WorkspaceTopBar';
import type { WorkspaceSectionRenderModel } from '@/features/workspace/shell/WorkspaceShell.types';
import { isWorkspaceOverviewMode } from '@/features/workspace/navigation/resolveActiveWorkspaceMode';
import { isWorkspaceTab } from '@/features/workspace/state';

type Translator = (key: I18nKey) => string;

type WorkspaceAsideBaseProps = Omit<
  React.ComponentProps<typeof WorkspaceTopProvidersAside>,
  'ctaHref' | 'pendingFavoriteProviderIds' | 'onToggleFavorite'
>;

type ExploreProps = {
  exploreListDensity: 'single' | 'double';
  setExploreListDensity: (value: 'single' | 'double') => void;
  sidebarNearbyLimit: number;
  sidebarTopProvidersLimit: number;
  sidebarProofCases: ProofCase[];
  proofIndex: number;
  trustPanelClassName?: string;
  initialPublicRequests?: PublicRequestsResponseDto;
  preferInitialPublicRequests?: boolean;
  initialPublicRequestsLoading?: boolean;
  initialPublicRequestsError?: boolean;
};

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
  explore?: ExploreProps | null;
  privateMain?: React.ReactNode;
  publicMain?: React.ReactNode;
  privateAside?: React.ReactNode;
  publicAside?: React.ReactNode;
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
  explore,
  privateMain = null,
  publicMain = null,
  privateAside,
  publicAside,
  asideTopSlot,
  overviewDecisionPanelRef,
  workspaceAsideBaseProps,
  pendingFavoriteProviderIds,
  onToggleProviderFavorite,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop();
  const isWideDesktop = useIsWideDesktop();
  const isMobile = useMediaMatch('(max-width: 767px)');
  const isOverviewPrivateMode =
    !isWorkspacePublicSection &&
    isWorkspaceOverviewMode({
      activePublicSection,
      activeWorkspaceTab,
      pathname,
      sectionParam: searchParams.get('section'),
      hasExplicitWorkspaceTab: isWorkspaceTab(searchParams.get('tab')),
    });
  const publicShellIntro = React.useMemo(
    () =>
      decorateWorkspacePublicIntro({
        intro,
        activeSection: resolveWorkspaceStandardSection(activePublicSection),
        isDesktop,
      }),
    [activePublicSection, intro, isDesktop],
  );

  const workspaceSidebar = isDesktop && isWideDesktop ? (
    <WorkspaceSidebar
      t={t}
      locale={locale}
      activePublicSection={activePublicSection}
      activeWorkspaceTab={activeWorkspaceTab}
      preferredRequestsRole={preferredRequestsRole}
    />
  ) : null;
  const workspaceTopBar = isMobile ? null : (
    <WorkspaceTopBar
      showNavigationToggle={!isWideDesktop}
      compactUtility={!isWideDesktop}
    />
  );

  const resolvedSectionModel = React.useMemo<WorkspaceSectionRenderModel | null>(() => {
    if (sectionModel) {
      return sectionModel;
    }

    if (isWorkspacePublicSection && publicMain == null) {
      if (!explore) {
        return null;
      }

      return buildWorkspaceExploreSectionModel({
        branch: {
          isWorkspaceAuthed,
          t,
          locale,
        },
        section: resolveWorkspaceExploreSection(activePublicSection),
        explore,
      });
    }

    if (isWorkspacePublicSection) {
      if (resolveWorkspaceStandardSection(activePublicSection) === 'requests') {
        return buildWorkspacePublicRequestsSectionModel({
          content: publicMain,
          aiRail: publicAside,
        });
      }

      return buildWorkspaceStandardSectionModel({
        section: resolveWorkspaceStandardSection(activePublicSection),
        content: publicMain,
        aiRail: publicAside,
      });
    }

    if (isWorkspaceAuthed) {
      return isOverviewPrivateMode
        ? buildWorkspaceOverviewSectionModel({
          content: privateMain,
          aiRail: privateAside,
        })
        : buildWorkspaceStandardSectionModel({
          section: resolveWorkspaceStandardSection(activePublicSection),
          content: privateMain,
          aiRail: privateAside,
        });
    }

    return buildWorkspaceStandardSectionModel({
      section: resolveWorkspaceStandardSection(activePublicSection),
      content: publicMain,
    });
  }, [
    activePublicSection,
    explore,
    isOverviewPrivateMode,
    isWorkspaceAuthed,
    isWorkspacePublicSection,
    locale,
    privateAside,
    privateMain,
    publicAside,
    publicMain,
    sectionModel,
    t,
  ]);

  if (!resolvedSectionModel) {
    return null;
  }

  const contextualAside = (
    <WorkspaceContextAside
      t={t}
      locale={locale}
      activePublicSection={activePublicSection}
      activeWorkspaceTab={activeWorkspaceTab}
      preferredRequestsRole={preferredRequestsRole}
      className={resolvedSectionModel.contextualAiRailClassName}
      topSlot={asideTopSlot}
      panelRef={isOverviewPrivateMode ? overviewDecisionPanelRef : undefined}
    >
      {!isOverviewPrivateMode ? (
        <WorkspaceTopProvidersAside
          {...workspaceAsideBaseProps}
          ctaHref={
            isWorkspaceAuthed ? '/workspace?section=requests' : '/workspace?section=providers'
          }
          pendingFavoriteProviderIds={pendingFavoriteProviderIds}
          onToggleFavorite={onToggleProviderFavorite}
        />
      ) : null}
    </WorkspaceContextAside>
  );

  const overlayNavigationMode = isWideDesktop ? null : (isMobile ? 'bottomDock' : 'drawer');
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
      ? contextualAside
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
      {resolvedSectionModel.content}
    </WorkspaceShell>
  );
});
