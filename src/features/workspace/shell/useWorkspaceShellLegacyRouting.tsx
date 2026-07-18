'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  buildLegacyWorkspaceTabRedirectHref,
  buildWorkspaceRequestsScopeHref,
  isWorkspaceTab,
  type WorkspaceTab,
} from '@/features/workspace/state';
import {
  resolveCanonicalWorkspaceSection,
  resolvePublicWorkspaceSection,
  type PublicWorkspaceSection,
} from '@/features/workspace/navigation/resolveActiveWorkspaceSection';

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

  const sectionParam = searchParams.get('section');
  const tabParam = searchParams.get('tab');
  const isOverviewRoute = sectionParam === 'overview';
  const hasExplicitWorkspaceTab = isWorkspaceTab(tabParam);
  const canonicalSection = resolveCanonicalWorkspaceSection(sectionParam);
  const resolvedSection = resolvePublicWorkspaceSection(sectionParam);
  const isGuestChatSection = authStatus === 'unauthenticated' && resolvedSection === 'chat';

  React.useEffect(() => {
    if (!sectionParam) return;
    if (!canonicalSection) return;
    if (sectionParam === canonicalSection) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('section', canonicalSection);
    const nextQuery = nextParams.toString();

    router.replace(nextQuery ? `/workspace?${nextQuery}` : '/workspace', { scroll: false });
  }, [canonicalSection, router, searchParams, sectionParam]);

  React.useEffect(() => {
    if (!hasExplicitWorkspaceTab) return;
    if (authStatus === 'authenticated') {
      router.replace(
        buildLegacyWorkspaceTabRedirectHref({
          currentSearch: searchParams,
        }),
        { scroll: false },
      );
      return;
    }
    if (authStatus !== 'unauthenticated') return;

    if (tabParam === 'my-requests' || tabParam === 'my-offers' || tabParam === 'completed-jobs') {
      router.replace(
        buildWorkspaceRequestsScopeHref({
          currentSearch: searchParams,
          scope: 'market',
        }),
        { scroll: false },
      );
      return;
    }

    router.replace(
      buildLegacyWorkspaceTabRedirectHref({
        currentSearch: searchParams,
      }),
      { scroll: false },
    );
  }, [authStatus, hasExplicitWorkspaceTab, router, searchParams, tabParam]);

  React.useEffect(() => {
    if (authStatus !== 'unauthenticated') return;
    if (resolvedSection !== 'requests') return;
    if (searchParams.get('scope') !== 'my') return;

    router.replace(
      buildWorkspaceRequestsScopeHref({
        currentSearch: searchParams,
        scope: 'market',
      }),
      { scroll: false },
    );
  }, [authStatus, resolvedSection, router, searchParams]);

  React.useEffect(() => {
    if (!isGuestChatSection) return;

    const nextQuery = searchParams.toString();
    const nextPath = nextQuery ? `/workspace?${nextQuery}` : '/workspace?section=chat';
    router.replace(`/auth/login?next=${encodeURIComponent(nextPath)}`, { scroll: false });
  }, [isGuestChatSection, router, searchParams]);

  const activePublicSection = authStatus === 'loading' || authStatus === 'idle'
    ? (forcedPublicSection ?? resolvedSection ?? (isOverviewRoute ? null : 'requests'))
    : (forcedPublicSection
      ?? resolvedSection
      ?? (isOverviewRoute ? null : (authStatus === 'unauthenticated' ? 'requests' : null)));

  return {
    activePublicSection,
    resolvedPublicSection: forcedWorkspaceTab ? null : activePublicSection,
    isGuestChatSection,
  };
}
