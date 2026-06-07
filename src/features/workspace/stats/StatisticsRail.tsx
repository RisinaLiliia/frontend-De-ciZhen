'use client';

import { WorkspaceRightRailStack, WorkspaceUnifiedRail } from '@/features/workspace/shared';
import type { WorkspaceUnifiedRailModel } from '@/features/workspace/shared/WorkspaceUnifiedRail';

type StatisticsRailProps = {
  model: WorkspaceUnifiedRailModel;
  isLoading?: boolean;
};

export function StatisticsRail({ model, isLoading = false }: StatisticsRailProps) {
  return (
    <WorkspaceRightRailStack className="workspace-statistics__rail">
      <WorkspaceUnifiedRail model={model} isLoading={isLoading} />
    </WorkspaceRightRailStack>
  );
}
