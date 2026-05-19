import { cn } from '@/lib/utils/cn';

type WorkspaceShellClassValue = string | false | null | undefined;
export type WorkspaceSurfaceVariant = 'card' | 'panel' | 'rightRail' | 'muted' | 'elevated';

const WORKSPACE_SURFACE_CLASS_MAP: Record<WorkspaceSurfaceVariant, string> = {
  card:
    'rounded-[var(--dc-radius-lg)] border border-[var(--dc-border-soft)] bg-[var(--dc-surface)] shadow-[var(--dc-shadow-card)]',
  panel:
    'rounded-[var(--dc-radius-xl)] border border-[var(--dc-border)] bg-[var(--dc-surface)] shadow-[var(--dc-shadow-panel)]',
  rightRail:
    'rounded-[var(--dc-radius-lg)] border border-[var(--dc-border-soft)] bg-[var(--dc-surface)] shadow-[var(--surface-right-rail-shadow)]',
  muted:
    'rounded-[var(--dc-radius-lg)] border border-[var(--dc-border-soft)] bg-[var(--dc-surface-muted)]',
  elevated:
    'rounded-[var(--dc-radius-xl)] border border-[var(--dc-border)] bg-[var(--dc-surface)] shadow-[var(--dc-shadow-panel)]',
};

export function workspaceSurfaceShell(
  variant: WorkspaceSurfaceVariant,
  ...classNames: WorkspaceShellClassValue[]
) {
  return cn(WORKSPACE_SURFACE_CLASS_MAP[variant], ...classNames);
}

export function workspacePanelShell(...classNames: WorkspaceShellClassValue[]) {
  return cn('panel', workspaceSurfaceShell('panel'), ...classNames);
}

export function workspaceRequestsPanelShell(...classNames: WorkspaceShellClassValue[]) {
  return workspacePanelShell('requests-panel', ...classNames);
}

export function workspaceCardShell(...classNames: WorkspaceShellClassValue[]) {
  return cn('card', workspaceSurfaceShell('card'), ...classNames);
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
  return cn('card', workspaceSurfaceShell('elevated'), ...classNames);
}

export function workspaceStatsChartPanelShell(...classNames: WorkspaceShellClassValue[]) {
  return workspacePanelShell('requests-stats-chart', ...classNames);
}
