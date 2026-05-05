'use client';

import type { buildWorkspaceDataQueries } from '@/features/workspace/requests/workspaceData.queries';
import { useWorkspaceLegacyOfferData } from '@/features/workspace/requests/useWorkspaceLegacyOfferData';
import { useWorkspaceLegacyProviderSupportData } from '@/features/workspace/requests/useWorkspaceLegacyProviderSupportData';
import { useWorkspaceLegacyRequestSupportData } from '@/features/workspace/requests/useWorkspaceLegacyRequestSupportData';

type WorkspaceDataQueries = ReturnType<typeof buildWorkspaceDataQueries>;

type Args = {
  workspaceDataQueries: WorkspaceDataQueries;
  locale: string;
  shouldLoadOfferRequests: boolean;
};

export function useWorkspaceLegacyPrivateData({
  workspaceDataQueries,
  locale,
  shouldLoadOfferRequests,
}: Args) {
  const legacyOfferData = useWorkspaceLegacyOfferData({
    workspaceDataQueries,
    locale,
    shouldLoadOfferRequests,
  });
  const legacyRequestSupportData = useWorkspaceLegacyRequestSupportData({
    workspaceDataQueries,
  });
  const legacyProviderSupportData = useWorkspaceLegacyProviderSupportData({
    workspaceDataQueries,
  });

  return {
    ...legacyOfferData,
    ...legacyRequestSupportData,
    ...legacyProviderSupportData,
  };
}
