'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  type WorkspaceTab,
} from '@/features/workspace/state';
import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import { resolveWorkspaceRouteCompatibility } from '@/features/workspace/navigation/workspaceRouteCompatibility';

export type WorkspaceShellLegacyRoutingParams = {
  authStatus: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  forcedPublicSection?: PublicWorkspaceSection | null;
  forcedWorkspaceTab?: WorkspaceTab | null;
};

export function useWorkspaceShellLegacyRouting({
  authStatus,
  forcedPublicSection,
  forcedWorkspaceTab,
}: WorkspaceShellLegacyRoutingParams) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeCompatibility = React.useMemo(
    () => resolveWorkspaceRouteCompatibility({ searchParams, authStatus }),
    [authStatus, searchParams],
  );
  const normalizedResolvedSection =
    routeCompatibility.publicSection === 'overview' ? null : routeCompatibility.publicSection;
  const isGuestChatSection = routeCompatibility.isGuestChatRedirect;

  React.useEffect(() => {
    if (!routeCompatibility.redirectHref) return;
    router.replace(routeCompatibility.redirectHref, { scroll: false });
  }, [routeCompatibility.redirectHref, router]);

  const activePublicSection = authStatus === 'loading' || authStatus === 'idle'
    ? (forcedPublicSection ?? normalizedResolvedSection ?? (routeCompatibility.routeSection === 'overview' ? null : 'requests'))
    : (forcedPublicSection
      ?? normalizedResolvedSection
      ?? (routeCompatibility.routeSection === 'overview'
        ? null
        : (authStatus === 'unauthenticated' ? 'requests' : null)));

  return {
    activePublicSection,
    resolvedPublicSection: forcedWorkspaceTab ? null : activePublicSection,
    isGuestChatSection,
  };
}
