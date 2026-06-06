import { cn } from '@/lib/utils/cn';

type WorkspaceShellClassValue = string | false | null | undefined;
export type WorkspaceSurfaceVariant = 'card' | 'panel' | 'rightRail' | 'muted' | 'elevated';

const WORKSPACE_SURFACE_CLASS_MAP: Record<WorkspaceSurfaceVariant, string> = {
  card: 'app-card',
  panel: 'app-panel',
  rightRail: 'app-rail-panel',
  muted: 'app-muted',
  elevated: 'app-panel',
};

export function workspaceSurfaceShell(
  variant: WorkspaceSurfaceVariant,
  ...classNames: WorkspaceShellClassValue[]
) {
  return cn(WORKSPACE_SURFACE_CLASS_MAP[variant], ...classNames);
}

export function workspacePanelShell(...classNames: WorkspaceShellClassValue[]) {
  return cn(workspaceSurfaceShell('panel'), ...classNames);
}

export function workspaceRequestsPanelShell(...classNames: WorkspaceShellClassValue[]) {
  return workspacePanelShell('requests-panel', ...classNames);
}

export function workspaceCardShell(...classNames: WorkspaceShellClassValue[]) {
  return cn(workspaceSurfaceShell('card'), ...classNames);
}

export function workspaceStatCardShell(...classNames: WorkspaceShellClassValue[]) {
  return cn('stat-card', workspaceSurfaceShell('muted'), ...classNames);
}

export function workspaceStatLinkCardShell(...classNames: WorkspaceShellClassValue[]) {
  return cn('stat-card', 'stat-link', workspaceSurfaceShell('muted'), ...classNames);
}

export function workspaceRightRailPanelShell(...classNames: WorkspaceShellClassValue[]) {
  return cn(workspaceSurfaceShell('rightRail'), ...classNames);
}

export function workspaceMutedPanelShell(...classNames: WorkspaceShellClassValue[]) {
  return cn(workspaceSurfaceShell('muted'), ...classNames);
}

export function workspaceElevatedCardShell(...classNames: WorkspaceShellClassValue[]) {
  return cn(workspaceSurfaceShell('elevated'), ...classNames);
}

export function workspaceStatsChartPanelShell(...classNames: WorkspaceShellClassValue[]) {
  return workspacePanelShell('requests-stats-chart', ...classNames);
}
