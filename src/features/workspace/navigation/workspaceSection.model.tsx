'use client';

import type * as React from 'react';

import {
  IconBriefcase,
  IconChat,
  IconCheck,
  IconFilter,
  IconUser,
} from '@/components/ui/icons/icons';
import type { WorkspaceModeCopy } from '@/features/workspace/shell/workspaceEnvironment.copy';
import { buildModeHref } from '@/features/workspace/shell/workspaceEnvironment.copy';
import type { WorkspaceModeKey } from '@/features/workspace/navigation/resolveActiveWorkspaceMode';

export type WorkspaceModeItem = {
  key: WorkspaceModeKey;
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
};

type WorkspaceSectionDefinition = {
  key: WorkspaceModeKey;
  icon: React.ReactNode;
};

const WORKSPACE_SECTION_DEFINITIONS: ReadonlyArray<WorkspaceSectionDefinition> = [
  { key: 'overview', icon: <IconCheck /> },
  { key: 'requests', icon: <IconBriefcase /> },
  { key: 'providers', icon: <IconUser /> },
  { key: 'analysis', icon: <IconFilter /> },
  { key: 'profile', icon: <IconUser /> },
  { key: 'chat', icon: <IconChat /> },
];

export function buildWorkspaceModeItems({
  activeMode,
  copy,
  currentSearch,
}: {
  activeMode: WorkspaceModeKey;
  copy: WorkspaceModeCopy;
  currentSearch: string;
}): WorkspaceModeItem[] {
  return WORKSPACE_SECTION_DEFINITIONS.map((item) => ({
    key: item.key,
    label: copy.modes[item.key].label,
    description: copy.modes[item.key].description,
    href: buildModeHref({ currentSearch, mode: item.key }),
    icon: item.icon,
    isActive: activeMode === item.key,
  }));
}
