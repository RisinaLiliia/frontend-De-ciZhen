'use client';

import { useDevRenderMetric } from '@/lib/perf/useDevRenderMetric';
import { WorkspacePageLayout } from '@/features/workspace';
import type { WorkspaceBranchProps } from '@/features/workspace/page/workspacePage.types';
import { useWorkspacePublicBranchModel } from '@/features/workspace/page/useWorkspacePublicBranchModel';

export function WorkspacePublicBranch(props: WorkspaceBranchProps) {
  const { workspaceLayoutProps, renderMetricPayload } = useWorkspacePublicBranchModel(props);

  useDevRenderMetric('workspace.public', () => renderMetricPayload);

  return <WorkspacePageLayout {...workspaceLayoutProps} />;
}
