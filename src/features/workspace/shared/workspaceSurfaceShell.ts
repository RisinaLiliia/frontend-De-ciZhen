import { cn } from '@/lib/utils/cn';

type WorkspaceShellClassValue = string | false | null | undefined;

const workspaceSurfaceBase =
  'border border-[var(--dc-border-soft)] bg-[var(--dc-surface)] shadow-[var(--dc-shadow-card)]';

const workspacePanelBase =
  'rounded-[var(--dc-radius-xl)] border border-[var(--dc-border)] bg-[var(--dc-surface)] shadow-[var(--dc-shadow-panel)]';

const workspaceMutedSurfaceBase =
  'border border-[var(--dc-border-soft)] bg-[var(--dc-surface-muted)]';

const workspaceRightRailBase =
  'rounded-[var(--dc-radius-lg)] border border-[var(--dc-border-soft)] bg-[var(--dc-surface)] shadow-[var(--dc-shadow-card)]';

const workspaceElevatedSurfaceBase =
  'border border-[var(--dc-border)] bg-[var(--dc-surface)] shadow-[var(--dc-shadow-panel)]';

export function workspacePanelShell(...classNames: WorkspaceShellClassValue[]) {
  return cn('panel', workspacePanelBase, ...classNames);
}

export function workspaceRequestsPanelShell(...classNames: WorkspaceShellClassValue[]) {
  return workspacePanelShell('requests-panel', ...classNames);
}

export function workspaceCardShell(...classNames: WorkspaceShellClassValue[]) {
  return cn('card', workspaceSurfaceBase, 'rounded-[var(--dc-radius-lg)]', ...classNames);
}

export function workspaceStatCardShell(...classNames: WorkspaceShellClassValue[]) {
  return cn('stat-card', workspaceMutedSurfaceBase, 'rounded-[var(--dc-radius-lg)]', ...classNames);
}

export function workspaceStatLinkCardShell(...classNames: WorkspaceShellClassValue[]) {
  return cn('stat-card', 'stat-link', workspaceMutedSurfaceBase, 'rounded-[var(--dc-radius-lg)]', ...classNames);
}

export function workspaceRightRailPanelShell(...classNames: WorkspaceShellClassValue[]) {
  return cn(workspaceRightRailBase, ...classNames);
}

export function workspaceMutedPanelShell(...classNames: WorkspaceShellClassValue[]) {
  return cn(workspaceMutedSurfaceBase, 'rounded-[var(--dc-radius-lg)]', ...classNames);
}

export function workspaceElevatedCardShell(...classNames: WorkspaceShellClassValue[]) {
  return cn('card', workspaceElevatedSurfaceBase, 'rounded-[var(--dc-radius-xl)]', ...classNames);
}

export function workspaceStatsChartPanelShell(...classNames: WorkspaceShellClassValue[]) {
  return workspacePanelShell('requests-stats-chart', ...classNames);
}