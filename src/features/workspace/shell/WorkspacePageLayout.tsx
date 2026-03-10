'use client';

import * as React from 'react';

import { WorkspaceExploreSection, WorkspaceFrame, WorkspaceTopProvidersAside } from '@/features/workspace/requests';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import type { ProofCase } from '@/types/home';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';

type Translator = (key: I18nKey) => string;

type WorkspaceAsideBaseProps = Omit<
  React.ComponentProps<typeof WorkspaceTopProvidersAside>,
  'ctaHref' | 'pendingFavoriteProviderIds' | 'onToggleFavorite'
>;

type ExploreProps = {
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
  t: Translator;
  locale: Locale;
  intro: React.ReactNode;
  explore: ExploreProps;
  privateMain: React.ReactNode;
  publicMain: React.ReactNode;
  workspaceAsideBaseProps: WorkspaceAsideBaseProps;
  pendingFavoriteProviderIds: Set<string>;
  onToggleProviderFavorite: (providerId: string) => void;
};

export function WorkspacePageLayout({
  isWorkspacePublicSection,
  isWorkspaceAuthed,
  activePublicSection,
  t,
  locale,
  intro,
  explore,
  privateMain,
  publicMain,
  workspaceAsideBaseProps,
  pendingFavoriteProviderIds,
  onToggleProviderFavorite,
}: Props) {
  if (isWorkspacePublicSection) {
    return (
      <WorkspaceExploreSection
        intro={intro}
        activeSection={activePublicSection ?? 'requests'}
        t={t}
        locale={locale}
        onListDensityChange={explore.setExploreListDensity}
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
        intro={intro}
        main={privateMain}
        aside={(
          <WorkspaceTopProvidersAside
            {...workspaceAsideBaseProps}
            ctaHref="/workspace?section=requests"
            pendingFavoriteProviderIds={pendingFavoriteProviderIds}
            onToggleFavorite={onToggleProviderFavorite}
          />
        )}
      />
    );
  }

  return (
    <WorkspaceFrame
      intro={intro}
      main={publicMain}
      aside={(
        <WorkspaceTopProvidersAside
          {...workspaceAsideBaseProps}
          ctaHref="/workspace?section=providers"
        />
      )}
    />
  );
}
