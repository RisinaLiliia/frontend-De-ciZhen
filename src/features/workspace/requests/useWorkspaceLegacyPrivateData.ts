'use client';

import type { buildWorkspaceDataQueries } from '@/features/workspace/requests/workspaceData.queries';
import { useWorkspaceLegacyProviderSupportData } from '@/features/workspace/requests/useWorkspaceLegacyProviderSupportData';
import { useWorkspaceLegacyRequestSupportData } from '@/features/workspace/requests/useWorkspaceLegacyRequestSupportData';

type WorkspaceDataQueries = ReturnType<typeof buildWorkspaceDataQueries>;

type Args = {
  workspaceDataQueries: WorkspaceDataQueries;
};

export function useWorkspaceLegacyPrivateData({
  workspaceDataQueries,
}: Args) {
  const legacyRequestSupportData = useWorkspaceLegacyRequestSupportData({
    workspaceDataQueries,
  });
  const legacyProviderSupportData = useWorkspaceLegacyProviderSupportData({
    workspaceDataQueries,
  });

  return {
    ...legacyRequestSupportData,
    ...legacyProviderSupportData,
  };
}
