'use client';

import type * as React from 'react';

import { WorkspaceExploreSection } from '@/features/workspace/explore';
import { buildWorkspaceSectionRenderModel } from '@/features/workspace/navigation/workspaceSection.contract';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceSectionRenderModel } from '@/features/workspace/shell/WorkspaceShell.types';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import type { ProofCase } from '@/types/home';

type ExploreSectionKey = Exclude<PublicWorkspaceSection, 'requests' | 'chat' | 'settings' | 'help'>;

type BuildWorkspacePublicRequestsSectionModelArgs = {
  content: React.ReactNode;
  aiRail?: React.ReactNode;
};

type BuildWorkspaceExploreSectionModelArgs = {
  branch: Pick<WorkspaceBranchProps, 'isWorkspaceAuthed' | 't' | 'locale'>;
  section: ExploreSectionKey;
  explore: {
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
  } | null;
};

type BuildWorkspaceOverviewSectionModelArgs = {
  content: React.ReactNode;
  aiRail?: React.ReactNode;
};

type BuildWorkspaceStandardSectionModelArgs = {
  section: PublicWorkspaceSection;
  content: React.ReactNode;
  aiRail?: React.ReactNode;
};

type BuildWorkspaceChatSectionModelArgs = {
  content: React.ReactNode;
  aiRail: React.ReactNode;
};

type BuildWorkspaceSettingsSectionModelArgs = {
  content: React.ReactNode;
};

type BuildWorkspaceProfileSectionModelArgs = {
  content: React.ReactNode;
};

type BuildWorkspaceHelpSectionModelArgs = {
  content: React.ReactNode;
};

export function resolveWorkspaceExploreSection(
  section: PublicWorkspaceSection | null,
): ExploreSectionKey {
  if (section === 'providers' || section === 'stats' || section === 'profile') {
    return section;
  }

  return 'providers';
}

export function resolveWorkspaceStandardSection(
  section: PublicWorkspaceSection | null,
): PublicWorkspaceSection {
  return section ?? 'requests';
}

export function buildWorkspacePublicRequestsSectionModel({
  content,
  aiRail,
}: BuildWorkspacePublicRequestsSectionModelArgs): WorkspaceSectionRenderModel {
  return buildWorkspaceSectionRenderModel({
    section: 'requests',
    content,
    aiRail,
  });
}

export function buildWorkspaceExploreSectionModel({
  branch,
  section,
  explore,
}: BuildWorkspaceExploreSectionModelArgs): WorkspaceSectionRenderModel {
  return buildWorkspaceSectionRenderModel({
    section,
    content: explore ? (
      <WorkspaceExploreSection
        activeSection={section}
        isWorkspaceAuthed={branch.isWorkspaceAuthed}
        t={branch.t}
        locale={branch.locale}
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
    ) : null,
  });
}

export function buildWorkspaceOverviewSectionModel({
  content,
  aiRail,
}: BuildWorkspaceOverviewSectionModelArgs): WorkspaceSectionRenderModel {
  return buildWorkspaceSectionRenderModel({
    section: 'overview',
    content,
    aiRail,
  });
}

export function buildWorkspaceStandardSectionModel({
  section,
  content,
  aiRail,
}: BuildWorkspaceStandardSectionModelArgs): WorkspaceSectionRenderModel {
  return buildWorkspaceSectionRenderModel({
    section,
    content,
    aiRail,
  });
}

export function buildWorkspaceChatSectionModel({
  content,
  aiRail,
}: BuildWorkspaceChatSectionModelArgs): WorkspaceSectionRenderModel {
  return buildWorkspaceSectionRenderModel({
    section: 'chat',
    content,
    aiRail,
    headerPolicy: 'custom',
    railPolicy: 'custom',
  });
}

export function buildWorkspaceSettingsSectionModel({
  content,
}: BuildWorkspaceSettingsSectionModelArgs): WorkspaceSectionRenderModel {
  return buildWorkspaceSectionRenderModel({
    section: 'settings',
    content,
    headerPolicy: 'custom',
    filterPolicy: 'none',
    railPolicy: 'none',
  });
}

export function buildWorkspaceProfileSectionModel({
  content,
}: BuildWorkspaceProfileSectionModelArgs): WorkspaceSectionRenderModel {
  return buildWorkspaceSectionRenderModel({
    section: 'profile',
    content,
    railPolicy: 'none',
  });
}

export function buildWorkspaceHelpSectionModel({
  content,
}: BuildWorkspaceHelpSectionModelArgs): WorkspaceSectionRenderModel {
  return buildWorkspaceSectionRenderModel({
    section: 'help',
    content,
    headerPolicy: 'custom',
    filterPolicy: 'none',
    railPolicy: 'none',
  });
}
