'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { WorkspaceExploreSection, WorkspaceFrame, WorkspaceTopProvidersAside } from '@/features/workspace/requests';
import type { WorkspaceTab } from '@/features/workspace/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { ProofCase } from '@/types/home';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import {
  WorkspaceContextAside,
  WorkspaceModeHeader,
} from '@/features/workspace/shell/WorkspaceEnvironmentChrome';
import { isWorkspaceTab } from '@/features/workspace/requests';
import { isWorkspaceOverviewMode } from '@/features/workspace/shell/workspaceModes';

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
  explore: ExploreProps;
  privateMain: React.ReactNode;
  publicMain: React.ReactNode;
  privateAside?: React.ReactNode;
  asideTopSlot?: React.ReactNode;
  overviewDecisionPanelRef?: React.Ref<HTMLElement>;
  workspaceAsideBaseProps: WorkspaceAsideBaseProps;
  pendingFavoriteProviderIds: Set<string>;
  onToggleProviderFavorite: (providerId: string) => void;
};

export const WorkspacePageLayout = React.memo(function WorkspacePageLayout({
  isWorkspacePublicSection,
  isWorkspaceAuthed,
  activePublicSection,
  activeWorkspaceTab,
  preferredRequestsRole = null,
  t,
  locale,
  intro,
  explore,
  privateMain,
  publicMain,
  privateAside,
  asideTopSlot,
  overviewDecisionPanelRef,
  workspaceAsideBaseProps,
  pendingFavoriteProviderIds,
  onToggleProviderFavorite,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOverviewPrivateMode =
    !isWorkspacePublicSection &&
    isWorkspaceOverviewMode({
      activePublicSection,
      activeWorkspaceTab,
      pathname,
      sectionParam: searchParams.get('section'),
      hasExplicitWorkspaceTab: isWorkspaceTab(searchParams.get('tab')),
    });
  const overviewFrameClassName = isOverviewPrivateMode ? 'workspace-frame__flow--overview' : undefined;
  const overviewGridClassName = isOverviewPrivateMode ? 'workspace-frame--overview' : undefined;

  const introWithWorkspaceChrome = React.useMemo(() => {
    if (!React.isValidElement(intro)) return intro;

    return React.cloneElement(
      intro as React.ReactElement<{
        navHeaderSlot?: React.ReactNode;
        leftColumnSlot?: React.ReactNode;
      }>,
      {
        navHeaderSlot: (
          <WorkspaceModeHeader
            t={t}
            locale={locale}
            activePublicSection={activePublicSection}
            activeWorkspaceTab={activeWorkspaceTab}
            preferredRequestsRole={preferredRequestsRole}
          />
        ),
      },
    );
  }, [activePublicSection, activeWorkspaceTab, intro, locale, t]);

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
          ctaHref={isWorkspaceAuthed ? '/workspace?section=requests' : '/workspace?section=providers'}
          pendingFavoriteProviderIds={pendingFavoriteProviderIds}
          onToggleFavorite={onToggleProviderFavorite}
        />
      ) : null}
    </WorkspaceContextAside>
  );

  if (isWorkspacePublicSection) {
    return (
      <WorkspaceExploreSection
        intro={introWithWorkspaceChrome}
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
      />
    );
  }

  if (isWorkspaceAuthed) {
    return (
      <WorkspaceFrame
        intro={introWithWorkspaceChrome}
        main={privateMain}
        aside={privateAside ?? contextualAside}
        frameClassName={overviewGridClassName}
        contentClassName={overviewFrameClassName}
      />
    );
  }

  return (
    <WorkspaceFrame
      intro={introWithWorkspaceChrome}
      main={publicMain}
      aside={contextualAside}
      frameClassName={overviewGridClassName}
      contentClassName={overviewFrameClassName}
    />
  );
});
