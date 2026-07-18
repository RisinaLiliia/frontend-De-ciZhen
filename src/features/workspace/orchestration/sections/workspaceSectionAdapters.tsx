'use client';

import type * as React from 'react';

import {
  WorkspaceExploreSection,
} from '@/features/workspace/market';
import { buildWorkspaceSectionRenderModel } from '@/features/workspace/navigation/workspaceSection.contract';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import {
  WorkspaceProvidersRail,
  WorkspaceProvidersSection,
} from '@/features/workspace/providers';
import {
  WorkspaceReviewsAside,
  WorkspaceReviewsSection,
} from '@/features/workspace/reviews';
import {
  WorkspaceProfileRail,
  WorkspaceProfileSection,
} from '@/features/workspace/profile';
import { WorkspaceLegalSection } from '@/features/workspace/legal';
import type { WorkspaceSectionRenderModel } from '@/features/workspace/shell/WorkspaceShell.types';
import type { WorkspaceBranchProps } from '@/features/workspace/orchestration/workspacePage.types';
import { StatisticsExperience } from '@/features/workspace/stats';
import type { PublicRequestsResponseDto } from '@/lib/api/dto/requests';
import type { ProofCase } from '@/types/home';

type ExploreSectionKey = Exclude<
  PublicWorkspaceSection,
  'requests' | 'chat' | 'settings' | 'help' | 'privacy' | 'cookies'
>;
type LegalSectionKey = Extract<PublicWorkspaceSection, 'privacy' | 'cookies'>;

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

type BuildWorkspaceSettingsSectionModelArgs = {
  content: React.ReactNode;
};

type BuildWorkspaceHelpSectionModelArgs = {
  content: React.ReactNode;
};

type BuildWorkspaceLegalSectionModelArgs = {
  section: LegalSectionKey;
};

export function resolveWorkspaceExploreSection(
  section: PublicWorkspaceSection | null,
): ExploreSectionKey {
  if (section === 'providers' || section === 'stats' || section === 'reviews' || section === 'profile') {
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
  if (section === 'stats') {
    return buildWorkspaceSectionRenderModel({
      section,
      content: (
        <StatisticsExperience
          isWorkspaceAuthed={branch.isWorkspaceAuthed}
          t={branch.t}
          locale={branch.locale}
          slot="content"
        />
      ),
      aiRail: (
        <StatisticsExperience
          isWorkspaceAuthed={branch.isWorkspaceAuthed}
          t={branch.t}
          locale={branch.locale}
          slot="rail"
        />
      ),
      layout: 'withRail',
    });
  }

  if (section === 'providers') {
    return buildWorkspaceSectionRenderModel({
      section,
      content: explore ? (
        <WorkspaceProvidersSection
          t={branch.t}
          locale={branch.locale}
          onListDensityChange={explore.setExploreListDensity}
        />
      ) : null,
      aiRail: <WorkspaceProvidersRail t={branch.t} locale={branch.locale} />,
    });
  }

  if (section === 'reviews') {
    return buildWorkspaceSectionRenderModel({
      section,
      content: <WorkspaceReviewsSection t={branch.t} locale={branch.locale} />,
      aiRail: <WorkspaceReviewsAside t={branch.t} locale={branch.locale} />,
    });
  }

  if (section === 'profile') {
    return buildWorkspaceSectionRenderModel({
      section,
      content: <WorkspaceProfileSection />,
      aiRail: <WorkspaceProfileRail t={branch.t} locale={branch.locale} />,
      filterPolicy: 'none',
    });
  }

  

  return buildWorkspaceSectionRenderModel({
    section,
    content: explore ? (
      <WorkspaceExploreSection
        t={branch.t}
        locale={branch.locale}
        onListDensityChange={explore.setExploreListDensity}
        initialPublicRequests={explore.initialPublicRequests}
        preferInitialPublicRequests={explore.preferInitialPublicRequests}
        initialPublicRequestsLoading={explore.initialPublicRequestsLoading}
        initialPublicRequestsError={explore.initialPublicRequestsError}
      />
    ) : null,
aiRail: undefined,
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
    frameClassName: 'workspace-frame--overview',
    contentClassName: 'workspace-frame__flow--overview',
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

export function buildWorkspaceLegalSectionModel({
  section,
}: BuildWorkspaceLegalSectionModelArgs): WorkspaceSectionRenderModel {
  return buildWorkspaceSectionRenderModel({
    section,
    content: <WorkspaceLegalSection type={section === 'privacy' ? 'privacy' : 'cookies'} />,
    headerPolicy: 'custom',
    filterPolicy: 'none',
    railPolicy: 'none',
  });
}
