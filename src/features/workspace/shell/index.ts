export { WorkspaceBottomNav } from '@/features/workspace/shell/WorkspaceBottomNav';
export { WorkspaceContextAside, WorkspaceContextFocusPanel } from '@/features/workspace/shell/WorkspaceContextFocusPanel';
export { WorkspacePageFrame } from '@/features/workspace/shell/WorkspacePageFrame';
export { WorkspaceModeHeader, WorkspaceMobileContextSection } from '@/features/workspace/shell/WorkspaceModeHeader';
export { WorkspacePageLayout } from '@/features/workspace/shell/WorkspacePageLayout';
export { WorkspaceResponsiveFrame } from '@/features/workspace/shell/WorkspaceResponsiveFrame';
export { WorkspaceShell } from '@/features/workspace/shell/WorkspaceShell';
export { WorkspaceSharedContextControls } from '@/features/workspace/shell/WorkspaceSharedContextControls';
export {
  buildSharedContextControlsProps,
  fillWorkspaceModeTemplate,
  getWorkspaceChipValue,
  joinWorkspaceContext,
  useWorkspaceSharedContext,
} from '@/features/workspace/shell/useWorkspaceSharedContext';
export { WorkspaceTopbar } from '@/features/workspace/shell/WorkspaceTopbar';
export { resolveActiveWorkspaceMode } from '@/features/workspace/navigation/resolveActiveWorkspaceMode';
export type { WorkspaceModeKey } from '@/features/workspace/navigation/resolveActiveWorkspaceMode';
export type {
  WorkspaceBottomNavProps,
  WorkspacePageFrameProps,
  WorkspaceResponsiveFrameProps,
  WorkspaceSectionLayout,
  WorkspaceSectionRenderModel,
  WorkspaceShellProps,
  WorkspaceSidebarProps,
  WorkspaceTopbarProps,
} from '@/features/workspace/shell/WorkspaceShell.types';
