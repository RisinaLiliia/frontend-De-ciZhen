export { WorkspaceContextAside, WorkspaceContextFocusPanel } from '@/features/workspace/shell/WorkspaceContextFocusPanel';
export { WorkspaceModeHeader, WorkspaceMobileContextSection } from '@/features/workspace/shell/WorkspaceModeHeader';
export { WorkspacePageLayout } from '@/features/workspace/shell/WorkspacePageLayout';
export { WorkspaceSharedContextControls } from '@/features/workspace/shell/WorkspaceSharedContextControls';
export {
  buildSharedContextControlsProps,
  fillWorkspaceModeTemplate,
  getWorkspaceChipValue,
  joinWorkspaceContext,
  useWorkspaceSharedContext,
} from '@/features/workspace/shell/useWorkspaceSharedContext';
export { resolveActiveWorkspaceMode } from '@/features/workspace/shell/workspaceModes';
export type { WorkspaceModeKey } from '@/features/workspace/shell/workspaceModes';
export { WorkspaceTopBar } from './WorkspaceTopBar';