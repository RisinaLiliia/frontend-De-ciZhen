'use client';

import type * as React from 'react';

import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type {
  WorkspaceSectionLayout,
  WorkspaceSectionRenderModel,
} from '@/features/workspace/shell/WorkspaceShell.types';

export type WorkspaceSectionKey = PublicWorkspaceSection | 'overview';
export type WorkspaceSectionRailPolicy = 'contextual' | 'custom' | 'none';
export type WorkspaceSectionHeaderPolicy = 'workspace' | 'custom';
export type WorkspaceSectionFilterPolicy = 'sharedContext' | 'none';

export type WorkspaceSectionContract = {
  key: WorkspaceSectionKey;
  defaultLayout: WorkspaceSectionLayout;
  railPolicy: WorkspaceSectionRailPolicy;
  headerPolicy: WorkspaceSectionHeaderPolicy;
  filterPolicy: WorkspaceSectionFilterPolicy;
  intro: {
    hideDemandMapOnDesktop?: boolean;
    hideQuickActionOnDesktop?: boolean;
    hideDemandMapAlways?: boolean;
    hideQuickActionAlways?: boolean;
  };
};

type WorkspaceSectionRenderModelInput = {
  section: WorkspaceSectionKey;
  content: React.ReactNode;
  aiRail?: React.ReactNode;
  layout?: WorkspaceSectionLayout;
  title?: string;
  subtitle?: string;
  headerAccessory?: React.ReactNode;
  filters?: React.ReactNode;
  railPolicy?: WorkspaceSectionRailPolicy;
  headerPolicy?: WorkspaceSectionHeaderPolicy;
  filterPolicy?: WorkspaceSectionFilterPolicy;
};

const WORKSPACE_SECTION_CONTRACTS: Record<WorkspaceSectionKey, WorkspaceSectionContract> = {
  overview: {
    key: 'overview',
    defaultLayout: 'withRail',
    railPolicy: 'contextual',
    headerPolicy: 'workspace',
    filterPolicy: 'sharedContext',
    intro: {
      hideDemandMapAlways: true,
      hideQuickActionAlways: true,
    },
  },
  requests: {
    key: 'requests',
    defaultLayout: 'withRail',
    railPolicy: 'contextual',
    headerPolicy: 'workspace',
    filterPolicy: 'sharedContext',
    intro: {},
  },
  providers: {
    key: 'providers',
    defaultLayout: 'withRail',
    railPolicy: 'none',
    headerPolicy: 'workspace',
    filterPolicy: 'sharedContext',
    intro: {
      hideDemandMapAlways: true,
      hideQuickActionAlways: true,
    },
  },
  stats: {
    key: 'stats',
    defaultLayout: 'withRail',
    railPolicy: 'none',
    headerPolicy: 'workspace',
    filterPolicy: 'sharedContext',
    intro: {
      hideDemandMapAlways: true,
      hideQuickActionAlways: true,
    },
  },
  profile: {
    key: 'profile',
    defaultLayout: 'withRail',
    railPolicy: 'none',
    headerPolicy: 'workspace',
    filterPolicy: 'sharedContext',
    intro: {
      hideDemandMapAlways: true,
      hideQuickActionAlways: true,
    },
  },
  settings: {
    key: 'settings',
    defaultLayout: 'singleColumn',
    railPolicy: 'none',
    headerPolicy: 'custom',
    filterPolicy: 'none',
    intro: {
      hideDemandMapAlways: true,
      hideQuickActionAlways: true,
    },
  },
  help: {
    key: 'help',
    defaultLayout: 'singleColumn',
    railPolicy: 'none',
    headerPolicy: 'custom',
    filterPolicy: 'none',
    intro: {
      hideDemandMapAlways: true,
      hideQuickActionAlways: true,
    },
  },
  chat: {
    key: 'chat',
    defaultLayout: 'withRail',
    railPolicy: 'custom',
    headerPolicy: 'custom',
    filterPolicy: 'sharedContext',
    intro: {
      hideDemandMapAlways: true,
      hideQuickActionAlways: true,
    },
  },
};

export function getWorkspaceSectionContract(section: WorkspaceSectionKey): WorkspaceSectionContract {
  return WORKSPACE_SECTION_CONTRACTS[section];
}

export function buildWorkspaceSectionRenderModel({
  section,
  content,
  aiRail,
  layout,
  title,
  subtitle,
  headerAccessory,
  filters,
  railPolicy,
  headerPolicy,
  filterPolicy,
}: WorkspaceSectionRenderModelInput): WorkspaceSectionRenderModel {
  const contract = getWorkspaceSectionContract(section);
  const resolvedRailPolicy = railPolicy ?? (aiRail ? 'custom' : contract.railPolicy);

  return {
    section,
    title,
    subtitle,
    headerAccessory,
    filters,
    content,
    aiRail,
    layout: layout ?? contract.defaultLayout,
    railPolicy: resolvedRailPolicy,
    headerPolicy: headerPolicy ?? contract.headerPolicy,
    filterPolicy: filterPolicy ?? contract.filterPolicy,
  };
}

export function resolveWorkspacePublicIntroDecorations({
  section,
  isDesktop,
}: {
  section: WorkspaceSectionKey;
  isDesktop: boolean;
}) {
  const contract = getWorkspaceSectionContract(section);

  return {
    showDemandMap: contract.intro.hideDemandMapAlways
      ? false
      : !(isDesktop && contract.intro.hideDemandMapOnDesktop),
    showQuickAction: contract.intro.hideQuickActionAlways
      ? false
      : !(isDesktop && contract.intro.hideQuickActionOnDesktop),
  };
}
