'use client';

import { WorkspaceDecisionPanel, type WorkspaceDecisionPanelProps } from './WorkspaceDecisionPanel';

export type WorkspaceRequestsActionRailProps = Omit<WorkspaceDecisionPanelProps, 'isDecisionMode'> & {
  mode: 'default' | 'decision';
  className?: string;
};

export function WorkspaceRequestsActionRail({
  locale,
  summaryItems,
  panel,
  sidePanel,
  mode,
  activeRequestId,
  onStartDecisionMode,
  onOpenQueueItem,
  className,
  variant = 'private',
}: WorkspaceRequestsActionRailProps) {
  return (
    <div className={['my-requests-rail', className ?? ''].filter(Boolean).join(' ')}>
      <WorkspaceDecisionPanel
        locale={locale}
        summaryItems={summaryItems}
        panel={panel}
        sidePanel={sidePanel}
        isDecisionMode={mode === 'decision'}
        activeRequestId={activeRequestId}
        onStartDecisionMode={onStartDecisionMode}
        onOpenQueueItem={onOpenQueueItem}
        variant={variant}
      />
    </div>
  );
}
