'use client';

import type { ReactNode } from 'react';

import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
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
};

export type WorkspaceTopbarProps = WorkspaceSidebarProps;

export type WorkspaceBottomNavProps = WorkspaceResponsiveContextProps;

export type WorkspaceResponsiveFrameProps = {
  children: ReactNode;
  bottomNav?: ReactNode;
};

export type WorkspacePageFrameProps = {
  intro?: ReactNode;
  main: ReactNode;
  aiRail?: ReactNode;
  sidebar?: ReactNode;
  frameClassName?: string;
  contentClassName?: string;
};

export type WorkspaceSectionLayout = 'default' | 'singleColumn' | 'withRail';

export type WorkspaceSectionRenderModel = {
  section: PublicWorkspaceSection | 'overview';
  title?: string;
  subtitle?: string;
  headerAccessory?: ReactNode;
  filters?: ReactNode;
  content: ReactNode;
  aiRail?: ReactNode;
  layout?: WorkspaceSectionLayout;
};

export type WorkspaceShellProps = {
  children: ReactNode;
  intro?: ReactNode;
  topbar?: ReactNode;
  sidebar?: ReactNode;
  aiRail?: ReactNode;
  bottomNav?: ReactNode;
  frameClassName?: string;
  contentClassName?: string;
};
