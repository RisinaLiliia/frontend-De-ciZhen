export { useWorkspaceRouteState } from './page/useWorkspaceRouteState';
export { WorkspacePageLayout } from './shell/WorkspacePageLayout';
export type { PublicWorkspaceSection } from './navigation/resolveActiveWorkspaceSection';
export { workspaceNavigationItems } from './navigation/workspaceNavigation.config';
export type { WorkspaceNavigationItem, WorkspaceNavigationSection } from './navigation/workspaceNavigation.config';
export {
  buildWorkspaceSectionRenderModel,
  getWorkspaceSectionContract,
  resolveWorkspacePublicIntroDecorations,
} from './navigation/workspaceSection.contract';
export type {
  WorkspaceSectionContract,
  WorkspaceSectionFilterPolicy,
  WorkspaceSectionHeaderPolicy,
  WorkspaceSectionKey,
  WorkspaceSectionRailPolicy,
} from './navigation/workspaceSection.contract';

export { PublicContent, ProofReviewCard, WorkspaceContent, WorkspacePrivateIntro, WorkspacePublicIntro } from './workspace.lazy';
export { WorkspaceOverviewInsightsPanel, WorkspaceOverviewMain } from './overview';
export { WorkspacePublicDemandMapPanel } from './demand-map';
export { StatisticsExperience, useWorkspaceStatisticsModel } from './stats';
export { WorkspaceProvidersRail, WorkspaceProvidersSection, WorkspaceTopProvidersAside } from './providers';
export { WorkspaceProfileRail, WorkspaceProfileSection } from './profile';
export {
  WorkspaceMobileNavigation,
  WorkspaceModeNav,
  WorkspacePageFrame,
  WorkspaceShell,
  WorkspaceSectionHeader,
  WorkspaceTopBar,
} from './shell';
export type {
  WorkspaceSectionLayout,
  WorkspaceSectionRenderModel,
} from './shell';

export {
  WorkspaceBadge,
  WorkspaceButton,
  WorkspaceFilterBar,
  WorkspaceRightRailPanel,
  useWorkspaceFormatters,
  workspaceCardShell,
  workspaceElevatedCardShell,
  workspaceMutedPanelShell,
  workspacePanelShell,
  workspaceRequestsPanelShell,
  workspaceRightRailPanelShell,
  workspaceStatCardShell,
  workspaceStatLinkCardShell,
  workspaceStatsChartPanelShell,
  workspaceSurfaceShell,
} from './shared';
export type {
  WorkspaceBadgeVariant,
  WorkspaceButtonSize,
  WorkspaceButtonVariant,
  WorkspaceSurfaceVariant,
} from './shared';

export { useExploreSidebar } from './explore/useExploreSidebar';
export { usePublicRequestsSeenTotal } from './explore/usePublicRequestsSeenTotal';

export { useWorkspaceTabPersistence } from './private/useWorkspaceTabPersistence';
export { useWorkspaceNavigation } from './private/useWorkspaceNavigation';
export { useWorkspaceActions } from './private/useWorkspaceActions';
export { useWorkspaceFavoriteToggles } from './private/useWorkspaceFavoriteToggles';
export { useWorkspaceCollections } from './private/useWorkspaceCollections';
export { useWorkspacePresentation } from './private/useWorkspacePresentation';
export { useWorkspaceContentData } from './private/useWorkspaceContentData';
export { WorkspaceMobilePrimaryAction } from './private/WorkspaceMobilePrimaryAction';

export { useWorkspacePublicFilters } from './public/useWorkspacePublicFilters';
export { useWorkspacePublicRequestsState } from './public/useWorkspacePublicRequestsState';
export { WORKSPACE_PUBLIC_CITY_ACTIVITY_FETCH_LIMIT, workspaceQK } from './data';

export type { WorkspaceTab } from './state';
