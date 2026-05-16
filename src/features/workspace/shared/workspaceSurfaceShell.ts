import { cn } from '@/lib/utils/cn';

type WorkspaceShellClassValue = string | false | null | undefined;

export function workspacePanelShell(...classNames: WorkspaceShellClassValue[]) {
  return cn('panel', ...classNames);
}

export function workspaceRequestsPanelShell(...classNames: WorkspaceShellClassValue[]) {
  return workspacePanelShell('requests-panel', ...classNames);
}

export function workspaceCardShell(...classNames: WorkspaceShellClassValue[]) {
  return cn('card', ...classNames);
}

export function workspaceStatCardShell(...classNames: WorkspaceShellClassValue[]) {
  return cn('stat-card', ...classNames);
}

export function workspaceStatLinkCardShell(...classNames: WorkspaceShellClassValue[]) {
  return cn('stat-card', 'stat-link', ...classNames);
}

export function workspaceStatsChartPanelShell(...classNames: WorkspaceShellClassValue[]) {
  return workspacePanelShell('requests-stats-chart', ...classNames);
}
