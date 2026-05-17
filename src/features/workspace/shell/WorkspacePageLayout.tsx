'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  WorkspaceExploreSection,
  WorkspaceTopProvidersAside,
} from '@/features/workspace/requests';
import { useIsDesktop } from '@/features/workspace/requests/useIsDesktop';
import type { WorkspaceTab } from '@/features/workspace/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { ProofCase } from '@/types/home';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import { WorkspaceBottomNav } from '@/features/workspace/shell/WorkspaceBottomNav';
import { WorkspaceContextAside } from '@/features/workspace/shell/WorkspaceContextFocusPanel';
import { WorkspaceShell } from '@/features/workspace/shell/WorkspaceShell';
import { WorkspaceSidebar } from '@/features/workspace/shell/WorkspaceSidebar';
import { WorkspaceTopbar } from '@/features/workspace/shell/WorkspaceTopbar';
import type { WorkspaceSectionRenderModel } from '@/features/workspace/shell/WorkspaceShell.types';
import { isWorkspaceTab } from '@/features/workspace/requests';
import { isWorkspaceOverviewMode } from '@/features/workspace/navigation/resolveActiveWorkspaceMode';

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
  activeSection: PublicWorkspaceSection | null;
  isDesktop: boolean;
}) {
  if (!React.isValidElement(intro)) return intro;

  if (activeSection === 'stats') {
    return React.cloneElement(
      intro as React.ReactElement<{
        showDemandMap?: boolean;
      }>,
      {
        showDemandMap: false,
      },
    );
  }

  const shouldHideRailMirroredIntro =
    isDesktop && (activeSection === 'providers' || activeSection === 'actions');

  if (!shouldHideRailMirroredIntro) {
    return intro;
  }

  return React.cloneElement(
    intro as React.ReactElement<{
      showDemandMap?: boolean;
      showQuickAction?: boolean;
    }>,
    {
      showDemandMap: false,
      showQuickAction: false,
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
  const isOverviewPrivateMode =
    !isWorkspacePublicSection &&
    isWorkspaceOverviewMode({
      activePublicSection,
      activeWorkspaceTab,
      pathname,
      sectionParam: searchParams.get('section'),
      hasExplicitWorkspaceTab: isWorkspaceTab(searchParams.get('tab')),
    });
  const overviewFrameClassName = isOverviewPrivateMode
    ? 'workspace-frame__flow--overview'
    : undefined;
  const overviewGridClassName = isOverviewPrivateMode ? 'workspace-frame--overview' : undefined;
  const workspaceTopbar = (
    <WorkspaceTopbar
      t={t}
      locale={locale}
      activePublicSection={activePublicSection}
      activeWorkspaceTab={activeWorkspaceTab}
      preferredRequestsRole={preferredRequestsRole}
    />
  );
  const workspaceBottomNav = (
    <WorkspaceBottomNav
      locale={locale}
      activePublicSection={activePublicSection}
      activeWorkspaceTab={activeWorkspaceTab}
      preferredRequestsRole={preferredRequestsRole}
    />
  );
  const publicShellIntro = React.useMemo(
    () =>
      decorateWorkspacePublicIntro({
        intro,
        activeSection: activePublicSection,
        isDesktop,
      }),
    [activePublicSection, intro, isDesktop],
  );

  const workspaceSidebar = (
    <WorkspaceSidebar
      t={t}
      locale={locale}
      activePublicSection={activePublicSection}
      activeWorkspaceTab={activeWorkspaceTab}
      preferredRequestsRole={preferredRequestsRole}
    />
  );

  const contextualAside = (
    <WorkspaceContextAside
      t={t}
      locale={locale}
      activePublicSection={activePublicSection}
      activeWorkspaceTab={activeWorkspaceTab}
      preferredRequestsRole={preferredRequestsRole}
      className={isOverviewPrivateMode ? 'workspace-context-rail--overview' : undefined}
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

  const resolvedSectionModel = React.useMemo<WorkspaceSectionRenderModel | null>(() => {
    if (sectionModel) {
      return sectionModel;
    }

    if (isWorkspacePublicSection && publicMain == null) {
      if (!explore) {
        return null;
      }

      return {
        section: activePublicSection ?? 'requests',
        content: (
          <WorkspaceExploreSection
            activeSection={activePublicSection ?? 'requests'}
            isWorkspaceAuthed={isWorkspaceAuthed}
            t={t}
            locale={locale}
            onListDensityChange={explore.setExploreListDensity}
            exploreListDensity={explore.exploreListDensity}
            sidebarNearbyLimit={explore.sidebarNearbyLimit}
            sidebarTopProvidersLimit={explore.sidebarTopProvidersLimit}
            sidebarProofCases={explore.sidebarProofCases}
            proofIndex={explore.proofIndex}
            trustPanelClassName={explore.trustPanelClassName}
            initialPublicRequests={explore.initialPublicRequests}
            preferInitialPublicRequests={explore.preferInitialPublicRequests}
            initialPublicRequestsLoading={explore.initialPublicRequestsLoading}
            initialPublicRequestsError={explore.initialPublicRequestsError}
            renderIntro={false}
          />
        ),
        layout: 'singleColumn',
      };
    }

    if (isWorkspacePublicSection) {
      return {
        section: activePublicSection ?? 'requests',
        content: publicMain,
        aiRail: publicAside,
        layout: 'withRail',
      };
    }

    if (isWorkspaceAuthed) {
      return {
        section: isOverviewPrivateMode ? 'overview' : (activePublicSection ?? 'requests'),
        content: privateMain,
        aiRail: privateAside,
        layout: 'withRail',
      };
    }

    return {
      section: activePublicSection ?? 'requests',
      content: publicMain,
      layout: 'withRail',
    };
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

  const resolvedIntro =
    isWorkspacePublicSection && resolvedSectionModel.layout === 'singleColumn'
      ? publicShellIntro
      : intro;
  const resolvedAiRail =
    resolvedSectionModel.layout === 'singleColumn'
      ? undefined
      : (resolvedSectionModel.aiRail ?? contextualAside);

  return (
    <WorkspaceShell
      intro={resolvedIntro}
      topbar={workspaceTopbar}
      sidebar={workspaceSidebar}
      aiRail={resolvedAiRail}
      bottomNav={workspaceBottomNav}
      frameClassName={overviewGridClassName}
      contentClassName={overviewFrameClassName}
    >
      {resolvedSectionModel.content}
    </WorkspaceShell>
  );
});
