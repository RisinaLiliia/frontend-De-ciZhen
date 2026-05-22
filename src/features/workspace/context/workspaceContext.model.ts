'use client';

import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceTab } from '@/features/workspace/state';

type WorkspaceViewerMode = 'provider' | 'customer';

export type WorkspaceViewerModeToggleItem = {
  value: WorkspaceViewerMode;
  label: string;
  isActive: boolean;
};

export function shouldShowWorkspaceProfileViewerModeControl(params: {
  activeWorkspaceTab: WorkspaceTab;
  activePublicSection: PublicWorkspaceSection | null;
}) {
  return params.activeWorkspaceTab === 'profile' || params.activePublicSection === 'profile';
}

export function resolveWorkspaceViewerModeToggleItems(params: {
  viewerMode: WorkspaceViewerMode;
  providerLabel: string;
  customerLabel: string;
  invertLabels?: boolean;
}): WorkspaceViewerModeToggleItem[] {
  if (params.invertLabels) {
    return [
      {
        value: 'customer',
        label: params.providerLabel,
        isActive: params.viewerMode === 'customer',
      },
      {
        value: 'provider',
        label: params.customerLabel,
        isActive: params.viewerMode === 'provider',
      },
    ];
  }

  return [
    {
      value: 'provider',
      label: params.providerLabel,
      isActive: params.viewerMode === 'provider',
    },
    {
      value: 'customer',
      label: params.customerLabel,
      isActive: params.viewerMode === 'customer',
    },
  ];
}
