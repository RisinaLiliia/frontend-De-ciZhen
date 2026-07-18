'use client';

import {
  WorkspacePaginatedPanel,
  type WorkspacePaginatedPanelProps as RequestsPaginatedPanelProps,
} from '@/features/workspace/shared';

export function RequestsPaginatedPanel({
  ...props
}: RequestsPaginatedPanelProps) {
  return <WorkspacePaginatedPanel {...props} />;
}
