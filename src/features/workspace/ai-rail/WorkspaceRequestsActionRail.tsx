'use client';

import { workspaceRightRailPanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';
import { WorkspaceDecisionPanel, type WorkspaceDecisionPanelProps } from './WorkspaceDecisionPanel';

export type WorkspaceRequestsActionRailProps = Omit<WorkspaceDecisionPanelProps, 'isDecisionMode'> & {
  mode: 'default' | 'decision';
  className?: string;
};

export function WorkspaceRequestsActionRail({
  locale,
  panel,
  mode,
  activeRequestId,
  onStartDecisionMode,
  onOpenQueueItem,
  className,
  variant = 'private',
}: WorkspaceRequestsActionRailProps) {
  return (
    <div className={workspaceRightRailPanelShell('my-requests-rail', className)}>
      <WorkspaceDecisionPanel
        locale={locale}
        panel={panel}
        isDecisionMode={mode === 'decision'}
        activeRequestId={activeRequestId}
        onStartDecisionMode={onStartDecisionMode}
        onOpenQueueItem={onOpenQueueItem}
        variant={variant}
      />
    </div>
  );
}
