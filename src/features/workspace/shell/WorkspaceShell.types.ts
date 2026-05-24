'use client';

import type { ReactNode } from 'react';

import type { WorkspaceNavigationSection } from '@/features/workspace/navigation/workspaceNavigation.config';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceTab } from '@/features/workspace/state';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

export type WorkspaceTranslator = (key: I18nKey) => string;

export type WorkspaceResponsiveContextProps = {
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  preferredRequestsRole?: 'customer' | 'provider' | null;
};

export type WorkspaceSidebarProps = WorkspaceResponsiveContextProps & {
  t: WorkspaceTranslator;
  activeNavigationSection?: WorkspaceNavigationSection | null;
};

export type WorkspaceBottomNavProps = WorkspaceResponsiveContextProps;

export type WorkspacePageFrameProps = {
  topBar?: ReactNode;
  intro?: ReactNode;
  filters?: ReactNode;
  main: ReactNode;
  aiRail?: ReactNode;
  sidebar?: ReactNode;
  frameClassName?: string;
  contentClassName?: string;
};

export type WorkspaceSectionLayout = 'default' | 'singleColumn' | 'withRail';
export type WorkspaceSectionRailPolicy = 'contextual' | 'custom' | 'none';
export type WorkspaceSectionHeaderPolicy = 'workspace' | 'custom';
export type WorkspaceSectionFilterPolicy = 'sharedContext' | 'none';

export type WorkspaceSectionRenderModel = {
  section: PublicWorkspaceSection | 'overview';
  title?: string;
  subtitle?: string;
  headerAccessory?: ReactNode;
  filters?: ReactNode;
  content: ReactNode;
  aiRail?: ReactNode;
  layout?: WorkspaceSectionLayout;
  railPolicy?: WorkspaceSectionRailPolicy;
  headerPolicy?: WorkspaceSectionHeaderPolicy;
  filterPolicy?: WorkspaceSectionFilterPolicy;
};

export type WorkspaceShellProps = {
  children: ReactNode;
  topBar?: ReactNode;
  intro?: ReactNode;
  filters?: ReactNode;
  sidebar?: ReactNode;
  aiRail?: ReactNode;
  bottomNav?: ReactNode;
  frameClassName?: string;
  contentClassName?: string;
};
